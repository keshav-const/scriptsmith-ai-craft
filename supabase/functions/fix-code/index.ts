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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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
            content: prompt
          }
        ],
        tools: [{
          type: "function",
          function: {
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
              required: ["improved_code", "changes", "explanation"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "improve_code" } }
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
      throw new Error('No improvement data received from AI');
    }

    const improvement = JSON.parse(toolCall.function.arguments);

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
