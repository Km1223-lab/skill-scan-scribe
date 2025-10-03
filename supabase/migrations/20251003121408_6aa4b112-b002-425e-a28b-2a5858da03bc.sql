-- Phase 1: Enable RLS on password_check_events table (if not already enabled)
ALTER TABLE public.password_check_events ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for password_check_events
DROP POLICY IF EXISTS "Users can view their own password check events" ON public.password_check_events;
DROP POLICY IF EXISTS "Users can insert their own password check events" ON public.password_check_events;

CREATE POLICY "Users can view their own password check events"
ON public.password_check_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own password check events"
ON public.password_check_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Phase 2: Create RBAC Infrastructure

-- Create enum for application roles (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all roles"
ON public.user_roles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop old is_admin function and create new one with proper RBAC
DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Phase 3: Update RLS policies for contact_messages

-- Drop old policies
DROP POLICY IF EXISTS "Only admin can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Contact messages are viewable by admin with logging" ON public.contact_messages;
DROP POLICY IF EXISTS "Limit bulk access to contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view all contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;

-- Create new admin policies using RBAC
CREATE POLICY "Admins can view all contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update contact messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Phase 4: Update RLS policies for service_requests

-- Drop old policies
DROP POLICY IF EXISTS "Only admin can update service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Service requests are viewable by admin with logging" ON public.service_requests;
DROP POLICY IF EXISTS "Limit bulk access to service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can view all service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can update service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can delete service requests" ON public.service_requests;

-- Create new admin policies using RBAC
CREATE POLICY "Admins can view all service requests"
ON public.service_requests
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update service requests"
ON public.service_requests
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete service requests"
ON public.service_requests
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Phase 5: Update audit log function to work with new RBAC
CREATE OR REPLACE FUNCTION public.log_admin_access(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log if called by authenticated user with admin role
  IF auth.uid() IS NOT NULL AND public.is_admin(auth.uid()) THEN
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

-- Add helpful comments
COMMENT ON TABLE public.user_roles IS 'Stores user role assignments. Use has_role() or is_admin() functions in RLS policies to check permissions.';
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check if a user has a specific role. Use in RLS policies to avoid recursion.';
COMMENT ON FUNCTION public.is_admin IS 'Security definer function to check if a user is an admin. Use in RLS policies.';