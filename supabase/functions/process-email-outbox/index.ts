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

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get pending emails from outbox
    const { data: pendingEmails, error: fetchError } = await supabaseClient
      .from("email_outbox")
      .select("*")
      .eq("status", "queued")
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
        // Extract email data from payload
        const { subject, html, text } = email.payload;
        
        // Send via Resend
        // Using Resend sandbox domain - replace with verified domain in production
        const { data: emailData, error: sendError } = await resend.emails.send({
          from: "Teamsmiths <onboarding@resend.dev>",
          to: [email.to_email],
          subject: subject || "Your AI Impact Scorecard Results",
          html: html,
          text: text || "",
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
