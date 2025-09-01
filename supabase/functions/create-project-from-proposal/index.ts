import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PROJECT-FROM-PROPOSAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { proposal_id, brief_id } = await req.json();
    logStep("Request body parsed", { proposal_id, brief_id });

    // Get the accepted proposal with expert and brief details
    const { data: proposal, error: proposalError } = await supabaseClient
      .from('project_proposals')
      .select(`
        *,
        expert_profile:profiles!project_proposals_expert_id_fkey (
          full_name,
          email,
          user_id
        ),
        brief:briefs (
          id,
          user_id,
          org_id,
          contact_name,
          contact_email,
          structured_brief
        )
      `)
      .eq('id', proposal_id)
      .eq('status', 'accepted')
      .single();

    if (proposalError || !proposal) {
      throw new Error(`Proposal not found or not accepted: ${proposalError?.message}`);
    }

    logStep("Proposal retrieved", { proposalId: proposal.id, expertId: proposal.expert_id });

    // Create the project
    const projectTitle = proposal.brief.structured_brief?.project_title || 'Custom Project';
    const { data: newProject, error: projectError } = await supabaseClient
      .from('projects')
      .insert({
        title: projectTitle,
        description: proposal.scope.overview,
        status: 'pending_payment',
        teamsmith_user_id: proposal.brief.user_id,
        org_id: proposal.brief.org_id,
        currency: 'gbp',
        total_price: proposal.price_total,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (projectError) {
      throw new Error(`Failed to create project: ${projectError.message}`);
    }

    logStep("Project created", { projectId: newProject.id });

    // Add project participants
    const participants = [
      {
        project_id: newProject.id,
        user_id: proposal.brief.user_id, // Client
        role: 'client',
      },
      {
        project_id: newProject.id,
        user_id: proposal.expert_id, // Expert
        role: 'expert',
      }
    ];

    const { error: participantsError } = await supabaseClient
      .from('project_participants')
      .insert(participants);

    if (participantsError) {
      logStep("Warning: Failed to add participants", participantsError);
    }

    // Create milestones from proposal
    const milestonesToCreate = proposal.milestones.map((milestone: any, index: number) => ({
      project_id: newProject.id,
      milestone_number: index + 1,
      title: milestone.title,
      description: milestone.description,
      amount: milestone.amount,
      status: index === 0 ? 'requires_payment' : 'planned', // First milestone requires payment
      payment_status: 'pending',
      qa_status: 'pending',
      created_at: new Date().toISOString(),
    }));

    const { error: milestonesError } = await supabaseClient
      .from('custom_project_milestones')
      .insert(milestonesToCreate);

    if (milestonesError) {
      throw new Error(`Failed to create milestones: ${milestonesError.message}`);
    }

    logStep("Milestones created", { count: milestonesToCreate.length });

    // Update brief status
    const { error: briefUpdateError } = await supabaseClient
      .from('briefs')
      .update({
        status: 'project_created',
        selected_expert_id: proposal.expert_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', brief_id);

    if (briefUpdateError) {
      logStep("Warning: Failed to update brief", briefUpdateError);
    }

    // Create notifications
    const notifications = [
      {
        user_id: proposal.expert_id,
        type: 'proposal_accepted',
        title: 'Proposal Accepted! 🎉',
        message: `Your proposal for "${projectTitle}" has been accepted. Project created and ready to start.`,
        related_id: newProject.id,
      },
      {
        user_id: proposal.brief.user_id,
        type: 'project_created',
        title: 'Project Created',
        message: `Project "${projectTitle}" has been created. First milestone payment required to begin.`,
        related_id: newProject.id,
      }
    ];

    const { error: notificationsError } = await supabaseClient
      .from('notifications')
      .insert(notifications);

    if (notificationsError) {
      logStep("Warning: Failed to create notifications", notificationsError);
    }

    logStep("Project creation completed successfully");

    return new Response(JSON.stringify({
      success: true,
      project_id: newProject.id,
      project_title: projectTitle,
      milestones_count: milestonesToCreate.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});