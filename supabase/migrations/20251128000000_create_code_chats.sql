-- Create code_chats table for storing chat history
CREATE TABLE IF NOT EXISTS public.code_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(analysis_id, user_id)
);

-- Enable RLS
ALTER TABLE public.code_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own chats"
ON public.code_chats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats"
ON public.code_chats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
ON public.code_chats
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
ON public.code_chats
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_code_chats_analysis_user ON public.code_chats(analysis_id, user_id);
CREATE INDEX IF NOT EXISTS idx_code_chats_user_updated ON public.code_chats(user_id, updated_at DESC);
