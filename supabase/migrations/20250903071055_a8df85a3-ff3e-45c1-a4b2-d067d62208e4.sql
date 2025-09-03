-- Create trigger for new user signup if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix RLS policies for public resume sharing
-- Allow anonymous users to view public resumes via share tokens
DROP POLICY IF EXISTS "Anonymous users can view public resumes by token" ON public.resumes;
CREATE POLICY "Anonymous users can view public resumes by token" 
ON public.resumes 
FOR SELECT 
TO anon
USING (is_public = true AND share_token IS NOT NULL);