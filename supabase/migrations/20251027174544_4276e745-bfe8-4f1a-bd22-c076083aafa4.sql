-- Create table for storing code analysis sessions
CREATE TABLE public.code_analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  code_text text NOT NULL,
  language varchar(50),
  ai_explanation jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.code_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for Phase 1)
CREATE POLICY "Anyone can view analyses" 
ON public.code_analyses 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create analyses" 
ON public.code_analyses 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries by timestamp
CREATE INDEX idx_code_analyses_created_at ON public.code_analyses(created_at DESC);