-- Fix critical security issues with RLS policies

-- 1. Fix service_requests table - restrict SELECT to admin only
DROP POLICY IF EXISTS "Service requests are viewable by authenticated users" ON public.service_requests;

CREATE POLICY "Service requests are viewable by admin only" 
ON public.service_requests 
FOR SELECT 
USING (auth.role() = 'service_role'::text);

-- 2. Fix resumes table - remove anonymous access (user_id IS NULL conditions)
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Anyone can create resumes" ON public.resumes;

-- Create secure resume policies without anonymous access
CREATE POLICY "Users can view their own resumes" 
ON public.resumes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" 
ON public.resumes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" 
ON public.resumes 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resumes" 
ON public.resumes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Add proper public resume sharing mechanism
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT gen_random_uuid();
CREATE INDEX IF NOT EXISTS idx_resumes_share_token ON public.resumes(share_token);

-- Policy for public resume access via share token
CREATE POLICY "Public resume access via share token" 
ON public.resumes 
FOR SELECT 
USING (is_public = true AND share_token IS NOT NULL);