import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-NUDGE-PAY-M1] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting auto-nudge-pay-m1 job");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Record job start
    const { data: jobRecord } = await supabaseClient
      .from('automation_runs')
      .insert({
        job_name: 'auto-nudge-pay-m1',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    const jobId = jobRecord?.id;

    // Find projects with accepted proposals but no M1 payment after 72h
    const cutoffTime = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    
    const { data: unpaidProjects, error } = await supabaseClient
      .from('projects')
      .select(`
        id,
        title,
        teamsmith_user_id,
        created_at,
        milestones!inner (
          id,
          milestone_number,
          amount,
          payment_status
        ),
        profiles!teamsmith_user_id (
          full_name,
          email
        )
      `)
      .eq('status', 'pending_payment')
      .lt('created_at', cutoffTime)
      .eq('milestones.milestone_number', 1)
      .eq('milestones.payment_status', 'pending');

    if (error) {
      logStep("Error fetching unpaid projects", { error });
      throw error;
    }

    let nudgeCount = 0;

    for (const project of unpaidProjects || []) {
      const milestone1 = project.milestones.find(m => m.milestone_number === 1);
      
      if (milestone1 && project.profiles) {
        // Emit payment nudge event
        await supabaseClient.functions.invoke('events-dispatch', {
          body: {
            type: 'client.nudge.pay_m1',
            payload: {
              client_user_id: project.teamsmith_user_id,
              project_id: project.id,
              project_title: project.title,
              client_name: project.profiles.full_name,
              client_email: project.profiles.email,
              milestone_1_amount: milestone1.amount,
              pay_url: `${Deno.env.get("SITE_URL") || "http://localhost:3000"}/projects/${project.id}/milestones/1/pay`
            }
          }
        });

        nudgeCount++;
        logStep("Sent payment nudge", { 
          project_id: project.id, 
          client_id: project.teamsmith_user_id 
        });
      }
    }

    // Update job completion
    await supabaseClient
      .from('automation_runs')
      .update({
        finished_at: new Date().toISOString(),
        result: { nudges_sent: nudgeCount, processed_projects: unpaidProjects?.length || 0 }
      })
      .eq('id', jobId);

    logStep("Job completed", { nudgeCount });

    return new Response(JSON.stringify({ 
      success: true, 
      nudges_sent: nudgeCount,
      processed_projects: unpaidProjects?.length || 0
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