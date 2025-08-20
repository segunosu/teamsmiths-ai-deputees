import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  action: 'send_invites' | 'respond_to_invite' | 'check_expired';
  request_id?: string;
  user_ids?: string[];
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

    const { action, request_id, user_ids, response, invite_id }: InvitationRequest = await req.json();

    console.log(`Managing invitations: ${action}`);

    switch (action) {
      case 'send_invites':
        return await sendInvites(supabase, request_id!, user_ids!);
      
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

async function sendInvites(supabase: any, requestId: string, userIds: string[]) {
  // Get SLA hours from admin settings
  const { data: adminSettings } = await supabase
    .from("admin_settings")
    .select("setting_value")
    .eq("setting_key", "matching_config")
    .single();

  const slaHours = adminSettings?.setting_value?.invite_response_sla_hours || 24;
  const expiresAt = new Date(Date.now() + (slaHours * 60 * 60 * 1000));

  // Create invitation records
  const invitations = userIds.map(userId => ({
    request_id: requestId,
    user_id: userId,
    status: 'sent',
    expires_at: expiresAt.toISOString()
  }));

  const { data: createdInvites, error: inviteError } = await supabase
    .from("invite_status")
    .insert(invitations)
    .select("*");

  if (inviteError) {
    throw new Error(`Failed to create invitations: ${inviteError.message}`);
  }

  // Get request details for notification
  const { data: request } = await supabase
    .from("customization_requests")
    .select("project_title, custom_requirements")
    .eq("id", requestId)
    .single();

  // Create notifications for each invited freelancer
  for (const invite of createdInvites) {
    await supabase
      .from("notifications")
      .insert({
        user_id: invite.user_id,
        type: "project_invitation",
        title: "New Project Invitation",
        message: `You've been invited to quote on "${request?.project_title}". Review the brief and submit your quote within ${slaHours} hours.`,
        related_id: requestId
      });
  }

  console.log(`Sent ${createdInvites.length} invitations for request ${requestId}`);

  return new Response(JSON.stringify({
    success: true,
    invitations_sent: createdInvites.length,
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