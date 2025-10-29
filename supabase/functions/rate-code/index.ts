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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Rating code for language:', language);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: `Analyze this ${language} code and provide quality ratings. Return a JSON object with this structure:
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
          }
        ],
        tools: [{
          type: "function",
          function: {
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
              required: ["complexity", "readability", "maintainability", "summary"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "rate_code" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No rating data received from AI');
    }

    const rating = JSON.parse(toolCall.function.arguments);

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
