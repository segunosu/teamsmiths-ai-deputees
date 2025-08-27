import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  brief_id: string;
  candidate_ids: string[];
  max_invites: number;
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

    const { brief_id, candidate_ids, max_invites }: InvitationRequest = await req.json();

    console.log(`Sending invitations for brief ${brief_id} to ${candidate_ids.length} candidates`);

    if (!candidate_ids.length) {
      return new Response(JSON.stringify({
        sent: 0,
        skipped: 0,
        message: "No candidates provided"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduplicate via UNIQUE constraint - insert invitations
    let sent = 0;
    let skipped = 0;

    for (const expert_user_id of candidate_ids.slice(0, max_invites)) {
      try {
        const { error } = await supabase.from('expert_invites').insert({
          brief_id,
          expert_user_id,
          status: 'sent',
          expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
          invitation_message: 'You have been matched to a new project opportunity'
        });

        if (error) {
          // Likely a duplicate due to UNIQUE constraint
          if (error.code === '23505') {
            skipped++;
            console.log(`Skipped duplicate invitation for expert ${expert_user_id}`);
          } else {
            throw error;
          }
        } else {
          sent++;
          console.log(`Sent invitation to expert ${expert_user_id}`);
        }
      } catch (inviteError: any) {
        console.error(`Failed to invite expert ${expert_user_id}:`, inviteError);
        skipped++;
      }
    }

    // Log the invitation event
    await supabase.from('brief_events').insert({
      brief_id,
      type: 'invitations_sent',
      payload: {
        sent,
        skipped,
        total_candidates: candidate_ids.length
      }
    });

    return new Response(JSON.stringify({
      sent,
      skipped,
      message: sent > 0 ? `Sent ${sent} invitation(s)` : 'No new invitations sent'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in send-invitations:", error);
    
    return new Response(JSON.stringify({
      sent: 0,
      skipped: 0,
      error: error.message || "Failed to send invitations"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});