import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    console.log("Testing Resend authentication...");
    console.log({
      RESEND_API_KEY: !!Deno.env.get("RESEND_API_KEY"),
      RESEND_FROM: Deno.env.get("RESEND_FROM"),
    });

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const from = Deno.env.get("RESEND_FROM") || "Teamsmiths <onboarding@resend.dev>";
    
    const res = await resend.emails.send({
      from,
      to: "sosu325@gmail.com",
      subject: "Teamsmiths Resend Final Auth Test",
      html: "<p>This is the final live test email from Teamsmiths.</p>",
    });
    
    console.log("Resend response:", res);

    return new Response(
      JSON.stringify({ success: true, result: res }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error testing Resend:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
