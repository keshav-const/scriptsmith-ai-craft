import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }
    try {
        const { question, code, analysis, chatHistory, userId, analysisId } = await req.json();
        if (!question || !userId) {
            return new Response(
                JSON.stringify({ error: 'Question and userId required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not configured');
        }
        // Build context-aware prompt
        const systemPrompt = `You are an expert code mentor. Help users understand their code by answering questions clearly and concisely.
Context:
- User's Code: ${code || 'Not provided'}
- Analysis Summary: ${analysis?.explanation || 'Not available'}
- Code Issues: ${analysis?.issues?.length || 0} issues found
- Quality Score: ${analysis?.qualityScore || 'N/A'}/100
Answer the user's question based on this context. Be helpful, clear, and provide code examples when relevant.`;
        // Build conversation history
        const messages = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            ...(chatHistory || []).map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            })),
            { role: 'user', parts: [{ text: question }] }
        ];
        // Call Gemini
        const aiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: messages }),
            }
        );
        if (!aiResponse.ok) {
            throw new Error(`Gemini API error: ${aiResponse.status}`);
        }
        const aiData = await aiResponse.json();
        const answer = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!answer) {
            throw new Error('No response from AI');
        }
        // Save to database
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (supabaseUrl && supabaseKey && analysisId) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const newMessage = {
                role: 'user',
                content: question,
                timestamp: new Date().toISOString()
            };
            const aiMessage = {
                role: 'assistant',
                content: answer,
                timestamp: new Date().toISOString()
            };
            const updatedMessages = [...(chatHistory || []), newMessage, aiMessage];
            // Upsert chat
            await supabase.from('code_chats').upsert({
                analysis_id: analysisId,
                user_id: userId,
                messages: updatedMessages,
                updated_at: new Date().toISOString()
            });
        }
        return new Response(
            JSON.stringify({ answer }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in chat-with-code:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});