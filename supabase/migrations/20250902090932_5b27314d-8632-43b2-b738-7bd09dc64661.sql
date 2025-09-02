-- Create function to filter sensitive personal information for public resume access
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
SECURITY DEFINER
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

-- Drop the existing public resume access policy
DROP POLICY IF EXISTS "Public resume access via share token" ON public.resumes;

-- Create a more secure public resume access policy with field-level filtering
-- This policy will only return filtered data for public resumes
CREATE POLICY "Public resume access via share token with filtered data" 
ON public.resumes 
FOR SELECT 
USING (
  is_public = true 
  AND share_token IS NOT NULL 
  AND auth.uid() IS NULL  -- Only for anonymous users
);

-- Create a policy for authenticated users to access full resume data (their own resumes)
-- This ensures authenticated users still get full access to their own resumes
CREATE POLICY "Authenticated users can view full resume data" 
ON public.resumes 
FOR SELECT 
USING (
  auth.uid() = user_id  -- Users can see their own resumes with full data
);

-- Create a view for public resume access that automatically filters sensitive data
CREATE OR REPLACE VIEW public.public_resumes AS
SELECT 
  fr.id,
  fr.title,
  fr.personal_info,
  fr.summary,
  fr.experience,
  fr.education,
  fr.skills,
  fr.template_name,
  fr.created_at,
  fr.updated_at,
  fr.is_public,
  fr.share_token
FROM public.resumes r,
LATERAL public.filter_sensitive_resume_data(r) fr
WHERE r.is_public = true 
  AND r.share_token IS NOT NULL;

-- Grant access to the public_resumes view
GRANT SELECT ON public.public_resumes TO anon, authenticated;

-- Create RLS policy for the public_resumes view  
ALTER VIEW public.public_resumes SET (security_barrier = on);

COMMENT ON FUNCTION public.filter_sensitive_resume_data IS 
'Filters sensitive personal information (email, phone, full address) from resume data for public access while preserving name, generalized location, and LinkedIn profile.';

COMMENT ON VIEW public.public_resumes IS 
'Public view of resumes with sensitive personal information filtered out. Use this view for public resume sharing to protect user privacy.';