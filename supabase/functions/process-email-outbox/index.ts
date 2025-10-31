import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple email validator used for both env + row values
const isEmail = (v?: string) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const resendFromRaw = Deno.env.get("RESEND_FROM") ?? "";
    const testRecipientRaw = Deno.env.get("RESEND_TEST_RECIPIENT") ?? "";

    // Guard: only use test recipient if it is a real email (contains @ and passes regex)
    const TEST_RECIPIENT = isEmail(testRecipientRaw) ? testRecipientRaw.trim() : "";

    // Guard: FROM must be valid. If not, default to Resend sandbox (works if Resend acct allows it)
    const FROM = /<.+@.+>/.test(resendFromRaw) ? resendFromRaw : "Teamsmiths <onboarding@resend.dev>";

    console.log("process-email-outbox starting…", {
      RESEND_API_KEY_PRESENT: !!resendApiKey,
      FROM_in_use: FROM,
      TEST_RECIPIENT_in_use: TEST_RECIPIENT || "(none)"
    });

    const resend = new Resend(resendApiKey);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch pending
    const { data: rows, error: fetchErr } = await supabase
      .from("email_outbox")
      .select("*")
      .or("status.is.null,status.eq.queued")
      .limit(50);

    if (fetchErr) throw fetchErr;
    if (!rows?.length) {
      return new Response(JSON.stringify({ success: true, processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0, failed = 0;

    for (const row of rows) {
      try {
        const toCandidate = (row.to_email ?? "").trim().toLowerCase();
        const finalTo = TEST_RECIPIENT || toCandidate;

        if (!isEmail(finalTo)) {
          // Mark failed with precise reason
          await supabase.from("email_outbox")
            .update({ status: "failed", error: `invalid_to_email:${finalTo}` })
            .eq("id", row.id);
          failed++;
          continue;
        }

        const subject = (row.subject && row.subject.trim()) || "Your Teamsmiths 4RPR Scorecard Report";
        const html = (row.body && row.body.trim()) || "<p>Your Teamsmiths report is ready.</p>";

        const { data: sentData, error: sendErr } = await resend.emails.send({
          from: FROM,
          to: [finalTo],
          subject,
          html,
        });
        if (sendErr) throw sendErr;

        await supabase.from("email_outbox").update({
          status: "sent",
          sent_at: new Date().toISOString(),
          provider_id: sentData?.id ?? null,
        }).eq("id", row.id);

        sent++;
      } catch (e: any) {
        failed++;
        await supabase.from("email_outbox")
          .update({ status: "failed", error: e?.message ?? "unknown_error" })
          .eq("id", row.id);
      }

      // respect Resend rate limits
      await new Promise(res => setTimeout(res, 600));
    }

    return new Response(JSON.stringify({ success: true, sent, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e?.message ?? String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
