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

    const { brief_id } = await req.json();

    console.log(`Auto AI matching triggered for brief: ${brief_id}`);

    // Check if AI-first matching is enabled
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'ai_first_matching')
      .single();

    const aiFirstEnabled = settings?.setting_value === true;
    
    if (!aiFirstEnabled) {
      console.log('AI-first matching disabled - brief queued for manual matching');
      return new Response(JSON.stringify({
        status: 'queued',
        message: 'Brief queued for manual matching'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get matching configuration
    const { data: configData } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'matching_config')
      .single();

    const config = configData?.setting_value || {};
    const minScore = config.auto_invite_threshold || 0.65;
    const maxInvites = config.shortlist_size_default || 5;

    // Auto-compute matches
    console.log(`Computing matches with min_score: ${minScore}, max_results: ${maxInvites}`);
    
    const { data: matchData, error: matchError } = await supabase.functions.invoke('compute-matches', {
      body: { 
        brief_id, 
        min_score: minScore,
        max_results: maxInvites + 2
      }
    });

    if (matchError || !matchData?.ok) {
      throw new Error(`Matching failed: ${matchError?.message || matchData?.message}`);
    }

    const eligibleCandidates = matchData.candidates?.filter((c: any) => c.score >= minScore) || [];
    
    if (eligibleCandidates.length === 0) {
      console.log('No eligible candidates found - updating brief status');
      
      await supabase.from('briefs').update({
        status: 'no_matches_found'
      }).eq('id', brief_id);

      await supabase.from('brief_events').insert({
        brief_id,
        type: 'auto_matching_no_results',
        payload: { 
          total_evaluated: matchData.candidates?.length || 0,
          min_score: minScore
        }
      });

      return new Response(JSON.stringify({
        status: 'no_matches',
        message: 'No eligible experts found at current threshold'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auto-send invitations to top candidates
    const topCandidates = eligibleCandidates.slice(0, maxInvites);
    
    console.log(`Auto-sending invitations to ${topCandidates.length} experts`);
    
    const { data: inviteData, error: inviteError } = await supabase.functions.invoke('send-invitations', {
      body: {
        brief_id,
        candidate_ids: topCandidates.map((c: any) => c.expert_user_id),
        max_invites: maxInvites
      }
    });

    if (inviteError) {
      throw new Error(`Failed to send invitations: ${inviteError.message}`);
    }

    // Update brief status
    await supabase.from('briefs').update({
      status: 'invitations_sent',
      matching_results: eligibleCandidates
    }).eq('id', brief_id);

    // Notify client
    const { data: brief } = await supabase
      .from('briefs')
      .select('user_id, contact_name, contact_email')
      .eq('id', brief_id)
      .single();

    if (brief?.user_id) {
      await supabase.from('notifications').insert({
        user_id: brief.user_id,
        type: 'auto_matching_complete',
        title: 'Experts Invited to Your Project',
        message: `We have automatically matched and invited ${inviteData.sent} qualified experts to your project. You'll be notified when they respond.`,
        related_id: brief_id
      });
    }

    console.log(`Auto AI matching completed - sent ${inviteData.sent} invitations`);

    return new Response(JSON.stringify({
      status: 'success',
      invitations_sent: inviteData.sent,
      candidates_found: eligibleCandidates.length,
      message: `Auto-matched and invited ${inviteData.sent} experts`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in auto-ai-matching:", error);
    
    return new Response(JSON.stringify({
      status: "error",
      message: error.message || "Auto matching failed"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});