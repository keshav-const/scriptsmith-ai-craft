-- Add new columns to code_analyses table for enhanced features
ALTER TABLE public.code_analyses 
ADD COLUMN IF NOT EXISTS ai_docstring text,
ADD COLUMN IF NOT EXISTS ai_rating jsonb;

-- Add index for faster user-based queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_code_analyses_user_id ON public.code_analyses(user_id);