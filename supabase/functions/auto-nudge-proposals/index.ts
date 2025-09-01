import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-NUDGE-PROPOSALS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting auto-nudge-proposals job");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Record job start
    const { data: jobRecord } = await supabaseClient
      .from('automation_runs')
      .insert({
        job_name: 'auto-nudge-proposals',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    const jobId = jobRecord?.id;

    // Find briefs with invites sent but no proposals after 48h
    const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    const { data: staleInvites, error } = await supabaseClient
      .from('expert_invites')
      .select(`
        id,
        brief_id,
        expert_user_id,
        created_at,
        briefs!inner (
          id,
          structured_brief,
          status
        ),
        profiles!expert_user_id (
          full_name,
          email
        )
      `)
      .eq('status', 'sent')
      .lt('created_at', cutoffTime)
      .eq('briefs.status', 'proposal_ready');

    if (error) {
      logStep("Error fetching stale invites", { error });
      throw error;
    }

    let nudgeCount = 0;

    for (const invite of staleInvites || []) {
      // Check if there are any proposals for this brief from this expert
      const { count: proposalCount } = await supabaseClient
        .from('project_proposals')
        .select('*', { count: 'exact' })
        .eq('brief_id', invite.brief_id)
        .eq('expert_user_id', invite.expert_user_id);

      if (proposalCount === 0) {
        // Emit nudge event
        await supabaseClient.functions.invoke('events-dispatch', {
          body: {
            type: 'expert.nudge.propose',
            payload: {
              expert_user_id: invite.expert_user_id,
              brief_id: invite.brief_id,
              brief_title: invite.briefs.structured_brief?.project_title || 'Project',
              expert_name: invite.profiles?.full_name || 'Expert',
              expert_email: invite.profiles?.email,
              proposal_url: `${Deno.env.get("SITE_URL") || "http://localhost:3000"}/proposals/submit/${invite.brief_id}`
            }
          }
        });

        nudgeCount++;
        logStep("Sent nudge", { 
          expert_id: invite.expert_user_id, 
          brief_id: invite.brief_id 
        });
      }
    }

    // Update job completion
    await supabaseClient
      .from('automation_runs')
      .update({
        finished_at: new Date().toISOString(),
        result: { nudges_sent: nudgeCount, processed_invites: staleInvites?.length || 0 }
      })
      .eq('id', jobId);

    logStep("Job completed", { nudgeCount });

    return new Response(JSON.stringify({ 
      success: true, 
      nudges_sent: nudgeCount,
      processed_invites: staleInvites?.length || 0
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