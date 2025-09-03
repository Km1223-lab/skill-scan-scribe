-- Fix RLS policies for public resume sharing
-- Drop existing conflicting policy if it exists and recreate correctly
DROP POLICY IF EXISTS "Anonymous users can view public resumes by token" ON public.resumes;

-- Allow anonymous users to view public resumes via share tokens
CREATE POLICY "Anonymous users can view public resumes by token" 
ON public.resumes 
FOR SELECT 
TO anon
USING (is_public = true AND share_token IS NOT NULL);

-- Also ensure authenticated users can still view public resumes
DROP POLICY IF EXISTS "Authenticated users can view public resumes" ON public.resumes;
CREATE POLICY "Authenticated users can view public resumes" 
ON public.resumes 
FOR SELECT 
TO authenticated
USING (is_public = true OR auth.uid() = user_id);