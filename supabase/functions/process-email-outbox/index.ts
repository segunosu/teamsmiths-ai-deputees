import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting email outbox processing...");
    console.log({
      RESEND_API_KEY: !!Deno.env.get("RESEND_API_KEY"),
      RESEND_FROM: Deno.env.get("RESEND_FROM"),
    });

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Configurable sender and test recipient for Resend
    const FROM =
      Deno.env.get("RESEND_FROM") || "Teamsmiths <onboarding@resend.dev>";
    const TEST_RECIPIENT = Deno.env.get("RESEND_TEST_RECIPIENT")?.trim();

    // Get pending emails
    const { data: pendingEmails, error: fetchError } = await supabaseClient
      .from("email_outbox")
      .select("*")
      .or("status.is.null,status.eq.queued")
      .limit(50);

    if (fetchError) throw fetchError;

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log("No pending emails to process");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${pendingEmails.length} emails...`);

    let successCount = 0;
    let failCount = 0;

    for (const email of pendingEmails) {
      try {
        // Sanitize recipient email
        const sanitizedEmail = (email.to_email ?? "").trim().toLowerCase();
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail);

        if (!isValidEmail) {
          console.warn(
            `Skipping email ${email.id}: invalid recipient '${sanitizedEmail}'`
          );
          await supabaseClient
            .from("email_outbox")
            .update({
              status: "failed",
              error: "invalid_to_email",
            })
            .eq("id", email.id);
          await new Promise((res) => setTimeout(res, 600));
          continue;
        }

        // Choose correct recipient (prefer TEST_RECIPIENT if defined)
        const to =
          TEST_RECIPIENT && TEST_RECIPIENT.length > 3
            ? [TEST_RECIPIENT]
            : [sanitizedEmail];

        console.log("Resolved recipient for", email.id, "→", to);

        // Ensure subject and body have safe fallback values
        const subject =
          email.subject ?? "Your Teamsmiths 4RPR Scorecard Report";
        const html =
          email.body?.trim()?.length > 0
            ? email.body
            : "<p>Your Teamsmiths report is ready.</p>";

        // Send email via Resend
        const { data: emailData, error: sendError } = await resend.emails.send({
          from: FROM,
          to,
          subject,
          html,
        });

        if (sendError) throw sendError;

        // Update email record
        await supabaseClient
          .from("email_outbox")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_id: emailData?.id,
          })
          .eq("id", email.id);

        successCount++;
        console.log(`✓ Sent email to ${to}`);
        await new Promise((res) => setTimeout(res, 600));
      } catch (emailError) {
        failCount++;
        console.error(`✗ Failed to send email ${email.id}:`, emailError);

        await supabaseClient
          .from("email_outbox")
          .update({
            status: "failed",
            error: emailError.message ?? "unknown_error",
          })
          .eq("id", email.id);
      }
    }

    console.log(
      `Email processing complete: ${successCount} sent, ${failCount} failed`
    );

    return new Response(
      JSON.stringify({
        success: true,
        processed: successCount + failCount,
        sent: successCount,
        failed: failCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing email outbox:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
