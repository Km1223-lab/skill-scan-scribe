-- First, handle any existing NULL user_id values by setting them to a placeholder
-- This prevents the NOT NULL constraint from failing
UPDATE ai_detection_results 
SET user_id = '00000000-0000-0000-0000-000000000000'::uuid 
WHERE user_id IS NULL;

-- Make user_id NOT NULL to ensure RLS policies work properly
ALTER TABLE ai_detection_results 
ALTER COLUMN user_id SET NOT NULL;

-- Drop the existing insecure policies
DROP POLICY IF EXISTS "Anyone can view detection results" ON ai_detection_results;
DROP POLICY IF EXISTS "Anyone can create detection results" ON ai_detection_results;

-- Create secure RLS policies that restrict access to user's own data
CREATE POLICY "Users can view their own detection results" 
ON ai_detection_results 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own detection results" 
ON ai_detection_results 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add UPDATE and DELETE policies for completeness
CREATE POLICY "Users can update their own detection results" 
ON ai_detection_results 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own detection results" 
ON ai_detection_results 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);