-- Create table for AI detection results
CREATE TABLE public.ai_detection_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  document_name TEXT NOT NULL,
  document_content TEXT NOT NULL,
  ai_probability DECIMAL(5,2) NOT NULL CHECK (ai_probability >= 0 AND ai_probability <= 100),
  human_probability DECIMAL(5,2) NOT NULL CHECK (human_probability >= 0 AND human_probability <= 100),
  confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  detection_service TEXT NOT NULL,
  analysis_summary TEXT,
  detected_patterns JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_detection_results ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented)
CREATE POLICY "Anyone can view detection results" 
ON public.ai_detection_results 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create detection results" 
ON public.ai_detection_results 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_detection_results_updated_at
BEFORE UPDATE ON public.ai_detection_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();