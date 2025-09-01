import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STALE-PROJECT-POKE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting stale-project-poke job");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Record job start
    const { data: jobRecord } = await supabaseClient
      .from('automation_runs')
      .insert({
        job_name: 'stale-project-poke',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    const jobId = jobRecord?.id;

    // Find active projects with no activity for 7 days
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: staleProjects, error } = await supabaseClient
      .from('projects')
      .select(`
        id,
        title,
        teamsmith_user_id,
        updated_at,
        project_participants!inner (
          user_id,
          role,
          profiles (
            full_name,
            email
          )
        )
      `)
      .eq('status', 'active')
      .lt('updated_at', cutoffTime);

    if (error) {
      logStep("Error fetching stale projects", { error });
      throw error;
    }

    let pokeCount = 0;

    for (const project of staleProjects || []) {
      // Send poke to both client and expert
      for (const participant of project.project_participants) {
        if (participant.profiles) {
          await supabaseClient.functions.invoke('events-dispatch', {
            body: {
              type: 'project.poke.stale',
              payload: {
                user_id: participant.user_id,
                project_id: project.id,
                project_title: project.title,
                user_name: participant.profiles.full_name,
                user_email: participant.profiles.email,
                role: participant.role,
                project_url: `${Deno.env.get("SITE_URL") || "http://localhost:3000"}/projects/${project.id}`
              }
            }
          });

          pokeCount++;
        }
      }

      logStep("Sent stale project pokes", { 
        project_id: project.id,
        participants: project.project_participants.length
      });
    }

    // Update job completion
    await supabaseClient
      .from('automation_runs')
      .update({
        finished_at: new Date().toISOString(),
        result: { pokes_sent: pokeCount, processed_projects: staleProjects?.length || 0 }
      })
      .eq('id', jobId);

    logStep("Job completed", { pokeCount });

    return new Response(JSON.stringify({ 
      success: true, 
      pokes_sent: pokeCount,
      processed_projects: staleProjects?.length || 0
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