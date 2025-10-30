import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting scorecard email processing...");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all pending scorecard emails due for sending
    const now = new Date().toISOString();
    const { data: pendingEmails, error: fetchError } = await supabaseClient
      .from("scorecard_email_queue")
      .select(`
        id,
        scorecard_id,
        template_id,
        to_email,
        scheduled_for,
        scorecard_responses (
          id,
          name,
          email,
          company,
          total_score,
          readiness_score,
          reach_score,
          prowess_score,
          protection_score,
          segment
        ),
        scorecard_email_templates (
          subject,
          body_html,
          cta_text,
          cta_url
        )
      `)
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .limit(50);

    if (fetchError) throw fetchError;

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log("No pending scorecard emails to process");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${pendingEmails.length} queued emails...`);

    let successCount = 0;
    let failCount = 0;

    for (const email of pendingEmails) {
      try {
        const scorecard = email.scorecard_responses;
        const template = email.scorecard_email_templates;

        if (!scorecard || !template) {
          throw new Error("Missing scorecard or template data");
        }

        // Build subject line and body with placeholders replaced
        let subject = template.subject
          .replace(/{{name}}/g, scorecard.name)
          .replace(/{{total_score}}/g, Math.round(scorecard.total_score).toString())
          .replace(/{{company}}/g, scorecard.company || "");

        let body = template.body_html
          .replace(/{{name}}/g, scorecard.name)
          .replace(/{{total_score}}/g, Math.round(scorecard.total_score).toString())
          .replace(/{{company}}/g, scorecard.company || "")
          .replace(/{{readiness_score}}/g, Math.round(scorecard.readiness_score).toString())
          .replace(/{{reach_score}}/g, Math.round(scorecard.reach_score).toString())
          .replace(/{{prowess_score}}/g, Math.round(scorecard.prowess_score).toString())
          .replace(/{{protection_score}}/g, Math.round(scorecard.protection_score).toString());

        // Add CTA button if provided
        if (template.cta_text && template.cta_url) {
          body += `
            <div style="margin: 30px 0; text-align: center;">
              <a href="${template.cta_url}" style="
                background-color: #2563eb;
                color: #ffffff;
                padding: 12px 32px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
                font-weight: 600;
              ">${template.cta_text}</a>
            </div>
          `;
        }

        // Add branded footer
        body += `
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>Teamsmiths – Your AI Transformation Partner</p>
            <p>© ${new Date().getFullYear()} Teamsmiths. All rights reserved.</p>
          </div>
        `;

        // Log email details
        console.log("Queuing email:", email.to_email, "template:", email.template_id);

        // Insert into email_outbox (now uses subject/body instead of payload)
        const { error: queueError } = await supabaseClient
          .from("email_outbox")
          .insert({
            to_email: email.to_email,
            subject,
            body,
            template_code: `scorecard_nurture_${(scorecard.segment || "general").toLowerCase()}`,
            payload: {
              scorecard_id: scorecard.id,
              template_id: email.template_id,
            },
            status: "queued",
          });

        if (queueError) throw queueError;

        // Mark this queue item as sent
        await supabaseClient
          .from("scorecard_email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", email.id);

        // Log success
        await supabaseClient.from("scorecard_automation_log").insert({
          scorecard_id: scorecard.id,
          action_type: "email_sent",
          action_data: { template_id: email.template_id, subject },
          status: "success",
        });

        successCount++;
        console.log(`✓ Queued email successfully for ${email.to_email}`);
      } catch (emailError) {
        failCount++;
        console.error(`✗ Failed to queue email ${email.id}:`, emailError);

        // Mark failure in queue table
        await supabaseClient
          .from("scorecard_email_queue")
          .update({
            status: "failed",
            error: emailError.message,
          })
          .eq("id", email.id);

        // Log failure
        await supabaseClient.from("scorecard_automation_log").insert({
          scorecard_id: email.scorecard_id,
          action_type: "email_failed",
          action_data: { template_id: email.template_id, error: emailError.message },
          status: "error",
          error: emailError.message,
        });
      }
    }

    console.log(
      `Scorecard email processing complete: ${successCount} queued, ${failCount} failed`
    );

    return new Response(
      JSON.stringify({
        success: true,
        processed: successCount + failCount,
        queued: successCount,
        failed: failCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing scorecard emails:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
