import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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

    console.log('Analyzing code with Gemini 2.0 Flash...');

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert code analyzer. Analyze code and provide comprehensive feedback including quality metrics, docstrings, and improvement suggestions.
            
Return the analysis in this exact JSON structure:
{
  "explanation": "Overall explanation of what the code does",
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
      "explanation": "what this line does"
    }
  ],
  "issues": [
    {
      "severity": "high|medium|low",
      "line": 5,
      "description": "description of the issue",
      "suggestion": "how to fix it"
    }
  ],
  "improvements": [
    {
      "title": "improvement title",
      "description": "detailed description",
      "code": "suggested improved code"
    }
  ]
}`;

    const userPrompt = `Analyze this ${language || 'code'} in detail. Include quality metrics (complexity, readability, maintainability score 1-10), generate appropriate docstrings/comments, identify issues, and suggest improvements:\n\n${code}`;

    // Call Gemini API directly
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Gemini API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiContent) {
      throw new Error('No response from Gemini AI');
    }

    // Parse the AI response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || aiContent.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiContent;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to simple structure
      analysis = {
        explanation: aiContent,
        lineByLine: [],
        issues: [],
        improvements: []
      };
    }

    // Store in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: savedAnalysis, error: dbError } = await supabase
      .from('code_analyses')
      .insert({
        code_text: code,
        language: language || 'unknown',
        user_id: userId,
        ai_explanation: analysis,
        ai_docstring: analysis.docstring || null,
        ai_rating: analysis.rating || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Analysis completed and saved');

    return new Response(
      JSON.stringify({
```
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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

    console.log('Analyzing code with Gemini 2.0 Flash...');

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert code analyzer.Analyze code and provide comprehensive feedback including quality metrics, docstrings, and improvement suggestions.
            
Return the analysis in this exact JSON structure:
        {
          "explanation": "Overall explanation of what the code does",
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
              "explanation": "what this line does"
            }
          ],
          "issues": [
            {
              "severity": "high|medium|low",
              "line": 5,
              "description": "description of the issue",
              "suggestion": "how to fix it"
            }
          ],
          "improvements": [
            {
              "title": "improvement title",
              "description": "detailed description",
              "code": "suggested improved code"
            }
          ]
        }`;

    const userPrompt = `Analyze this ${ language || 'code'} in detail.Include quality metrics(complexity, readability, maintainability score 1 - 10), generate appropriate docstrings / comments, identify issues, and suggest improvements: \n\n${ code } `;

    // Call Gemini API directly
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
      headers: {
      'Content-Type': 'application/json',
        },
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

  if (aiResponse.status === 429) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  throw new Error(`Gemini API error: ${aiResponse.status}`);
}

const aiData = await aiResponse.json();
const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

if (!aiContent) {
  throw new Error('No response from Gemini AI');
}

// Parse the AI response
let analysis;
try {
  // Extract JSON from markdown code blocks if present
  const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || aiContent.match(/```\n([\s\S]*?)\n```/);
  const jsonString = jsonMatch ? jsonMatch[1] : aiContent;
  analysis = JSON.parse(jsonString);
} catch (parseError) {
  console.error('Failed to parse AI response:', parseError);
  // Fallback to simple structure
  analysis = {
    explanation: aiContent,
    lineByLine: [],
    issues: [],
    improvements: []
  };
}

// Store in database
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials not configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const { data: savedAnalysis, error: dbError } = await supabase
  .from('code_analyses')
  .insert({
    code_text: code,
    language: language || 'unknown',
    user_id: userId,
    ai_explanation: analysis,
    ai_docstring: analysis.docstring || null,
    ai_rating: analysis.rating || null,
  })
  .select()
  .single();

if (dbError) {
  console.error('Database error:', dbError);
  throw dbError;
}

console.log('Analysis completed and saved');

return new Response(
  JSON.stringify({
    id: savedAnalysis.id,
    analysis,
  }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);

  } catch (error) {
  console.error('Error in analyze-code function:', error);
  console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  console.error('Error message:', error instanceof Error ? error.message : String(error));
  return new Response(
    JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : String(error)
    }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
});
```