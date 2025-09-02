-- Check current policies and drop them all to start fresh
DROP POLICY IF EXISTS "Anonymous users can view public resumes with filtered data" ON public.resumes;
DROP POLICY IF EXISTS "Authenticated users can view their own full resume data" ON public.resumes;
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;

-- Drop the existing view and function if they exist
DROP VIEW IF EXISTS public.public_resumes;
DROP FUNCTION IF EXISTS public.get_public_resume_by_token(uuid);

-- Recreate the filtering function without SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.filter_sensitive_resume_data(resume_row public.resumes)
RETURNS TABLE(
  id uuid,
  title text,
  personal_info jsonb,
  summary text,
  experience jsonb,
  education jsonb,
  skills jsonb,
  template_name text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  is_public boolean,
  share_token uuid
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  filtered_personal_info jsonb;
  filtered_location text;
BEGIN
  -- Extract and generalize location if it exists
  IF resume_row.personal_info ? 'location' THEN
    filtered_location := split_part(resume_row.personal_info->>'location', ',', 1);
    IF length(filtered_location) > 50 THEN
      filtered_location := 'Location Available';
    END IF;
  ELSE
    filtered_location := NULL;
  END IF;
  
  -- Create filtered personal info with only safe fields (removes email and phone)
  filtered_personal_info := jsonb_build_object(
    'name', resume_row.personal_info->>'name',
    'location', filtered_location,
    'linkedin', resume_row.personal_info->>'linkedin'
  );
  
  -- Remove null values
  filtered_personal_info := (
    SELECT jsonb_object_agg(key, value)
    FROM jsonb_each(filtered_personal_info)
    WHERE value IS NOT NULL AND value != 'null'::jsonb
  );
  
  RETURN QUERY SELECT
    resume_row.id,
    resume_row.title,
    filtered_personal_info,
    resume_row.summary,
    resume_row.experience,
    resume_row.education,
    resume_row.skills,
    resume_row.template_name,
    resume_row.created_at,
    resume_row.updated_at,
    resume_row.is_public,
    resume_row.share_token;
END;
$$;

-- Create new secure RLS policies
-- Policy for authenticated users to see their own full resume data
CREATE POLICY "Users can view their own resumes" 
ON public.resumes 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- NOTE: We will NOT create a policy for anonymous access to prevent data harvesting
-- Instead, applications should use the helper function below for controlled public access

-- Create a helper function for safe public resume access by token
CREATE OR REPLACE FUNCTION public.get_public_resume_by_token(token_param uuid)
RETURNS TABLE(
  id uuid,
  title text,
  personal_info jsonb,
  summary text,
  experience jsonb,
  education jsonb,
  skills jsonb,
  template_name text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  is_public boolean,
  share_token uuid
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- This function safely returns filtered resume data for public sharing
  -- It bypasses RLS by using the service role context when called from edge functions
  RETURN QUERY
  SELECT fr.*
  FROM public.resumes r,
  LATERAL public.filter_sensitive_resume_data(r) fr
  WHERE r.share_token = token_param
    AND r.is_public = true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_public_resume_by_token(uuid) TO anon, authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.filter_sensitive_resume_data IS 
'Filters sensitive personal information (email, phone, full address) from resume data for public access while preserving name, generalized location, and LinkedIn profile.';

COMMENT ON FUNCTION public.get_public_resume_by_token IS 
'Safely retrieves a public resume by share token with sensitive personal information filtered out. This prevents data harvesting while allowing legitimate public resume sharing.';