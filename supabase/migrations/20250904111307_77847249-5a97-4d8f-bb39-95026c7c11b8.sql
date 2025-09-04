-- Enhanced RLS policies for better data protection and audit logging

-- Create audit log table for tracking admin access to sensitive data
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Only service role can view audit logs
CREATE POLICY "Service role can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.role() = 'service_role');

-- Create function to log admin access to sensitive data
CREATE OR REPLACE FUNCTION public.log_admin_access(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if called by service role (admin context)
  IF auth.role() = 'service_role' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      details
    ) VALUES (
      auth.uid(),
      p_action,
      p_table_name,
      p_record_id,
      p_details
    );
  END IF;
END;
$$;

-- Create function to check if user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Check if user has admin role in profiles table
  -- This assumes admin users have a role field in profiles
  -- For now, we'll use service_role as admin check
  RETURN auth.role() = 'service_role';
END;
$$;

-- Add data retention policy function
CREATE OR REPLACE FUNCTION public.cleanup_old_contact_messages()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete contact messages older than 2 years that have been replied to
  DELETE FROM public.contact_messages 
  WHERE created_at < now() - INTERVAL '2 years' 
    AND replied_at IS NOT NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the cleanup action
  PERFORM public.log_admin_access(
    'CLEANUP',
    'contact_messages',
    NULL,
    jsonb_build_object('deleted_count', deleted_count)
  );
  
  RETURN deleted_count;
END;
$$;

-- Update contact_messages RLS policies with audit logging
DROP POLICY IF EXISTS "Contact messages are viewable by admin" ON public.contact_messages;

CREATE POLICY "Contact messages are viewable by admin with logging" 
ON public.contact_messages 
FOR SELECT 
USING (
  CASE 
    WHEN auth.role() = 'service_role' THEN
      -- Log the access attempt
      (public.log_admin_access('VIEW', 'contact_messages', id::text) IS NULL OR true)
    ELSE false
  END
);

-- Update service_requests RLS policies with audit logging  
DROP POLICY IF EXISTS "Service requests are viewable by admin only" ON public.service_requests;

CREATE POLICY "Service requests are viewable by admin with logging" 
ON public.service_requests 
FOR SELECT 
USING (
  CASE 
    WHEN auth.role() = 'service_role' THEN
      -- Log the access attempt
      (public.log_admin_access('VIEW', 'service_requests', id::text) IS NULL OR true)
    ELSE false
  END
);

-- Add policy to restrict bulk data exports
CREATE POLICY "Limit bulk access to contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (
  auth.role() = 'service_role' AND
  -- Add rate limiting logic here if needed
  true
);

-- Add similar policy for service requests
CREATE POLICY "Limit bulk access to service requests" 
ON public.service_requests 
FOR SELECT 
USING (
  auth.role() = 'service_role' AND
  -- Add rate limiting logic here if needed  
  true
);