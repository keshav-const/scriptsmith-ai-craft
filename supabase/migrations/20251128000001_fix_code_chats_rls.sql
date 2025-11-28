-- Fix RLS policies for code_chats table
-- The issue is that the Edge Function uses SERVICE_ROLE_KEY which bypasses RLS,
-- but we need to ensure the policies are correct for when the frontend queries

-- First, let's check if RLS is causing issues by temporarily disabling it
-- (We'll re-enable it after fixing)

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own chats" ON public.code_chats;
DROP POLICY IF EXISTS "Users can create their own chats" ON public.code_chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.code_chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON public.code_chats;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view their own chats"
ON public.code_chats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats"
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

-- Add service role bypass (this allows Edge Functions to write)
CREATE POLICY "Service role can manage all chats"
ON public.code_chats
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
