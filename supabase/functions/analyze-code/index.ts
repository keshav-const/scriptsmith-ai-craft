import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

let cachedModelUrl: string | null = null;

async function discoverGeminiModel(apiKey: string): Promise<string> {
  if (cachedModelUrl) {
    console.log('Using cached model URL:', cachedModelUrl);
    return cachedModelUrl;
  }

  console.log('🔍 Discovering available Gemini models...');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Model discovery failed:', response.status, errorText);
      throw new Error(`Failed to list models: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Models response:', JSON.stringify(data).substring(0, 500));

    if (!data.models || data.models.length === 0) {
      throw new Error('No models available from Gemini API');
    }

    // Filter models that support generateContent
    const availableModels = data.models.filter((model: any) =>
      model.supportedGenerationMethods?.includes('generateContent')
    );

    console.log(`Found ${availableModels.length} models that support generateContent`);

    if (availableModels.length === 0) {
      throw new Error('No models support generateContent');
    }

    // Prefer Flash models (free tier)
    let selectedModel = availableModels.find((m: any) =>
      m.name.includes('flash')
    );

    if (!selectedModel) {
      selectedModel = availableModels[0];
    }

    // Build URL using discovered model name (format: "models/gemini-1.5-flash")
    cachedModelUrl = `https://generativelanguage.googleapis.com/v1beta/${selectedModel.name}:generateContent`;

    console.log(`✅ Selected model: ${selectedModel.displayName || selectedModel.name}`);
    console.log(`📍 Model URL: ${cachedModelUrl}`);

    return cachedModelUrl;
  } catch (error) {
    console.error('Error in discoverGeminiModel:', error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, userId } = await req.json();

    console.log('📥 Received request:', { codeLength: code?.length, language, userId });

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('🔑 API key found, length:', GEMINI_API_KEY.length);

    // Discover available model
    const modelUrl = await discoverGeminiModel(GEMINI_API_KEY);

    console.log('🤖 Calling Gemini API...');

    const requestBody = {
      contents: [{
        parts: [{
          text: `Analyze this ${language || 'code'} code and provide insights:\n\n${code}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    console.log('📤 Request body:', JSON.stringify(requestBody).substring(0, 200));

    // Call Gemini API
    const aiResponse = await fetch(
      `${modelUrl}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('📨 Gemini API response status:', aiResponse.status);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Gemini API error:', aiResponse.status, errorText);
      throw new Error(`Gemini API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('📦 Response data keys:', Object.keys(aiData));

    const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiContent) {
      console.error('❌ No content in response:', JSON.stringify(aiData));
      throw new Error('No response from Gemini AI');
    }

    console.log('✅ AI response received, length:', aiContent.length);

    const analysis = {
      explanation: aiContent,
      lineByLine: [],
      issues: [],
      improvements: []
    };

    return new Response(
      JSON.stringify({
        id: 'analysis-' + Date.now(),
        analysis,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Error in analyze-code function:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});