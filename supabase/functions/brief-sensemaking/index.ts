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
        model: "gpt-4.1-2025-04-14",
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
      // Heuristic fallback if parsing failed — avoid blocking the user
      const text = (value || '').trim();
      const lower = text.toLowerCase();

      // Basic extractors
      const pct = lower.match(/(\d+(?:\.\d+)?)\s?%/);
      const money = text.match(/([£$€])\s?([\d,.]+)(?:\s?(million|m|billion|b|k|thousand))?/i);
      const wordAmount = lower.match(/(\d+(?:\.\d+)?)\s?(million|billion|m|k)/i);
      const byMonth = lower.match(/by\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i);
      const inDuration = lower.match(/in\s+(\d+)\s+(day|week|month|quarter|year)s?/i);

      let metric: string | null = null;
      if (pct) metric = `${pct[1]}%`;
      else if (money) {
        const symbol = money[1];
        const amount = money[2];
        const scale = money[3]?.toLowerCase();
        metric = `${symbol}${amount}${scale ? ' ' + scale : ''}`;
      } else if (wordAmount) {
        metric = `${wordAmount[1]} ${wordAmount[2]}`;
      }

      let timeframe: string | null = null;
      if (byMonth) timeframe = `by ${byMonth[1]}`;
      else if (inDuration) timeframe = `in ${inDuration[1]} ${inDuration[2]}${Number(inDuration[1]) > 1 ? 's' : ''}`;

      const objectiveKeywords = ['revenue','sales','leads','users','profit','growth','churn','retention','engagement','traffic','mrr','arr'];
      const foundObjective = objectiveKeywords.find(k => lower.includes(k)) || 'objective';

      const pieces = [
        metric ? `aim to reach ${metric}` : null,
        foundObjective ? `in ${foundObjective}` : null,
        timeframe
      ].filter(Boolean);

      const interpreted = pieces.length
        ? `Goal: ${pieces.join(' ')}.`
        : 'High-level goal noted. We will refine as you add details.';

      const tags = [ 'goal' ];
      if (metric) tags.push('metric');
      if (timeframe) tags.push('timeline');

      parsed = {
        interpreted,
        confidence: pieces.length ? 0.6 : 0.4,
        tags,
        warnings: ['model_fallback'],
        normalized: {
          objective: foundObjective !== 'objective' ? foundObjective : null,
          metric: metric,
          timeframe: timeframe
        },
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
