import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteResponse {
  invite_id: string;
  action: 'accept' | 'decline';
  response_message?: string;
  proposal_details?: {
    estimated_timeline: string;
    key_deliverables: string[];
    approach: string;
  };
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

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invite_id, action, response_message, proposal_details }: InviteResponse = await req.json();

    console.log(`Expert ${user.id} responding to invite ${invite_id} with action: ${action}`);

    // Get invite and brief details
    const { data: invite, error: inviteError } = await supabase
      .from('expert_invites')
      .select(`
        *,
        briefs (
          id, contact_name, contact_email, project_title, structured_brief
        )
      `)
      .eq('id', invite_id)
      .eq('expert_user_id', user.id)
      .eq('status', 'sent')
      .single();

    if (inviteError || !invite) {
      return new Response(JSON.stringify({ 
        error: 'Invite not found or not eligible for response' 
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update the invite
    const updateData: any = {
      status: action === 'accept' ? 'accepted' : 'declined',
      responded_at: new Date().toISOString(),
      response_message: response_message || null
    };

    if (action === 'accept' && proposal_details) {
      updateData.acceptance_metadata = proposal_details;
    }

    const { error: updateError } = await supabase
      .from('expert_invites')
      .update(updateData)
      .eq('id', invite_id);

    if (updateError) throw updateError;

    if (action === 'accept') {
      // Get expert profile for notification
      const { data: expertProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .single();

      // Notify brief owner about acceptance
      const { data: briefOwner } = await supabase
        .from('briefs')
        .select('user_id, contact_email, contact_name')
        .eq('id', invite.brief_id)
        .single();

      if (briefOwner?.user_id) {
        await supabase.rpc('create_notification', {
          p_user_id: briefOwner.user_id,
          p_type: 'expert_accepted',
          p_title: 'Expert Accepted Your Project',
          p_message: `${expertProfile?.full_name || 'An expert'} has accepted your project invitation. Click to confirm and start the project.`,
          p_related_id: invite.brief_id
        });
      }

      // Update brief status if this is the first acceptance
      const { data: briefStatus } = await supabase
        .from('briefs')
        .select('status')
        .eq('id', invite.brief_id)
        .single();

      if (briefStatus?.status === 'submitted') {
        await supabase
          .from('briefs')
          .update({ status: 'expert_responses_received' })
          .eq('id', invite.brief_id);
      }

      // Log event
      await supabase.from('brief_events').insert({
        brief_id: invite.brief_id,
        type: 'expert_accepted',
        payload: {
          expert_user_id: user.id,
          expert_name: expertProfile?.full_name,
          proposal_details
        }
      });

    } else {
      // Handle decline - check if all experts have declined
      const { data: allInvites } = await supabase
        .from('expert_invites')
        .select('status')
        .eq('brief_id', invite.brief_id);

      const allDeclined = allInvites?.every(inv => inv.status === 'declined');
      
      if (allDeclined) {
        // Update brief to need more experts
        await supabase
          .from('briefs')
          .update({ status: 'needs_more_experts' })
          .eq('id', invite.brief_id);

        // Notify admin or brief owner
        const { data: briefOwner } = await supabase
          .from('briefs')
          .select('user_id, contact_email')
          .eq('id', invite.brief_id)
          .single();

        if (briefOwner?.user_id) {
          await supabase.rpc('create_notification', {
            p_user_id: briefOwner.user_id,
            p_type: 'experts_declined',
            p_title: 'Expert Pool Needs Expansion',
            p_message: 'All invited experts have declined. We\'ll find additional candidates for your project.',
            p_related_id: invite.brief_id
          });
        }
      }

      // Log decline event
      await supabase.from('brief_events').insert({
        brief_id: invite.brief_id,
        type: 'expert_declined',
        payload: {
          expert_user_id: user.id,
          response_message
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      action,
      message: action === 'accept' ? 'Invitation accepted successfully' : 'Invitation declined'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in respond-to-invite:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to respond to invitation"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});