import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-NUDGE-CLIENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting auto-nudge-client-to-choose job");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Record job start
    const { data: jobRecord } = await supabaseClient
      .from('automation_runs')
      .insert({
        job_name: 'auto-nudge-client-to-choose',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    const jobId = jobRecord?.id;

    // Find briefs with proposals but no acceptance after 72h
    const cutoffTime = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    
    const { data: staleBriefs, error } = await supabaseClient
      .rpc('get_briefs_needing_client_nudge', {
        cutoff_time: cutoffTime
      });

    if (error) {
      logStep("Error fetching stale briefs", { error });
      throw error;
    }

    let nudgeCount = 0;

    for (const brief of staleBriefs || []) {
      // Get client profile
      const { data: clientProfile } = await supabaseClient
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', brief.user_id)
        .single();

      if (clientProfile) {
        // Emit nudge event
        await supabaseClient.functions.invoke('events-dispatch', {
          body: {
            type: 'client.nudge.choose',
            payload: {
              client_user_id: brief.user_id,
              brief_id: brief.id,
              brief_title: brief.structured_brief?.project_title || 'Your Project',
              client_name: clientProfile.full_name,
              client_email: clientProfile.email,
              proposal_count: brief.proposal_count,
              review_url: `${Deno.env.get("SITE_URL") || "http://localhost:3000"}/briefs/${brief.id}/proposals`
            }
          }
        });

        nudgeCount++;
        logStep("Sent client nudge", { 
          brief_id: brief.id, 
          client_id: brief.user_id 
        });
      }
    }

    // Update job completion
    await supabaseClient
      .from('automation_runs')
      .update({
        finished_at: new Date().toISOString(),
        result: { nudges_sent: nudgeCount, processed_briefs: staleBriefs?.length || 0 }
      })
      .eq('id', jobId);

    logStep("Job completed", { nudgeCount });

    return new Response(JSON.stringify({ 
      success: true, 
      nudges_sent: nudgeCount,
      processed_briefs: staleBriefs?.length || 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});