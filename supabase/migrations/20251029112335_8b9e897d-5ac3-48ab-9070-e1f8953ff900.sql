-- Update RLS policies for user-specific access
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create analyses" ON public.code_analyses;
DROP POLICY IF EXISTS "Anyone can view analyses" ON public.code_analyses;

-- Create user-specific policies
CREATE POLICY "Users can view their own analyses"
ON public.code_analyses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses"
ON public.code_analyses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
ON public.code_analyses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
ON public.code_analyses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_code_analyses_user_id_created ON public.code_analyses(user_id, created_at DESC);