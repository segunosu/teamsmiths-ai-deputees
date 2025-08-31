import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendInvitationsRequest {
  brief_id: string;
  candidate_ids: string[];
  max_invites: number;
  candidates?: Array<{
    expert_id: string;
    score: number;
    reasons: string[];
    flags: string[];
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { brief_id, candidate_ids, max_invites, candidates = [] }: SendInvitationsRequest = await req.json();

    console.log(`Sending invitations for brief ${brief_id} to ${candidate_ids.length} candidates`);

    // Fetch brief details for email content
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', brief_id)
      .single();

    if (briefError || !brief) {
      throw new Error(`Brief not found: ${briefError?.message}`);
    }

    // Get expert profiles for email addresses
    const { data: experts, error: expertsError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name')
      .in('user_id', candidate_ids);

    if (expertsError) {
      throw new Error(`Failed to fetch expert profiles: ${expertsError.message}`);
    }

    const sent: string[] = [];
    const skipped: string[] = [];

    // Create expert invites with deduplication
    for (const candidate_id of candidate_ids.slice(0, max_invites)) {
      try {
        // Check if invitation already exists
        const { data: existingInvite } = await supabase
          .from('expert_invites')
          .select('id')
          .eq('brief_id', brief_id)
          .eq('expert_user_id', candidate_id)
          .single();

        if (existingInvite) {
          console.log(`Skipping duplicate invitation for expert ${candidate_id}`);
          skipped.push(candidate_id);
          continue;
        }

        // Find candidate data for reasons/flags
        const candidateData = candidates.find(c => c.expert_id === candidate_id);
        const expert = experts?.find(e => e.user_id === candidate_id);

        if (!expert?.email) {
          console.log(`No email found for expert ${candidate_id}`);
          skipped.push(candidate_id);
          continue;
        }

        // Generate invitation message with rationale
        const reasons = candidateData?.reasons || ['Good fit for this project'];
        const flags = candidateData?.flags || [];
        
        let invitation_message = `You've been matched for: ${brief.project_title || 'New Project'}\n\n`;
        invitation_message += `Why you're a great fit:\n${reasons.map(r => `• ${r}`).join('\n')}\n\n`;
        
        if (flags.length > 0) {
          invitation_message += `Note: ${flags.join(', ')}\n\n`;
        }
        
        invitation_message += `Project timeline: ${brief.urgency_level || 'Standard'}\n`;
        invitation_message += `Budget range: ${brief.budget_range || 'To be discussed'}\n\n`;
        invitation_message += `Interested? Please respond by the expiry date to secure your spot.`;

        // Create expert invite
        const { error: inviteError } = await supabase
          .from('expert_invites')
          .insert({
            brief_id,
            expert_user_id: candidate_id,
            expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
            invitation_message,
            score_at_invite: candidateData?.score || 0.65
          });

        if (inviteError) {
          console.error(`Failed to create invite for ${candidate_id}:`, inviteError);
          skipped.push(candidate_id);
          continue;
        }

        // TODO: Send actual email via Resend/notification system
        // For now, just log that we would send an email
        console.log(`Would send email to ${expert.email} (${expert.full_name})`);
        console.log(`Email content preview: ${invitation_message.substring(0, 100)}...`);

        sent.push(candidate_id);

      } catch (error) {
        console.error(`Error processing invitation for ${candidate_id}:`, error);
        skipped.push(candidate_id);
      }
    }

    console.log(`Invitations: ${sent.length} sent, ${skipped.length} skipped`);

    // TODO: Update brief status and send client notification
    if (sent.length > 0) {
      await supabase
        .from('briefs')
        .update({ 
          status: 'proposal_ready',
          matched_at: new Date().toISOString()
        })
        .eq('id', brief_id);
    }

    return new Response(JSON.stringify({
      ok: true,
      brief_id,
      sent: sent.length,
      skipped: skipped.length,
      sent_to: sent,
      skipped_ids: skipped
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-invitations function:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});