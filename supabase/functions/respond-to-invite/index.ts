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
    estimated_hours?: number;
    hourly_rate?: number;
    timeline_days?: number;
    approach_summary?: string;
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

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid authentication");

    const user = userData.user;
    const { invite_id, action, response_message, proposal_details }: InviteResponse = await req.json();

    console.log(`Expert ${user.id} responding to invite ${invite_id} with action: ${action}`);

    // Get invite details and verify ownership
    const { data: invite, error: inviteError } = await supabase
      .from('expert_invites')
      .select(`
        *,
        briefs:brief_id (
          id, user_id, contact_email, contact_name, 
          structured_brief, project_title
        )
      `)
      .eq('id', invite_id)
      .eq('expert_user_id', user.id)
      .single();

    if (inviteError || !invite) {
      throw new Error("Invite not found or access denied");
    }

    if (invite.status !== 'sent') {
      throw new Error(`Cannot respond to invite with status: ${invite.status}`);
    }

    const brief = invite.briefs;
    if (!brief) {
      throw new Error("Associated brief not found");
    }

    // Update invite status
    const updateData: any = {
      status: action === 'accept' ? 'accepted' : 'declined',
      responded_at: new Date().toISOString(),
      response_message,
      acceptance_metadata: action === 'accept' ? proposal_details || {} : {}
    };

    const { error: updateError } = await supabase
      .from('expert_invites')
      .update(updateData)
      .eq('id', invite_id);

    if (updateError) throw updateError;

    // Get expert profile info
    const { data: expertProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', user.id)
      .single();

    const expertName = expertProfile?.full_name || 'Expert';

    if (action === 'accept') {
      console.log(`Expert ${expertName} accepted invite for brief ${brief.id}`);

      // Notify client of acceptance
      if (brief.user_id) {
        await supabase.from('notifications').insert({
          user_id: brief.user_id,
          type: 'expert_accepted',
          title: 'Expert Accepted Your Project',
          message: `${expertName} has accepted your project invitation${response_message ? ': ' + response_message : '.'}`,
          related_id: brief.id
        });
      }

      // Update brief status if this is the first acceptance
      const { data: otherAcceptances } = await supabase
        .from('expert_invites')
        .select('id')
        .eq('brief_id', brief.id)
        .eq('status', 'accepted')
        .neq('id', invite_id);

      if (!otherAcceptances?.length) {
        await supabase.from('briefs').update({
          status: 'expert_responses_received'
        }).eq('id', brief.id);
      }

      // Log acceptance event
      await supabase.from('brief_events').insert({
        brief_id: brief.id,
        type: 'expert_accepted',
        payload: {
          expert_user_id: user.id,
          expert_name: expertName,
          proposal_details: proposal_details || {},
          response_message
        }
      });

    } else {
      console.log(`Expert ${expertName} declined invite for brief ${brief.id}`);

      // Log decline event
      await supabase.from('brief_events').insert({
        brief_id: brief.id,
        type: 'expert_declined',
        payload: {
          expert_user_id: user.id,
          expert_name: expertName,
          response_message
        }
      });

      // Check if we need more experts (if all have declined)
      const { data: remainingInvites } = await supabase
        .from('expert_invites')
        .select('status')
        .eq('brief_id', brief.id);

      const activeInvites = remainingInvites?.filter(i => i.status === 'sent') || [];
      const acceptedInvites = remainingInvites?.filter(i => i.status === 'accepted') || [];

      if (activeInvites.length === 0 && acceptedInvites.length === 0) {
        // No active invites and no acceptances - need more matching
        await supabase.from('briefs').update({
          status: 'needs_more_experts'
        }).eq('id', brief.id);

        if (brief.user_id) {
          await supabase.from('notifications').insert({
            user_id: brief.user_id,
            type: 'need_more_experts',
            title: 'Finding Additional Experts',
            message: 'We are finding additional qualified experts for your project.',
            related_id: brief.id
          });
        }
      }
    }

    return new Response(JSON.stringify({
      status: 'success',
      message: action === 'accept' 
        ? 'Invitation accepted successfully'
        : 'Invitation declined'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in respond-to-invite:", error);
    
    return new Response(JSON.stringify({
      status: "error",
      message: error.message || "Failed to respond to invitation"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});