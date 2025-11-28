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

function calculateQualityScore(analysis: any): { score: number; breakdown: any } {
  let score = 100;
  const breakdown = {
    baseScore: 100,
    issuesPenalty: 0,
    complexityPenalty: 0,
    readabilityBonus: 0,
    maintainabilityScore: 0,
  };

  // Deduct points for issues
  if (analysis.issues && Array.isArray(analysis.issues)) {
    analysis.issues.forEach((issue: any) => {
      if (issue.severity === 'high') {
        score -= 10;
        breakdown.issuesPenalty += 10;
      } else if (issue.severity === 'medium') {
        score -= 5;
        breakdown.issuesPenalty += 5;
      } else if (issue.severity === 'low') {
        score -= 2;
        breakdown.issuesPenalty += 2;
      }
    });
  }

  // Complexity penalty
  if (analysis.rating?.complexity) {
    const complexityMap: any = { low: 0, medium: 5, high: 15 };
    const penalty = complexityMap[analysis.rating.complexity] || 5;
    score -= penalty;
    breakdown.complexityPenalty = penalty;
  }

  // Readability bonus/penalty
  if (analysis.rating?.readability === 'high') {
    score += 10;
    breakdown.readabilityBonus = 10;
  } else if (analysis.rating?.readability === 'low') {
    score -= 10;
    breakdown.readabilityBonus = -10;
  }

  // Maintainability contribution
  if (analysis.rating?.maintainability) {
    const maintScore = analysis.rating.maintainability * 2;
    score += maintScore;
    breakdown.maintainabilityScore = maintScore;
  }

  // Ensure score is between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return { score: finalScore, breakdown };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, userId } = await req.json();

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
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const modelUrl = await discoverGeminiModel(GEMINI_API_KEY);

    const systemPrompt = `You are an expert code analyzer. Analyze the provided code and return a comprehensive analysis in the following EXACT JSON structure. Do not include markdown code blocks, just return pure JSON:

{
  "explanation": "Overall explanation of what the code does and its purpose",
  "docstring": "Generated docstring or inline comments for the code",
  "rating": {
    "complexity": "low|medium|high",
    "readability": "low|medium|high",
    "maintainability": 7
  },
  "lineByLine": [
    {
      "line": 1,
      "content": "the actual line of code",
      "explanation": "detailed explanation of what this line does"
    }
  ],
  "issues": [
    {
      "severity": "high|medium|low",
      "line": 5,
      "description": "description of the issue or code smell",
      "suggestion": "how to fix it"
    }
  ],
  "improvements": [
    {
      "title": "improvement title",
      "description": "detailed description of the improvement",
      "startLine": 1,
      "endLine": 5,
      "code": "suggested improved code snippet"
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.`;

    const userPrompt = `Analyze this ${language || 'code'} code in detail:\n\n${code}`;

    const aiResponse = await fetch(
      `${modelUrl}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              { text: userPrompt }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API error:', aiResponse.status, errorText);
      throw new Error(`Gemini API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiContent) {
      throw new Error('No response from Gemini AI');
    }

    // Parse the JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || aiContent.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiContent;
      analysis = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback structure
      analysis = {
        explanation: aiContent,
        docstring: '',
        rating: {
          complexity: 'medium',
          readability: 'medium',
          maintainability: 5
        },
        lineByLine: [],
        issues: [],
        improvements: []
      };
    }

    // Calculate quality score
    const qualityScore = calculateQualityScore(analysis);
    console.log(`📊 Quality Score: ${qualityScore.score}/100`);

    // Store in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    let analysisId = 'analysis-' + Date.now(); // Fallback ID
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: insertedData, error: insertError } = await supabase
        .from('code_analyses')
        .insert({
          code_text: code,
          language: language || 'unknown',
          user_id: userId,
          ai_explanation: analysis,
          ai_docstring: analysis.docstring || null,
          ai_rating: analysis.rating || null,
        })
        .select('id')
        .single();
      if (!insertError && insertedData) {
        analysisId = insertedData.id;
      }
    }
    return new Response(
      JSON.stringify({
        id: analysisId,
        analysis,
        qualityScore: qualityScore.score,
        scoreBreakdown: qualityScore.breakdown,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-code function:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});