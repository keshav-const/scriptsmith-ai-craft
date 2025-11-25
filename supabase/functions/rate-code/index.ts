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
    const { code, language } = await req.json();

    if (!code) {
      throw new Error('Code is required');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Rating code for language:', language);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this ${language} code and provide quality ratings. Return a JSON object with this structure:
{
  "complexity": "low|medium|high",
  "readability": "low|medium|high", 
  "maintainability": 1-10 (number),
  "summary": "Brief explanation of ratings"
}

Code:
\`\`\`${language}
${code}
\`\`\``
            }]
          }],
          tools: [{
            functionDeclarations: [{
              name: "rate_code",
              description: "Rate code quality metrics",
              parameters: {
                type: "object",
                properties: {
                  complexity: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                    description: "Cyclomatic complexity level"
                  },
                  readability: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                    description: "Code readability level"
                  },
                  maintainability: {
                    type: "number",
                    description: "Maintainability score from 1-10"
                  },
                  summary: {
                    type: "string",
                    description: "Brief summary of the ratings"
                  }
                },
                required: ["complexity", "readability", "maintainability", "summary"]
              }
            }]
          }],
          toolConfig: {
            functionCallingConfig: {
              mode: "ANY",
              allowedFunctionNames: ["rate_code"]
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

    if (!functionCall || functionCall.name !== 'rate_code') {
      throw new Error('No rating data received from Gemini AI');
    }

    const rating = functionCall.args;

    return new Response(
      JSON.stringify({ rating }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in rate-code function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
