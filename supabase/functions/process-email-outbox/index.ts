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
      RESEND_API_KEY_EXISTS: !!Deno.env.get("RESEND_API_KEY"),
      RESEND_FROM: Deno.env.get("RESEND_FROM"),
      RESEND_TEST_RECIPIENT: Deno.env.get("RESEND_TEST_RECIPIENT"),
    });

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const FROM =
      Deno.env.get("RESEND_FROM") || "Teamsmiths <onboarding@resend.dev>";
    const TEST_RECIPIENT = Deno.env.get("RESEND_TEST_RECIPIENT")?.trim() ?? "";

    const { data: pending, error } = await supabase
      .from("email_outbox")
      .select("*")
      .or("status.is.null,status.eq.queued")
      .limit(50);

    if (error) throw error;
    if (!pending?.length) {
      console.log("No pending emails to process");
      return new Response(JSON.stringify({ success: true, processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ${pending.length} emails...`);
    let sent = 0;
    let failed = 0;

    for (const email of pending) {
      try {
        const sanitized = (email.to_email ?? "").trim().toLowerCase();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized);

        if (!isValid) {
          console.warn(`Invalid recipient: ${sanitized}`);
          await supabase
            .from("email_outbox")
            .update({ status: "failed", error: "invalid_to_email" })
            .eq("id", email.id);
          continue;
        }

        // choose correct target email
        const to = TEST_RECIPIENT
          ? [TEST_RECIPIENT]
          : [sanitized];

        console.log(`→ Sending to: ${to}`);

        const subject =
          email.subject ?? "Your Teamsmiths 4RPR Scorecard Report";
        const html =
          email.body?.trim()?.length
            ? email.body
            : "<p>Your Teamsmiths report is ready.</p>";

        const { data: result, error: sendError } = await resend.emails.send({
          from: FROM,
          to,
          subject,
          html,
        });

        if (sendError) throw sendError;

        await supabase
          .from("email_outbox")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_id: result?.id,
          })
          .eq("id", email.id);

        console.log(`✓ Sent to ${to}`);
        sent++;
      } catch (e) {
        failed++;
        console.error(`✗ Error sending ${email.id}:`, e.message);
        await supabase
          .from("email_outbox")
          .update({ status: "failed", error: e.message })
          .eq("id", email.id);
      }

      // Small pause to respect rate limits
      await new Promise((res) => setTimeout(res, 600));
    }

    console.log(`Processing complete: ${sent} sent, ${failed} failed`);
    return new Response(
      JSON.stringify({ success: true, sent, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Fatal error:", e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
