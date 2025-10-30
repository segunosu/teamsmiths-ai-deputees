import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { to_email, user_name, score, readiness, reach, prowess, protection } =
      body;

    if (!to_email) {
      throw new Error("Missing recipient email");
    }

    console.log("Queuing scorecard report for:", to_email);

    const subject = `Your Teamsmiths AI Impact Score: ${score ?? "Pending"}/100`;

    const html = `
      <h2>Hi ${user_name || "there"},</h2>
      <p>Here's your personalised <b>4RPR AI Impact Scorecard</b> summary:</p>
      <ul>
        <li>Readiness: ${readiness ?? "N/A"}%</li>
        <li>Reach: ${reach ?? "N/A"}%</li>
        <li>Prowess: ${prowess ?? "N/A"}%</li>
        <li>Protection: ${protection ?? "N/A"}%</li>
      </ul>
      <p><b>Total AI Impact Score:</b> ${score ?? "N/A"} / 100</p>
      <p>Your next best step depends on your profile — 
      join our <a href="https://teamsmiths.ai/workshop">Workshop</a> or 
      start a <a href="https://teamsmiths.ai/growth-sprint">Growth Sprint</a>.</p>
      <p>— The Teamsmiths AI Team</p>
    `;

    // Insert into email_outbox (for process-email-outbox to send)
    const { error: insertError } = await supabase
      .from("email_outbox")
      .insert({
        to_email,
        subject,
        body: html,
        status: "queued",
      });

    if (insertError) throw insertError;

    console.log(`Queued email for ${to_email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email queued for delivery",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error queuing scorecard report:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
