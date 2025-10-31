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

    // Determine segment based on score
    let segment = "Explorer";
    const totalScore = score ?? 0;
    if (totalScore >= 70) segment = "Accelerator";
    else if (totalScore >= 40) segment = "Implementer";

    const subject = `Your AI Impact Maturity Level: ${segment} + Next Steps`;

    const html = `
      <h2>Hi ${user_name || "there"},</h2>
      <p>Thank you for completing the <b>AI Impact Maturity Assessment</b>!</p>
      
      <h3>Your AI Impact Maturity Level: <b>${segment}</b></h3>
      <p><b>Overall Maturity Score:</b> ${score ?? "N/A"} / 100</p>
      
      <h4>Your 4RPR Breakdown:</h4>
      <ul>
        <li><b>Readiness:</b> ${readiness ?? "N/A"}%</li>
        <li><b>Reach:</b> ${reach ?? "N/A"}%</li>
        <li><b>Prowess:</b> ${prowess ?? "N/A"}%</li>
        <li><b>Protection:</b> ${protection ?? "N/A"}%</li>
      </ul>
      
      <h4>Your Next Step:</h4>
      <p>Based on your ${segment} maturity level, we recommend focusing on ${
        Math.min(readiness ?? 0, reach ?? 0, prowess ?? 0, protection ?? 0) === readiness
          ? "improving your <b>Readiness</b> — building awareness and starting with low-risk AI experiments"
          : Math.min(readiness ?? 0, reach ?? 0, prowess ?? 0, protection ?? 0) === reach
          ? "expanding your <b>Reach</b> — deploying AI more extensively across your organization"
          : Math.min(readiness ?? 0, reach ?? 0, prowess ?? 0, protection ?? 0) === prowess
          ? "developing your <b>Prowess</b> — advancing your AI sophistication and measuring ROI"
          : "strengthening your <b>Protection</b> — robust governance, risk management, and compliance"
      } to progress to the next maturity level and maximize your AI impact.</p>
      
      <p>Want to explore your practical next step toward AI-driven performance? <a href="https://teamsmiths.ai/contact">Book a short Teamsmiths AI Upgrade Clinic</a>.</p>
      
      <p>Best regards,<br>The Teamsmiths Team</p>
    `;

    // Insert into email_outbox (for process-email-outbox to send)
    const insertPayload = {
      to_email,
      subject,
      body: html,
      status: "queued",
      template_code: "scorecard_report",
      payload: body,
    };
    console.log("insertPayload keys:", Object.keys(insertPayload));
    const { error: insertError } = await supabase
      .from("email_outbox")
      .insert(insertPayload);

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
