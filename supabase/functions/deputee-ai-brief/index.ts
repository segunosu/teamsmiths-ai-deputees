import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, field, context } = await req.json()

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const systemPrompt = `You are Deputee™ AI™, an intelligent brief interpretation system for Teamsmiths.ai. 

Your role:
- Interpret user inputs contextually and intelligently
- Extract structured information from natural language
- NEVER parrot back exactly what the user said
- Be concise but comprehensive
- Focus on business outcomes and practical implementation

Context: This is for field "${field}" in a business brief.

Response format: Always respond with valid JSON containing:
{
  "interpretation": "Your intelligent interpretation of what they mean",
  "extracted_data": {
    "key_points": ["point1", "point2"],
    "implied_timeline": "if mentioned or implied",
    "budget_hints": "if any budget context mentioned",
    "success_metrics": ["metric1", "metric2"]
  },
  "follow_up": "Suggested follow-up or clarification if needed"
}

Guidelines:
- If they mention timeline in goal (e.g., "double sales in 2 months"), capture it
- Extract business context, industry hints, company size clues
- Identify constraints, compliance needs, existing systems
- Suggest realistic budgets based on scope
- Don't ask "Does that sound right?" - provide confident interpretations`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500
    })

    const response = completion.choices[0]?.message?.content
    
    if (!response) {
      throw new Error('No response from AI')
    }

    const parsedResponse = JSON.parse(response)
    
    return new Response(
      JSON.stringify(parsedResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('AI brief processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process brief', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})