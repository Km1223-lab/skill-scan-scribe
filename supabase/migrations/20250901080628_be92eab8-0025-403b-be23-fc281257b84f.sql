-- Create service_requests table for client service requests
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_category TEXT NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'normal',
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  estimated_completion_date DATE,
  completion_date DATE,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for service requests
CREATE POLICY "Service requests are viewable by authenticated users" 
ON public.service_requests 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can create service requests" 
ON public.service_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admin can update service requests" 
ON public.service_requests 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Create contact_messages table for general inquiries
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for contact messages
CREATE POLICY "Contact messages are viewable by admin" 
ON public.contact_messages 
FOR SELECT 
USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can create contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admin can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Create resumes table for generated resumes
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  personal_info JSONB NOT NULL,
  summary TEXT,
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  template_name TEXT DEFAULT 'default',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create policies for resumes
CREATE POLICY "Users can view their own resumes" 
ON public.resumes 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Anyone can create resumes" 
ON public.resumes 
FOR INSERT 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" 
ON public.resumes 
FOR UPDATE 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" 
ON public.resumes 
FOR DELETE 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
BEFORE UPDATE ON public.resumes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();