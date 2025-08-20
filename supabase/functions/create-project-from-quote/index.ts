import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quoteId } = await req.json();

    if (!quoteId) {
      throw new Error("Quote ID is required");
    }

    // Initialize Supabase client with service role key for full access
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the quote details
    const { data: quote, error: quoteError } = await supabaseService
      .from('custom_quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      throw new Error(`Quote not found: ${quoteError?.message}`);
    }

    // Check if project already exists for this quote
    const { data: existingProject } = await supabaseService
      .from('projects')
      .select('id')
      .eq('title', quote.project_title)
      .eq('total_price', quote.total_amount)
      .single();

    if (existingProject) {
      console.log("Project already exists for this quote");
      return new Response(
        JSON.stringify({ projectId: existingProject.id, message: "Project already exists" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create the project
    const { data: project, error: projectError } = await supabaseService
      .from('projects')
      .insert({
        title: quote.project_title,
        status: 'active',
        total_price: quote.total_amount,
        currency: quote.currency || 'gbp',
        is_custom: true
      })
      .select()
      .single();

    if (projectError || !project) {
      throw new Error(`Failed to create project: ${projectError?.message}`);
    }

    console.log("Created project:", project.id);

    // Add client as project participant
    const { error: clientParticipantError } = await supabaseService
      .from('project_participants')
      .insert({
        project_id: project.id,
        user_id: quote.user_id,
        role: 'client'
      });

    if (clientParticipantError) {
      console.error("Error adding client participant:", clientParticipantError);
    }

    // Create milestones from quote
    if (quote.milestones && Array.isArray(quote.milestones)) {
      const milestonesToCreate = quote.milestones.map((milestone: any, index: number) => ({
        project_id: project.id,
        quote_id: quoteId,
        milestone_number: index + 1,
        title: milestone.title || `Milestone ${index + 1}`,
        description: milestone.description,
        amount: milestone.amount,
        due_date: milestone.due_date,
        deliverables: milestone.deliverables || [],
        status: 'planned'
      }));

      const { data: createdMilestones, error: milestonesError } = await supabaseService
        .from('custom_project_milestones')
        .insert(milestonesToCreate)
        .select();

      if (milestonesError) {
        console.error("Error creating milestones:", milestonesError);
      } else {
        console.log("Created milestones:", createdMilestones?.length);
      }
    }

    // Create deliverables from quote
    if (quote.deliverables && Array.isArray(quote.deliverables)) {
      const deliverablesToCreate = quote.deliverables.map((deliverable: any) => ({
        project_id: project.id,
        title: deliverable.title || deliverable.name,
        description: deliverable.description,
        due_date: deliverable.due_date,
        status: 'pending'
      }));

      const { data: createdDeliverables, error: deliverablesError } = await supabaseService
        .from('project_deliverables')
        .insert(deliverablesToCreate)
        .select();

      if (deliverablesError) {
        console.error("Error creating deliverables:", deliverablesError);
      } else {
        console.log("Created deliverables:", createdDeliverables?.length);
      }
    }

    // Update quote status to indicate project has been created
    const { error: quoteUpdateError } = await supabaseService
      .from('custom_quotes')
      .update({ 
        status: 'project_created',
        approved_at: new Date().toISOString()
      })
      .eq('id', quoteId);

    if (quoteUpdateError) {
      console.error("Error updating quote status:", quoteUpdateError);
    }

    // Send notification to client
    try {
      await supabaseService.rpc('create_notification', {
        p_user_id: quote.user_id,
        p_type: 'project_created',
        p_title: 'Project Created',
        p_message: `Your project "${quote.project_title}" has been created and is ready to begin.`,
        p_related_id: project.id
      });

      // Send email notification
      await supabaseService.functions.invoke('send-notification-email', {
        body: {
          to: quote.user_id, // This should be resolved to email by the email function
          type: 'project_created',
          data: {
            title: 'Project Created Successfully',
            message: `Your custom project "${quote.project_title}" has been created and work will begin shortly.`,
            projectTitle: quote.project_title,
            amount: quote.total_amount,
            currency: quote.currency,
            actionUrl: `${Deno.env.get('SITE_URL') || 'https://teamsmiths.ai'}/projects/${project.id}`
          }
        }
      });
    } catch (notificationError) {
      console.error("Error sending notifications:", notificationError);
      // Don't fail the entire operation for notification errors
    }

    return new Response(
      JSON.stringify({ 
        projectId: project.id,
        message: "Project created successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in create-project-from-quote:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});