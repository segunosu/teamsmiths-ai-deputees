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
    const { scorecardId, scorecard } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Resolve scorecard data: prefer payload, fallback to DB fetch by id
    let sc = scorecard;
    if (!sc) {
      if (!scorecardId) throw new Error("Missing scorecard data");
      const { data: fetched, error } = await supabaseClient
        .from("scorecard_responses")
        .select("*")
        .eq("id", scorecardId)
        .single();
      if (error || !fetched) throw new Error("Scorecard not found");
      sc = fetched;
    }

    const getSegmentInfo = (segment: string) => {
      switch (segment) {
        case 'Explorer':
          return {
            title: 'AI Explorer',
            description: 'You\'re at the beginning of your AI journey with significant opportunities ahead.',
            recommendations: [
              'Start with AI awareness training for leadership',
              'Identify 2-3 high-impact use cases for quick wins',
              'Assess your data readiness and infrastructure gaps',
              'Build a foundational AI governance framework'
            ],
            cta: 'Free AI Workshop',
            ctaUrl: 'https://teamsmiths.ai/contact?interest=workshop'
          };
        case 'Implementer':
          return {
            title: 'AI Implementer',
            description: 'You\'re making progress with AI and ready to accelerate impact.',
            recommendations: [
              'Scale successful AI pilots across departments',
              'Invest in upskilling teams for AI adoption',
              'Implement robust AI measurement and ROI tracking',
              'Expand your AI use case portfolio strategically'
            ],
            cta: 'AI Growth Sprint',
            ctaUrl: 'https://teamsmiths.ai/contact?interest=sprint'
          };
        case 'Accelerator':
          return {
            title: 'AI Accelerator',
            description: 'You\'re advanced in AI and ready to maximize business wins.',
            recommendations: [
              'Optimize AI operations for maximum efficiency',
              'Drive AI-led innovation in new markets or products',
              'Build advanced AI capabilities and competitive moats',
              'Lead industry thought leadership in AI adoption'
            ],
            cta: 'Book Business Win Project',
            ctaUrl: 'https://teamsmiths.ai/contact?interest=business-win'
          };
        default:
          return {
            title: 'AI Journey',
            description: 'Continue your AI transformation.',
            recommendations: ['Continue building AI capabilities'],
            cta: 'Contact Us',
            ctaUrl: 'https://teamsmiths.ai/contact'
          };
      }
    };

    const segmentInfo = getSegmentInfo(sc.segment);

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Impact Scorecard Results</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Your AI Impact Score</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Personalized Assessment Results</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; font-size: 16px; color: #1f2937;">Hi ${sc.name},</p>
              <p style="margin: 15px 0 0 0; font-size: 16px; color: #1f2937;">
                Thank you for completing the AI Impact Scorecard. Here are your personalized results:
              </p>
            </td>
          </tr>

          <!-- Score Box -->
          <tr>
            <td style="padding: 0 30px;">
              <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #eff6ff; border-radius: 8px; border: 2px solid #3b82f6;">
                <tr>
                  <td align="center">
                    <div style="background-color: #dbeafe; display: inline-block; padding: 8px 20px; border-radius: 20px; margin-bottom: 10px;">
                      <span style="color: #1e40af; font-weight: 600; font-size: 14px;">${segmentInfo.title}</span>
                    </div>
                    <h2 style="margin: 10px 0; color: #1e3a8a; font-size: 48px; font-weight: bold;">${Math.round(sc.total_score)}/100</h2>
                    <p style="margin: 5px 0 0 0; color: #475569; font-size: 14px;">${segmentInfo.description}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 4RPR Breakdown -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;">Your 4RPR Breakdown</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <span style="color: #4b5563; font-size: 14px; font-weight: 500;">Readiness</span>
                      <span style="color: #1e3a8a; font-size: 14px; font-weight: 600;">${Math.round(sc.readiness_score)}/100</span>
                    </div>
                    <div style="background-color: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                      <div style="background-color: #3b82f6; height: 100%; width: ${sc.readiness_score}%; border-radius: 4px;"></div>
                    </div>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <span style="color: #4b5563; font-size: 14px; font-weight: 500;">Reach</span>
                      <span style="color: #1e3a8a; font-size: 14px; font-weight: 600;">${Math.round(sc.reach_score)}/100</span>
                    </div>
                    <div style="background-color: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                      <div style="background-color: #3b82f6; height: 100%; width: ${sc.reach_score}%; border-radius: 4px;"></div>
                    </div>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <span style="color: #4b5563; font-size: 14px; font-weight: 500;">Prowess</span>
                      <span style="color: #1e3a8a; font-size: 14px; font-weight: 600;">${Math.round(sc.prowess_score)}/100</span>
                    </div>
                    <div style="background-color: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                      <div style="background-color: #3b82f6; height: 100%; width: ${sc.prowess_score}%; border-radius: 4px;"></div>
                    </div>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <span style="color: #4b5563; font-size: 14px; font-weight: 500;">Protection</span>
                      <span style="color: #1e3a8a; font-size: 14px; font-weight: 600;">${Math.round(sc.protection_score)}/100</span>
                    </div>
                    <div style="background-color: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                      <div style="background-color: #3b82f6; height: 100%; width: ${sc.protection_score}%; border-radius: 4px;"></div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Recommendations -->
          <tr>
            <td style="padding: 20px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; font-weight: 600;">Recommended Actions</h3>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                ${segmentInfo.recommendations.map(rec => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
              </ul>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 20px 30px 40px 30px;" align="center">
              <table cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td align="center" style="background-color: #2563eb; border-radius: 6px; padding: 14px 32px;">
                    <a href="${segmentInfo.ctaUrl}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                      ${segmentInfo.cta} →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">
                Have questions? <a href="https://teamsmiths.ai/contact" style="color: #2563eb; text-decoration: none;">Get in touch</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                <strong>Teamsmiths</strong> - Your AI Transformation Partner
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Teamsmiths. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Sanitize email before queuing
    const sanitizedEmail = (sc.email ?? "").trim().toLowerCase();
    
    // Queue email in outbox for async sending
    await supabaseClient.from("email_outbox").insert({
      to_email: sanitizedEmail,
      subject: `Your AI Impact Score: ${Math.round(sc.total_score)}/100`,
      body: emailHtml,
      status: "queued"
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
