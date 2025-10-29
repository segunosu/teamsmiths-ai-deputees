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
    const { scorecardId } = await req.json();

    if (!scorecardId) {
      throw new Error("scorecardId is required");
    }

    console.log(`Processing alerts for scorecard: ${scorecardId}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get scorecard data
    const { data: scorecard, error: scorecardError } = await supabaseClient
      .from("scorecard_responses")
      .select("*")
      .eq("id", scorecardId)
      .single();

    if (scorecardError || !scorecard) {
      throw new Error("Scorecard not found");
    }

    // Get active alert rules
    const { data: rules, error: rulesError } = await supabaseClient
      .from("scorecard_alert_rules")
      .select("*")
      .eq("is_active", true);

    if (rulesError) throw rulesError;

    if (!rules || rules.length === 0) {
      console.log("No active alert rules");
      return new Response(
        JSON.stringify({ success: true, triggered: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let triggeredCount = 0;

    for (const rule of rules) {
      // Check if rule conditions match
      let shouldTrigger = true;

      // Check segment condition
      if (rule.condition_segment && rule.condition_segment !== scorecard.segment) {
        shouldTrigger = false;
      }

      // Check score condition
      if (rule.condition_min_score && scorecard.total_score < rule.condition_min_score) {
        shouldTrigger = false;
      }

      if (!shouldTrigger) continue;

      // Replace template variables
      const message = rule.message_template
        .replace(/{{name}}/g, scorecard.name)
        .replace(/{{email}}/g, scorecard.email)
        .replace(/{{company}}/g, scorecard.company || 'N/A')
        .replace(/{{total_score}}/g, Math.round(scorecard.total_score).toString())
        .replace(/{{segment}}/g, scorecard.segment);

      try {
        if (rule.alert_type === 'in_app') {
          // Create in-app notification for admin
          await supabaseClient.from("notifications").insert({
            user_id: rule.alert_target === 'admin' ? null : rule.alert_target,
            type: 'scorecard_alert',
            title: rule.name,
            message: message,
            related_id: scorecardId,
          });

        } else if (rule.alert_type === 'slack') {
          // Send to Slack webhook
          const slackResponse = await fetch(rule.alert_target, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `*${rule.name}*\n${message}`,
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: `*${rule.name}*\n${message}`
                  }
                },
                {
                  type: "section",
                  fields: [
                    {
                      type: "mrkdwn",
                      text: `*Score:*\n${Math.round(scorecard.total_score)}/100`
                    },
                    {
                      type: "mrkdwn",
                      text: `*Segment:*\n${scorecard.segment}`
                    }
                  ]
                },
                {
                  type: "actions",
                  elements: [
                    {
                      type: "button",
                      text: {
                        type: "plain_text",
                        text: "View in CRM"
                      },
                      url: `https://preview--synergysmith-crm.lovable.app/scorecard-leads?id=${scorecardId}`
                    }
                  ]
                }
              ]
            })
          });

          if (!slackResponse.ok) {
            throw new Error(`Slack API error: ${slackResponse.statusText}`);
          }

        } else if (rule.alert_type === 'email') {
          // Queue alert email
          await supabaseClient.from("email_outbox").insert({
            to_email: rule.alert_target,
            template_code: 'scorecard_alert',
            payload: {
              subject: rule.name,
              html: `
                <h2>${rule.name}</h2>
                <p>${message}</p>
                <hr>
                <p><strong>Name:</strong> ${scorecard.name}</p>
                <p><strong>Email:</strong> ${scorecard.email}</p>
                ${scorecard.company ? `<p><strong>Company:</strong> ${scorecard.company}</p>` : ''}
                <p><strong>Score:</strong> ${Math.round(scorecard.total_score)}/100</p>
                <p><strong>Segment:</strong> ${scorecard.segment}</p>
                <p><a href="https://preview--synergysmith-crm.lovable.app/scorecard-leads?id=${scorecardId}">View in CRM</a></p>
              `
            }
          });
        }

        // Log alert
        await supabaseClient
          .from("scorecard_automation_log")
          .insert({
            scorecard_id: scorecardId,
            action_type: "alert_sent",
            action_data: {
              rule_id: rule.id,
              rule_name: rule.name,
              alert_type: rule.alert_type,
            },
            status: "success",
          });

        triggeredCount++;
        console.log(`✓ Triggered alert: ${rule.name}`);

      } catch (alertError: any) {
        console.error(`✗ Failed to trigger alert ${rule.id}:`, alertError);

        // Log failure
        await supabaseClient
          .from("scorecard_automation_log")
          .insert({
            scorecard_id: scorecardId,
            action_type: "alert_failed",
            action_data: {
              rule_id: rule.id,
              rule_name: rule.name,
              error: alertError.message,
            },
            status: "error",
            error: alertError.message,
          });
      }
    }

    console.log(`Alert processing complete: ${triggeredCount} triggered`);

    return new Response(
      JSON.stringify({
        success: true,
        triggered: triggeredCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error processing alerts:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
