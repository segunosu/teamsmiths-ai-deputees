import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting auto-match for pending briefs...');

    // Get briefs submitted in last 48h that need matching
    const { data: pendingBriefs, error: briefsError } = await supabase
      .from('briefs')
      .select('id, project_title, created_at')
      .eq('status', 'submitted')
      .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .is('matched_at', null);

    if (briefsError) {
      console.error('Error fetching pending briefs:', briefsError);
      throw new Error(`Failed to fetch briefs: ${briefsError.message}`);
    }

    console.log(`Found ${pendingBriefs?.length || 0} pending briefs`);

    // Get default settings
    const { data: settings } = await supabase.rpc('admin_get_matching_settings');
    const minScore = settings?.min_score_default || 0.65;
    const maxInvites = settings?.max_invites_default || 5;

    let totalMatched = 0;
    let totalInvitesSent = 0;

    // Process each brief
    for (const brief of pendingBriefs || []) {
      try {
        console.log(`Processing brief ${brief.id}: ${brief.project_title}`);

        // Compute matches
        const { data: matchResult, error: matchError } = await supabase.functions.invoke('compute-matches', {
          body: {
            brief_id: brief.id,
            min_score: minScore,
            max_invites: maxInvites
          }
        });

        if (matchError || !matchResult?.ok) {
          console.error(`Error computing matches for brief ${brief.id}:`, matchError);
          continue;
        }

        const candidates = matchResult.candidates || [];
        console.log(`Found ${candidates.length} candidates for brief ${brief.id}`);

        if (candidates.length > 0) {
          // Send invitations
          const candidateIds = candidates.map((c: any) => c.expert_id);
          
          const { data: inviteResult, error: inviteError } = await supabase.functions.invoke('send-invitations', {
            body: {
              brief_id: brief.id,
              candidate_ids: candidateIds,
              max_invites: maxInvites
            }
          });

          if (inviteError || !inviteResult?.ok) {
            console.error(`Error sending invitations for brief ${brief.id}:`, inviteError);
            continue;
          }

          // Update brief status
          await supabase
            .from('briefs')
            .update({
              status: 'proposal_ready',
              matched_at: new Date().toISOString()
            })
            .eq('id', brief.id);

          totalMatched++;
          totalInvitesSent += inviteResult.sent || 0;
          
          console.log(`Successfully matched brief ${brief.id}: sent ${inviteResult.sent} invitations`);
        } else {
          console.log(`No suitable candidates found for brief ${brief.id}`);
        }

      } catch (error) {
        console.error(`Error processing brief ${brief.id}:`, error);
        continue;
      }
    }

    console.log(`Auto-match completed: ${totalMatched} briefs matched, ${totalInvitesSent} invitations sent`);

    return new Response(JSON.stringify({
      ok: true,
      processed: pendingBriefs?.length || 0,
      matched: totalMatched,
      invitations_sent: totalInvitesSent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in auto-match function:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});