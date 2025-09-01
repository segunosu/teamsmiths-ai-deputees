import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-QA-RETRY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting auto-qa-retry job");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Record job start
    const { data: jobRecord } = await supabaseClient
      .from('automation_runs')
      .insert({
        job_name: 'auto-qa-retry',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    const jobId = jobRecord?.id;

    // Find milestones with pending QA for >24h
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: pendingMilestones, error } = await supabaseClient
      .from('milestones')
      .select(`
        id,
        title,
        project_id,
        qa_status,
        updated_at,
        projects (
          title
        )
      `)
      .eq('qa_status', 'pending')
      .lt('updated_at', cutoffTime);

    if (error) {
      logStep("Error fetching pending milestones", { error });
      throw error;
    }

    let retryCount = 0;

    for (const milestone of pendingMilestones || []) {
      try {
        // Retry QA check
        await supabaseClient.functions.invoke('run-qa-check', {
          body: { milestone_id: milestone.id }
        });

        retryCount++;
        logStep("Retried QA", { 
          milestone_id: milestone.id,
          project_title: milestone.projects?.title
        });
      } catch (qaError) {
        logStep("QA retry failed", { 
          milestone_id: milestone.id,
          error: qaError 
        });
      }
    }

    // Update job completion
    await supabaseClient
      .from('automation_runs')
      .update({
        finished_at: new Date().toISOString(),
        result: { qa_retries: retryCount, processed_milestones: pendingMilestones?.length || 0 }
      })
      .eq('id', jobId);

    logStep("Job completed", { retryCount });

    return new Response(JSON.stringify({ 
      success: true, 
      qa_retries: retryCount,
      processed_milestones: pendingMilestones?.length || 0
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