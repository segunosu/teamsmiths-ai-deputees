import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RationaleRequest {
  request_id: string;
  candidates: Array<{
    user_id: string;
    score: number;
    breakdown: any;
    profile: any;
  }>;
  request_details: {
    project_title: string;
    custom_requirements: string;
    budget_range: string;
    timeline_preference: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const { request_id, candidates, request_details }: RationaleRequest = await req.json();

    console.log(`Generating AI rationale for request ${request_id} with ${candidates.length} candidates`);

    const prompt = `
You are an expert freelancer matching analyst. A client has submitted a project request, and our algorithm has identified the top candidates. Please provide:

1. A one-paragraph rationale explaining why these candidates are a good fit
2. A bullet list of potential risks/gaps for each candidate

CLIENT REQUEST:
Title: ${request_details.project_title}
Requirements: ${request_details.custom_requirements}
Budget: ${request_details.budget_range}
Timeline: ${request_details.timeline_preference}

TOP CANDIDATES:
${candidates.map((c, i) => `
${i + 1}. ${c.profile.full_name} (Score: ${c.score}/1.0)
   - Skills match: ${(c.breakdown.skills * 100).toFixed(0)}%
   - Domain fit: ${(c.breakdown.domain * 100).toFixed(0)}%
   - Track record: ${(c.breakdown.outcomes * 100).toFixed(0)}%
   - Availability: ${c.profile.availability}
   - Price range: ${c.profile.price_range}
   - Key skills: ${c.profile.skills.slice(0, 5).join(', ')}
`).join('')}

Format your response as JSON:
{
  "overall_rationale": "One paragraph explanation of why this shortlist works...",
  "candidate_analysis": [
    {
      "user_id": "candidate_user_id",
      "strengths": ["strength 1", "strength 2"],
      "risks": ["risk 1", "risk 2"]
    }
  ]
}

Be specific about skills alignment, experience relevance, and potential concerns. Keep it professional and actionable for an admin reviewing the matches.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using legacy model as it supports temperature
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing freelancer-client matches. Provide detailed, actionable insights in valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let aiAnalysis;

    try {
      aiAnalysis = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", data.choices[0].message.content);
      // Fallback to basic analysis
      aiAnalysis = {
        overall_rationale: "AI analysis temporarily unavailable. These candidates were selected based on skills alignment, domain experience, and availability.",
        candidate_analysis: candidates.map(c => ({
          user_id: c.user_id,
          strengths: [`${(c.breakdown.skills * 100).toFixed(0)}% skills match`, `${(c.breakdown.domain * 100).toFixed(0)}% domain fit`],
          risks: ["Manual review recommended"]
        }))
      };
    }

    console.log("Generated AI rationale successfully");

    return new Response(JSON.stringify({
      success: true,
      analysis: aiAnalysis
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in generate-ai-rationale:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      fallback_analysis: {
        overall_rationale: "These candidates were selected based on algorithmic matching of skills, experience, and availability. Manual review recommended for final selection.",
        candidate_analysis: []
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});