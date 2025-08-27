import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProjectCreationRequest {
  brief_id: string;
  expert_user_id: string;
  invite_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { brief_id, expert_user_id, invite_id }: ProjectCreationRequest = await req.json();

    console.log(`Creating project for brief ${brief_id} with expert ${expert_user_id}`);

    // Get brief details
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', brief_id)
      .single();

    if (briefError || !brief) {
      throw new Error("Brief not found");
    }

    // Get expert profile
    const { data: expertProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', expert_user_id)
      .single();

    // Get invite details if provided
    let proposalDetails = {};
    if (invite_id) {
      const { data: invite } = await supabase
        .from('expert_invites')
        .select('acceptance_metadata')
        .eq('id', invite_id)
        .single();
      
      proposalDetails = invite?.acceptance_metadata || {};
    }

    // Extract budget from structured brief
    const structuredBrief = brief.structured_brief || {};
    const budgetText = structuredBrief.budget_range || '';
    const budgetMatch = budgetText.match(/[\d,]+/g);
    const budgetAmount = budgetMatch ? parseInt(budgetMatch[0].replace(/,/g, '')) * 100 : 500000; // Default £5000

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        brief_id,
        expert_user_id,
        client_user_id: brief.user_id,
        title: structuredBrief.goal?.interpreted || brief.project_title || 'New Project',
        description: structuredBrief.context?.interpreted || 'Project created from brief',
        status: 'active',
        budget_amount: budgetAmount,
        currency: 'gbp'
      })
      .select()
      .single();

    if (projectError) throw projectError;

    console.log(`Created project ${project.id}`);

    // Create initial milestones based on proposal or defaults
    const proposalMilestones = proposalDetails?.milestones || [];
    
    if (proposalMilestones.length === 0) {
      // Create default milestones
      const defaultMilestones = [
        {
          title: 'Project Kickoff & Planning',
          description: 'Initial discovery and project setup',
          amount: Math.floor(budgetAmount * 0.3),
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        },
        {
          title: 'Development & Implementation',
          description: 'Core work and development phase',
          amount: Math.floor(budgetAmount * 0.5),
          due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
        },
        {
          title: 'Review & Delivery',
          description: 'Final review, testing and project delivery',
          amount: Math.floor(budgetAmount * 0.2),
          due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks
        }
      ];

      for (const milestone of defaultMilestones) {
        await supabase.from('project_milestones').insert({
          project_id: project.id,
          ...milestone
        });
      }
    } else {
      // Create milestones from proposal
      for (const milestone of proposalMilestones) {
        await supabase.from('project_milestones').insert({
          project_id: project.id,
          title: milestone.title,
          description: milestone.description,
          amount: milestone.amount,
          due_date: milestone.due_date,
        });
      }
    }

    // Add participants to project
    if (brief.user_id && brief.user_id !== expert_user_id) {
      await supabase.from('project_participants').insert({
        project_id: project.id,
        user_id: brief.user_id,
        role: 'client'
      }).catch(() => {}); // Ignore if table doesn't exist yet
    }

    await supabase.from('project_participants').insert({
      project_id: project.id,
      user_id: expert_user_id,
      role: 'expert'
    }).catch(() => {}); // Ignore if table doesn't exist yet

    // Update brief status
    await supabase.from('briefs').update({
      status: 'project_created',
      matched_expert_id: expert_user_id
    }).eq('id', brief_id);

    // Decline all other pending invites for this brief
    await supabase
      .from('expert_invites')
      .update({ 
        status: 'declined', 
        response_message: 'Project already allocated to another expert' 
      })
      .eq('brief_id', brief_id)
      .eq('status', 'sent')
      .neq('expert_user_id', expert_user_id);

    // Send welcome message in project chat
    const welcomeMessage = `Welcome to your new project! 🎉\n\nThis project was created from your brief and we're excited to get started. Your expert ${expertProfile?.full_name || 'team member'} is ready to begin work.\n\nUse this chat to communicate throughout the project. You can also schedule meetings and track milestones from your project dashboard.`;

    await supabase.from('project_messages').insert({
      project_id: project.id,
      sender_user_id: expert_user_id, // System message from expert
      content: welcomeMessage,
      message_type: 'system'
    });

    // Notify client
    if (brief.user_id) {
      await supabase.from('notifications').insert({
        user_id: brief.user_id,
        type: 'project_created',
        title: 'Your Project is Ready!',
        message: `Your project with ${expertProfile?.full_name || 'your expert'} has been created and is ready to begin. Check your project dashboard to get started.`,
        related_id: project.id
      });
    }

    // Notify expert
    await supabase.from('notifications').insert({
      user_id: expert_user_id,
      type: 'project_created',
      title: 'Project Created - Ready to Begin',
      message: `Your new project "${project.title}" is ready. You can now communicate with your client and begin work.`,
      related_id: project.id
    });

    // Log project creation event
    await supabase.from('brief_events').insert({
      brief_id,
      type: 'project_created',
      payload: {
        project_id: project.id,
        expert_user_id,
        expert_name: expertProfile?.full_name
      }
    });

    console.log(`Project creation completed for brief ${brief_id}`);

    return new Response(JSON.stringify({
      status: 'success',
      project_id: project.id,
      message: 'Project created successfully'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in create-project-from-acceptance:", error);
    
    return new Response(JSON.stringify({
      status: "error",
      message: error.message || "Failed to create project"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});