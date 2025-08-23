import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Field =
  | "goal"
  | "context"
  | "constraints"
  | "budget_range"
  | "timeline"
  | "urgency"
  | "expert_style";

interface SenseRequest {
  field: Field;
  value: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const { field, value }: SenseRequest = await req.json();

    const system = `You are Deputee™ AI, tasked with concise sensemaking of a single user input field within a brief builder. 
- Do NOT parrot the text back verbatim. 
- Produce a short, professional interpretation in 1-2 sentences.
- Detect gibberish, contradictions, or profanity. If input is not meaningful, return an empty interpreted string and add a warning like "unintelligible_input".
- Return valid JSON only.
- Include a numeric confidence 0.0-1.0 for how certain the interpretation is.
- Also provide a small set of tags (e.g., ["timeline","risk","budget"]).

When field is:
- goal: extract objective, metric, timeframe if present.
- context: infer org_size (enterprise|smb|startup|unknown), industry if present, and any key constraints.
- constraints: summarize key constraints (time, budget, compliance, resources) and risks.
- budget_range: infer currency and min/max numeric values if present.
- timeline: infer duration or target dates.
- urgency: map to urgent|standard|flexible.
- expert_style: map to strategic|hands-on|hybrid.
`;

    const user = `Field: ${field}\nUser Input: ${value}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content:
              user +
              "\n\nRespond in strict JSON with this shape: {\n  \"interpreted\": string,\n  \"confidence\": number,\n  \"tags\": string[],\n  \"warnings\": string[],\n  \"normalized\": object\n}"
          },
        ],
        max_completion_tokens: 400,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("brief-sensemaking OpenAI error", errorText);
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    let parsed: any = null;

    if (typeof content === "string" && content.trim().length > 0) {
      // Try to extract pure JSON (handles fenced code blocks or extra text)
      let text = content.trim();
      const fenceMatch = text.match(/```(?:json)?([\s\S]*?)```/i);
      if (fenceMatch) {
        text = fenceMatch[1].trim();
      } else {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];
      }
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.error("brief-sensemaking JSON.parse failed", e, "content:", content);
        parsed = null;
      }
    } else {
      console.error("brief-sensemaking: missing model content", JSON.stringify(data).slice(0, 500));
    }

    // Validate shape and fallback if missing required fields
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.interpreted !== "string" ||
      typeof parsed.confidence !== "number" ||
      !Array.isArray(parsed.tags)
    ) {
      parsed = {
        interpreted: "",
        confidence: 0.0,
        tags: ["parse_error"],
        warnings: ["parse_error"],
        normalized: {},
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in brief-sensemaking:", error?.message || error);
    return new Response(
      JSON.stringify({
        interpreted: "",
        confidence: 0.0,
        tags: ["server_error"],
        warnings: ["server_error"],
        normalized: {},
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
