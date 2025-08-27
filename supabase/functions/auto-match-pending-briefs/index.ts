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

    console.log("Starting auto-match job for pending briefs...");

    // Get pending briefs that need matching
    const { data: pendingBriefs, error: briefsError } = await supabase
      .from('briefs')
      .select('id, project_title, created_at')
      .eq('status', 'submitted')
      .is('matched_at', null)
      .order('created_at', { ascending: true })
      .limit(100);

    if (briefsError) {
      throw briefsError;
    }

    if (!pendingBriefs || pendingBriefs.length === 0) {
      console.log("No pending briefs found");
      return new Response(JSON.stringify({
        processed: 0,
        matched: 0,
        message: "No pending briefs found"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${pendingBriefs.length} pending briefs to process`);

    let processed = 0;
    let matched = 0;

    // Process each brief
    for (const brief of pendingBriefs) {
      try {
        console.log(`Processing brief ${brief.id}: ${brief.project_title}`);

        // Compute matches with default threshold
        const { data: matchData, error: matchError } = await supabase.functions.invoke('compute-matches', {
          body: {
            brief_id: brief.id,
            min_score: 0.65,
            max_results: 5
          }
        });

        if (matchError) {
          console.error(`Failed to compute matches for brief ${brief.id}:`, matchError);
          continue;
        }

        processed++;

        if (matchData?.ok && matchData.candidates?.length > 0) {
          // Send invitations to eligible candidates
          const { data: inviteData, error: inviteError } = await supabase.functions.invoke('send-invitations', {
            body: {
              brief_id: brief.id,
              candidate_ids: matchData.candidates.map((c: any) => c.expert_user_id),
              max_invites: 5
            }
          });

          if (inviteError) {
            console.error(`Failed to send invitations for brief ${brief.id}:`, inviteError);
          } else if (inviteData?.sent > 0) {
            matched++;
            
            // Update brief status to proposal_ready
            await supabase
              .from('briefs')
              .update({ 
                status: 'proposal_ready',
                matched_at: new Date().toISOString()
              })
              .eq('id', brief.id);

            console.log(`Successfully matched brief ${brief.id} with ${inviteData.sent} invitations`);
          }
        } else {
          console.log(`No eligible candidates found for brief ${brief.id}`);
        }

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`Error processing brief ${brief.id}:`, error);
      }
    }

    console.log(`Auto-match job completed: ${processed} processed, ${matched} matched`);

    return new Response(JSON.stringify({
      processed,
      matched,
      message: `Processed ${processed} briefs, matched ${matched} successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in auto-match job:", error);
    
    return new Response(JSON.stringify({
      processed: 0,
      matched: 0,
      error: error.message || "Auto-match job failed"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});