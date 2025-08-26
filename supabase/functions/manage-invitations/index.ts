import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  action: 'send_invites' | 'respond_to_invite' | 'check_expired';
  brief_id?: string;
  user_ids?: string[];
  min_score?: number;
  max_invites?: number;
  response?: 'accepted' | 'declined';
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

    const { action, brief_id, user_ids, min_score, max_invites, response, invite_id }: InvitationRequest = await req.json();

    console.log(`Managing invitations: ${action}`);

    switch (action) {
      case 'send_invites':
        return await sendInvites(supabase, brief_id!, user_ids!, min_score, max_invites);
      
      case 'respond_to_invite':
        return await respondToInvite(supabase, invite_id!, response!);
      
      case 'check_expired':
        return await checkExpiredInvites(supabase);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error: any) {
    console.error("Error in manage-invitations:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendInvites(supabase: any, briefId: string, userIds: string[], minScore?: number, maxInvites?: number) {
  console.log(`Sending invites for brief ${briefId} to ${userIds.length} candidates`);
  
  // Check for existing invitations to avoid duplicates
  const { data: existingInvites } = await supabase
    .from('expert_invites')
    .select('expert_user_id')
    .eq('brief_id', briefId);
  
  const alreadyInvited = existingInvites?.map((invite: any) => invite.expert_user_id) || [];
  const newUserIds = userIds.filter(id => !alreadyInvited.includes(id));
  
  if (newUserIds.length === 0) {
    return new Response(JSON.stringify({ sent: 0, skipped: userIds.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Limit to maxInvites if specified
  const finalUserIds = maxInvites ? newUserIds.slice(0, maxInvites) : newUserIds;
  
  // Get SLA hours from admin settings (default 120 hours = 5 days)
  const { data: slaData } = await supabase
    .from('admin_settings')
    .select('setting_value')
    .eq('setting_key', 'sla_hours')
    .single();
  
  const slaHours = slaData?.setting_value || 120;
  const expiresAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);

  // Create invitations
  const invitations = finalUserIds.map(userId => ({
    brief_id: briefId,
    expert_user_id: userId,
    expires_at: expiresAt.toISOString(),
    status: 'sent',
    score_at_invite: minScore || 0.65
  }));

  const { data: insertedInvites, error: inviteError } = await supabase
    .from('expert_invites')
    .insert(invitations)
    .select();

  if (inviteError) {
    console.error('Error creating invitations:', inviteError);
    throw new Error('Failed to create invitations');
  }

  // Get brief details for notifications
  const { data: brief } = await supabase
    .from('briefs')
    .select('structured_brief')
    .eq('id', briefId)
    .single();

  const projectTitle = brief?.structured_brief?.goal?.interpreted || 'New Project';

  // Create notifications for each invited user (only for real users, not shadow)
  const realUserInvites = insertedInvites.filter((invite: any) => 
    invite.expert_user_id && !invite.expert_user_id.toString().includes('shadow')
  );
  
  if (realUserInvites.length > 0) {
    const notifications = realUserInvites.map((invite: any) => ({
      user_id: invite.expert_user_id,
      type: 'invitation',
      title: 'New Project Invitation',
      message: `You've been invited to quote on: ${projectTitle}`,
      related_id: invite.id
    }));

    await supabase.from('notifications').insert(notifications);
  }

  console.log(`Successfully sent ${insertedInvites.length} invitations`);

  return new Response(JSON.stringify({ 
    sent: insertedInvites.length, 
    skipped: userIds.length - insertedInvites.length,
    expires_at: expiresAt.toISOString()
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function respondToInvite(supabase: any, inviteId: string, response: string) {
  // Update invitation status
  const { data: updatedInvite, error: updateError } = await supabase
    .from("invite_status")
    .update({
      status: response,
      responded_at: new Date().toISOString()
    })
    .eq("id", inviteId)
    .select("*, customization_requests(project_title)")
    .single();

  if (updateError) {
    throw new Error(`Failed to update invitation: ${updateError.message}`);
  }

  // If accepted, create a draft quote for the freelancer
  if (response === 'accepted') {
    const { error: quoteError } = await supabase
      .from("standardized_quotes")
      .insert({
        request_id: updatedInvite.request_id,
        freelancer_id: updatedInvite.user_id,
        total_price: 0, // Will be filled by freelancer
        status: 'draft',
        validity_until: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString() // 7 days
      });

    if (quoteError) {
      console.error("Failed to create draft quote:", quoteError);
    }
  }

  console.log(`Invitation ${inviteId} ${response}`);

  return new Response(JSON.stringify({
    success: true,
    status: response,
    project_title: updatedInvite.customization_requests?.project_title
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function checkExpiredInvites(supabase: any) {
  const now = new Date().toISOString();

  // Find expired invites that are still 'sent'
  const { data: expiredInvites, error: findError } = await supabase
    .from("invite_status")
    .select("*")
    .eq("status", "sent")
    .lt("expires_at", now);

  if (findError) {
    throw new Error(`Failed to find expired invites: ${findError.message}`);
  }

  if (expiredInvites.length === 0) {
    return new Response(JSON.stringify({
      success: true,
      expired_count: 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Mark them as expired
  const { error: updateError } = await supabase
    .from("invite_status")
    .update({
      status: "expired",
      responded_at: now
    })
    .in("id", expiredInvites.map(i => i.id));

  if (updateError) {
    throw new Error(`Failed to mark invites as expired: ${updateError.message}`);
  }

  // For each expired request, check if we need to send more invites
  const requestIds = [...new Set(expiredInvites.map(i => i.request_id))];
  
  for (const requestId of requestIds) {
    // Check how many active invites remain
    const { data: activeInvites } = await supabase
      .from("invite_status")
      .select("*")
      .eq("request_id", requestId)
      .in("status", ["sent", "accepted"]);

    // If no active invites, try to send to next best candidates
    if (!activeInvites || activeInvites.length === 0) {
      await rollInvitesToNextCandidates(supabase, requestId);
    }
  }

  console.log(`Processed ${expiredInvites.length} expired invitations`);

  return new Response(JSON.stringify({
    success: true,
    expired_count: expiredInvites.length
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function rollInvitesToNextCandidates(supabase: any, requestId: string) {
  // Get the latest matching snapshot
  const { data: snapshot, error: snapshotError } = await supabase
    .from("matching_snapshots")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (snapshotError || !snapshot) {
    console.log(`No matching snapshot found for request ${requestId}`);
    return;
  }

  // Get all users who have already been invited
  const { data: previousInvites } = await supabase
    .from("invite_status")
    .select("user_id")
    .eq("request_id", requestId);

  const alreadyInvited = new Set(previousInvites?.map(i => i.user_id) || []);

  // Find next candidates who haven't been invited
  const nextCandidates = snapshot.candidates
    .filter((c: any) => !alreadyInvited.has(c.user_id))
    .slice(0, 2); // Invite up to 2 more

  if (nextCandidates.length > 0) {
    const userIds = nextCandidates.map((c: any) => c.user_id);
    await sendInvites(supabase, requestId, userIds);
    
    console.log(`Rolled invitations to ${nextCandidates.length} additional candidates for request ${requestId}`);
  }
}