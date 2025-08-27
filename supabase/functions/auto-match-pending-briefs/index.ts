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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log('Auto-match cron started');

    // Get matching settings
    const { data: settings, error: settingsError } = await supabase.rpc('admin_get_matching_settings');
    
    if (settingsError) {
      console.error('Failed to get settings:', settingsError);
      return new Response(JSON.stringify({ error: 'Failed to get settings' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const autoMatchEnabled = settings?.auto_match_enabled || false;
    const minScore = settings?.min_score_default || 0.65;
    const maxInvites = settings?.max_invites_default || 5;

    if (!autoMatchEnabled) {
      console.log('Auto-match is disabled');
      return new Response(JSON.stringify({ 
        message: 'Auto-match disabled',
        processed: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get pending briefs (submitted status, older than 5 minutes to avoid race conditions)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: pendingBriefs, error: briefsError } = await supabase
      .from('briefs')
      .select('id, project_title, created_at')
      .eq('status', 'submitted')
      .lt('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: true })
      .limit(100);

    if (briefsError) {
      console.error('Failed to get pending briefs:', briefsError);
      return new Response(JSON.stringify({ error: 'Failed to get briefs' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!pendingBriefs?.length) {
      console.log('No pending briefs found');
      return new Response(JSON.stringify({ 
        message: 'No pending briefs',
        processed: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ${pendingBriefs.length} pending briefs`);

    let processed = 0;
    let invitationsSent = 0;

    for (const brief of pendingBriefs) {
      try {
        console.log(`Processing brief ${brief.id}: ${brief.project_title}`);

        // Compute matches
        const { data: matchingData, error: matchingError } = await supabase.functions.invoke('compute-matches', {
          body: {
            brief_id: brief.id,
            min_score: minScore,
            max_invites: maxInvites + 2 // Get a few extra for buffer
          }
        });

        if (matchingError) {
          console.error(`Matching failed for brief ${brief.id}:`, matchingError);
          continue;
        }

        if (matchingData?.ok && matchingData.candidates?.length > 0) {
          // Filter candidates by min score
          const eligibleCandidates = matchingData.candidates
            .filter((c: any) => c.score >= minScore)
            .slice(0, maxInvites);

          if (eligibleCandidates.length > 0) {
            console.log(`Found ${eligibleCandidates.length} eligible candidates for brief ${brief.id}`);

            // Send invitations
            const candidateIds = eligibleCandidates.map((c: any) => c.expert_user_id || c.expert_id);
            
            const { data: inviteData, error: inviteError } = await supabase.functions.invoke('send-invitations', {
              body: {
                brief_id: brief.id,
                candidate_ids: candidateIds,
                max_invites: maxInvites
              }
            });

            if (inviteError) {
              console.error(`Failed to send invitations for brief ${brief.id}:`, inviteError);
              continue;
            }

            if (inviteData?.sent > 0) {
              invitationsSent += inviteData.sent;
              
              // Update brief status to indicate invitations sent
              await supabase
                .from('briefs')
                .update({ 
                  status: 'invitations_sent',
                  matching_results: matchingData.candidates,
                  matched_at: new Date().toISOString()
                })
                .eq('id', brief.id);

              // Create notification for brief owner
              const { data: briefData } = await supabase
                .from('briefs')
                .select('user_id, contact_email, contact_name')
                .eq('id', brief.id)
                .single();

              if (briefData?.user_id) {
                await supabase.rpc('create_notification', {
                  p_user_id: briefData.user_id,
                  p_type: 'experts_matched',
                  p_title: 'Experts Found for Your Project',
                  p_message: `We've found ${inviteData.sent} qualified experts for your project and sent them invitations.`,
                  p_related_id: brief.id
                });
              }

              console.log(`Sent ${inviteData.sent} invitations for brief ${brief.id}`);
            }
          } else {
            console.log(`No eligible candidates found for brief ${brief.id} (min score: ${minScore})`);
          }
        } else {
          console.log(`No candidates found for brief ${brief.id}`);
        }

        processed++;

      } catch (briefError: any) {
        console.error(`Error processing brief ${brief.id}:`, briefError);
      }
    }

    // Log the auto-match run
    await supabase.from('matching_runs').insert({
      brief_id: null, // Null indicates this was an auto-match batch
      candidates_found: invitationsSent,
      min_score: minScore,
      max_invites: maxInvites,
      metadata: {
        type: 'auto_match_cron',
        processed_briefs: processed,
        total_invitations: invitationsSent
      }
    });

    console.log(`Auto-match completed: processed ${processed} briefs, sent ${invitationsSent} invitations`);

    return new Response(JSON.stringify({
      success: true,
      processed,
      invitations_sent: invitationsSent,
      message: `Processed ${processed} briefs, sent ${invitationsSent} invitations`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in auto-match-pending-briefs:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Auto-match cron failed"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});