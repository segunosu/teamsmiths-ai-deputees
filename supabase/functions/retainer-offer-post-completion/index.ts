import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RETAINER-OFFER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting retainer-offer-post-completion job");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Record job start
    const { data: jobRecord } = await supabaseClient
      .from('automation_runs')
      .insert({
        job_name: 'retainer-offer-post-completion',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    const jobId = jobRecord?.id;

    // Find projects completed in the last 24h without assurance
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const endTime = new Date().toISOString();
    
    const { data: completedProjects, error } = await supabaseClient
      .from('projects')
      .select(`
        id,
        title,
        teamsmith_user_id,
        updated_at,
        assurance_active,
        profiles!teamsmith_user_id (
          full_name,
          email
        )
      `)
      .eq('status', 'completed')
      .gte('updated_at', startTime)
      .lt('updated_at', endTime)
      .is('assurance_active', false);

    if (error) {
      logStep("Error fetching completed projects", { error });
      throw error;
    }

    let offerCount = 0;

    for (const project of completedProjects || []) {
      if (project.profiles) {
        // Emit retainer offer event
        await supabaseClient.functions.invoke('events-dispatch', {
          body: {
            type: 'retainer.offer.post_completion',
            payload: {
              client_user_id: project.teamsmith_user_id,
              project_id: project.id,
              project_title: project.title,
              client_name: project.profiles.full_name,
              client_email: project.profiles.email,
              assurance_url: `${Deno.env.get("SITE_URL") || "http://localhost:3000"}/projects/${project.id}/assurance`
            }
          }
        });

        offerCount++;
        logStep("Sent retainer offer", { 
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
        result: { offers_sent: offerCount, processed_projects: completedProjects?.length || 0 }
      })
      .eq('id', jobId);

    logStep("Job completed", { offerCount });

    return new Response(JSON.stringify({ 
      success: true, 
      offers_sent: offerCount,
      processed_projects: completedProjects?.length || 0
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