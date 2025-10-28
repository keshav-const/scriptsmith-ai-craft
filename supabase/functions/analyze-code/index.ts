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
    const { code, language } = await req.json();
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing code with Gemini 2.5 Pro...');
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Call Lovable AI Gateway with Gemini 2.5 Pro
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are an expert code analyzer. Analyze code and provide comprehensive feedback including quality metrics, docstrings, and improvement suggestions.
            
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
}`
          },
          {
            role: 'user',
            content: `Analyze this ${language || 'code'} in detail. Include quality metrics (complexity, readability, maintainability score 1-10), generate appropriate docstrings/comments, identify issues, and suggest improvements:\n\n${code}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error('No response from AI');
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
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});