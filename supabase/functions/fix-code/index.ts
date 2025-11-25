import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, issues } = await req.json();

    if (!code) {
      throw new Error('Code is required');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Fixing code for language:', language);

    const issuesContext = issues && issues.length > 0
      ? `\n\nKnown issues to fix:\n${issues.map((i: any) => `- ${i.description}`).join('\n')}`
      : '';

    const prompt = `Improve and refactor this ${language} code. Fix issues, improve readability, and apply best practices.${issuesContext}

Original code:
\`\`\`${language}
${code}
\`\`\`

Return a JSON object with:
{
  "improved_code": "the refactored code",
  "changes": ["list of changes made"],
  "explanation": "brief explanation of improvements"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          tools: [{
            functionDeclarations: [{
              name: "improve_code",
              description: "Return improved code with changes",
              parameters: {
                type: "object",
                properties: {
                  improved_code: {
                    type: "string",
                    description: "The refactored and improved code"
                  },
                  changes: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of specific changes made"
                  },
                  explanation: {
                    type: "string",
                    description: "Brief explanation of the improvements"
                  }
                },
                required: ["improved_code", "changes", "explanation"]
              }
            }]
          }],
          toolConfig: {
            functionCallingConfig: {
              mode: "ANY",
              allowedFunctionNames: ["improve_code"]
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const functionCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall;

    if (!functionCall || functionCall.name !== 'improve_code') {
      throw new Error('No improvement data received from Gemini AI');
    }

    const improvement = functionCall.args;

    return new Response(
      JSON.stringify(improvement),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fix-code function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
