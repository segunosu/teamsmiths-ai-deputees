import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const createManageInvitationsEdgeFunction = () => `
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, brief_id, user_ids, score_threshold } = await req.json();

    console.log(\`Processing invitation request: \${action} for brief \${brief_id}\`);

    if (action === 'send_invites') {
      // Check for existing invites to prevent duplicates
      const { data: existingInvites } = await supabase
        .from('expert_invites')
        .select('expert_user_id')
        .eq('brief_id', brief_id)
        .in('expert_user_id', user_ids);

      const alreadyInvited = existingInvites?.map(inv => inv.expert_user_id) || [];
      const newInvites = user_ids.filter(id => !alreadyInvited.includes(id));

      if (newInvites.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          message: 'All selected experts have already been invited',
          invitations_sent: 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create invitation records
      const inviteRecords = newInvites.map(user_id => ({
        brief_id,
        expert_user_id: user_id,
        status: 'sent',
        sent_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        score_at_invite: score_threshold || 0.65
      }));

      const { data: createdInvites, error: inviteError } = await supabase
        .from('expert_invites')
        .insert(inviteRecords)
        .select();

      if (inviteError) {
        throw new Error(\`Failed to create invites: \${inviteError.message}\`);
      }

      // Log the event
      await supabase.from('brief_events').insert({
        brief_id,
        type: 'invites_sent',
        payload: { 
          invited_experts: newInvites.length,
          score_threshold,
          timestamp: new Date().toISOString()
        }
      });

      // TODO: Send actual email notifications here
      // This would integrate with your email service (Resend, etc.)

      console.log(\`Successfully sent \${newInvites.length} invitations for brief \${brief_id}\`);

      return new Response(JSON.stringify({
        success: true,
        invitations_sent: newInvites.length,
        already_invited: alreadyInvited.length,
        message: \`Successfully sent \${newInvites.length} invitations\`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Error in manage-invitations function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 200, // Return 200 to prevent client-side errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
`;

// This component just exports the edge function code for manual creation
// The actual component functionality would be handled by the MatchingDashboard
export default function ManageInvitations() {
  return null;
}