import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

let cachedModelUrl: string | null = null;

async function discoverGeminiModel(apiKey: string): Promise<string> {
    if (cachedModelUrl) {
        return cachedModelUrl;
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) {
        throw new Error(`Failed to list models: ${response.status}`);
    }

    const data = await response.json();

    const availableModels = data.models.filter((model: any) =>
        model.supportedGenerationMethods?.includes('generateContent')
    );

    const selectedModel = availableModels.find((m: any) =>
        m.name.includes('flash')
    ) || availableModels[0];

    cachedModelUrl = `https://generativelanguage.googleapis.com/v1beta/${selectedModel.name}:generateContent`;

    console.log(`✅ Using model: ${selectedModel.displayName || selectedModel.name}`);

    return cachedModelUrl;
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }
    try {
        const { question, code, analysis, chatHistory, userId, analysisId } = await req.json();
        console.log('🔍 Received request - analysisId:', analysisId, 'userId:', userId); // ADD THIS LINE
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

        // Discover available Gemini model
        const modelUrl = await discoverGeminiModel(GEMINI_API_KEY);

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
        // Call Gemini with discovered model
        const aiResponse = await fetch(
            `${modelUrl}?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: messages }),
            }
        );
        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error('Gemini API error:', aiResponse.status, errorText);
            throw new Error(`Gemini API error: ${aiResponse.status} - ${errorText}`);
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
            console.log('💾 Saving chat - analysisId:', analysisId, 'userId:', userId);
            const { data, error } = await supabase.from('code_chats').upsert({
                analysis_id: analysisId,
                user_id: userId,
                messages: updatedMessages,
                updated_at: new Date().toISOString()
            });

            if (error) {
                console.error('❌ Database error:', error);
            } else {
                console.log('✅ Chat saved successfully');
            }
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