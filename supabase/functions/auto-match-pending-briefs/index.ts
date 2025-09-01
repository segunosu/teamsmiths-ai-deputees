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
    const { scheduled } = await req.json().catch(() => ({}));
    
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Starting autopilot matching for pending briefs... ${scheduled ? '(scheduled)' : '(manual)'}`);

    // Check if autopilot is enabled
    const { data: autopilotSettings } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'autopilot_enabled')
      .single();

    const autopilotEnabled = autopilotSettings?.setting_value === true;
    
    if (!autopilotEnabled && scheduled) {
      console.log('Autopilot is disabled, skipping scheduled run');
      return new Response(JSON.stringify({
        ok: true,
        processed: 0,
        matched: 0,
        invitations_sent: 0,
        message: 'Autopilot disabled'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get briefs submitted in last 48h that need matching
    const { data: pendingBriefs, error: briefsError } = await supabase
      .from('briefs')
      .select('id, project_title, created_at, contact_email, contact_name, structured_brief')
      .eq('status', 'submitted')
      .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .is('matched_at', null);

    if (briefsError) {
      console.error('Error fetching pending briefs:', briefsError);
      throw new Error(`Failed to fetch briefs: ${briefsError.message}`);
    }

    console.log(`Found ${pendingBriefs?.length || 0} pending briefs for autopilot matching`);

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
              max_invites: maxInvites,
              autopilot: true
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

          // Send client confirmation notification
          if (brief.contact_email) {
            const clientNotification = {
              user_id: null, // For guest clients
              type: 'client_confirmation',
              title: `Your project is being matched with experts`,
              message: `We've invited ${inviteResult.sent} experts who match your requirements. Expect proposals within 48 hours.`,
              related_id: brief.id,
              metadata: {
                project_title: brief.project_title,
                expert_count: inviteResult.sent,
                autopilot: true
              }
            };

            // Insert notification
            await supabase.from('notifications').insert(clientNotification);

            // Send email notification
            await supabase.functions.invoke('send-notification-email', {
              body: {
                to: brief.contact_email,
                type: 'client_confirmation',
                data: {
                  title: clientNotification.title,
                  message: clientNotification.message,
                  projectTitle: brief.project_title,
                  expertCount: inviteResult.sent
                }
              }
            }).catch(emailError => {
              console.error(`Email notification failed for client ${brief.contact_email}:`, emailError);
            });
          }

          totalMatched++;
          totalInvitesSent += inviteResult.sent || 0;
          
          console.log(`✅ Autopilot success: Brief ${brief.id} matched with ${inviteResult.sent} experts`);
        } else {
          console.log(`❌ No suitable candidates found for brief ${brief.id}`);
        }

      } catch (error) {
        console.error(`Error processing brief ${brief.id}:`, error);
        continue;
      }
    }

    console.log(`🚀 Autopilot completed: ${totalMatched} briefs matched, ${totalInvitesSent} invitations sent`);

    // Log autopilot run
    if (totalMatched > 0 || totalInvitesSent > 0) {
      await supabase.from('matching_runs').insert({
        brief_id: null, // Global autopilot run
        algorithm_version: 'autopilot-v1',
        parameters: { min_score: minScore, max_invites: maxInvites, scheduled },
        candidate_count: totalInvitesSent,
        execution_time_ms: Date.now() - (new Date().getTime()),
        metadata: {
          autopilot: true,
          processed: pendingBriefs?.length || 0,
          matched: totalMatched,
          invitations_sent: totalInvitesSent
        }
      }).catch(logError => {
        console.error('Failed to log autopilot run:', logError);
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      processed: pendingBriefs?.length || 0,
      matched: totalMatched,
      invitations_sent: totalInvitesSent,
      autopilot: autopilotEnabled
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