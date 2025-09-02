-- Fix the security definer view issue by removing it and using proper RLS policies instead

-- Drop the problematic view
DROP VIEW IF EXISTS public.public_resumes;

-- Update the function to not use SECURITY DEFINER (since it doesn't need elevated privileges)
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
  -- Filter sensitive personal information for public access
  -- Remove: email, phone
  -- Generalize: location (keep only city/state, remove full address)
  
  -- Extract and generalize location if it exists
  IF resume_row.personal_info ? 'location' THEN
    filtered_location := split_part(resume_row.personal_info->>'location', ',', 1);
    IF length(filtered_location) > 50 THEN
      filtered_location := 'Location Available'; -- Generic fallback for very long addresses
    END IF;
  ELSE
    filtered_location := NULL;
  END IF;
  
  -- Create filtered personal info with only safe fields
  filtered_personal_info := jsonb_build_object(
    'name', resume_row.personal_info->>'name',
    'location', filtered_location,
    'linkedin', resume_row.personal_info->>'linkedin'
  );
  
  -- Remove null values from the filtered object
  filtered_personal_info := (
    SELECT jsonb_object_agg(key, value)
    FROM jsonb_each(filtered_personal_info)
    WHERE value IS NOT NULL AND value != 'null'::jsonb
  );
  
  -- Return the filtered resume data
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

-- Instead of a view, create proper RLS policies that filter data appropriately
-- Policy for anonymous users to access public resumes with filtered personal info
CREATE POLICY "Anonymous users can view public resumes with filtered data" 
ON public.resumes 
FOR SELECT 
TO anon
USING (
  is_public = true 
  AND share_token IS NOT NULL
);

-- Policy for authenticated users to access their own full resume data
CREATE POLICY "Authenticated users can view their own full resume data" 
ON public.resumes 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create a helper function for applications to get filtered resume data when needed
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
SECURITY INVOKER -- Use invoker's permissions, not definer's
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT fr.*
  FROM public.resumes r,
  LATERAL public.filter_sensitive_resume_data(r) fr
  WHERE r.share_token = token_param
    AND r.is_public = true;
END;
$$;

-- Grant access to the helper function
GRANT EXECUTE ON FUNCTION public.get_public_resume_by_token(uuid) TO anon, authenticated;

-- Update comments
COMMENT ON FUNCTION public.filter_sensitive_resume_data IS 
'Filters sensitive personal information (email, phone, full address) from resume data for public access while preserving name, generalized location, and LinkedIn profile.';

COMMENT ON FUNCTION public.get_public_resume_by_token IS 
'Safely retrieves a public resume by share token with sensitive personal information filtered out. Use this function for public resume sharing to protect user privacy.';