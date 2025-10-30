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

    // Configurable sender and test recipient for Resend sandbox
    const FROM = Deno.env.get("RESEND_FROM") || "Teamsmiths <onboarding@resend.dev>";
    const TEST_RECIPIENT = Deno.env.get("RESEND_TEST_RECIPIENT") || "";

    // Get pending emails from outbox
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

        // Basic safety check for recipient format
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail);
        if (!isValidEmail) {
          console.warn(`Skipping email ${email.id}: invalid recipient '${sanitizedEmail}'`);
          await supabaseClient
            .from("email_outbox")
            .update({ status: "failed", error: "invalid_to_email" })
            .eq("id", email.id);
          // small delay to avoid rate limits
          await new Promise((res) => setTimeout(res, 600));
          continue;
        }
        
        // Determine recipient (use test recipient if provided)
        const to = TEST_RECIPIENT ? [TEST_RECIPIENT] : [sanitizedEmail];
        if (TEST_RECIPIENT && sanitizedEmail !== TEST_RECIPIENT) {
          console.log(`Routing email ${email.id} to test recipient ${TEST_RECIPIENT} (original: ${sanitizedEmail})`);
        }
        
        // Ensure subject and body have fallback values
        const subject = email.subject ?? "Your Teamsmiths 4RPR Scorecard Report";
        const html = email.body ?? "<p>Report generated.</p>";
        
        // Send via Resend
        const { data: emailData, error: sendError } = await resend.emails.send({
          from: FROM,
          to,
          subject,
          html,
        });

        if (sendError) throw sendError;

        // Mark as sent
        await supabaseClient
          .from("email_outbox")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_id: emailData?.id,
          })
          .eq("id", email.id);

        successCount++;
        console.log(`✓ Sent email to ${email.to_email}`);
        // small delay to respect Resend rate limits
        await new Promise((res) => setTimeout(res, 600));

      } catch (emailError: any) {
        failCount++;
        console.error(`✗ Failed to send email ${email.id}:`, emailError);

        // Mark as failed
        await supabaseClient
          .from("email_outbox")
          .update({
            status: "failed",
            error: emailError.message,
          })
          .eq("id", email.id);
      }
    }

    console.log(`Email processing complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: successCount + failCount,
        sent: successCount,
        failed: failCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error processing email outbox:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
