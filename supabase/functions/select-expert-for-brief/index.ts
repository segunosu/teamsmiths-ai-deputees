import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SelectExpertRequest {
  brief_id: string;
  expert_user_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { brief_id, expert_user_id } = await req.json() as SelectExpertRequest;

    console.log('Selecting expert for brief:', { brief_id, expert_user_id });

    // Use the existing database function
    const { data, error } = await supabaseClient.rpc('select_expert_for_brief', {
      p_brief_id: brief_id,
      p_expert_user_id: expert_user_id
    });

    if (error) {
      console.error('Database function error:', error);
      throw error;
    }

    console.log('Expert selection result:', data);

    // Send expert selection notifications
    try {
      await supabaseClient.functions.invoke('expert-selection-notifications', {
        body: {
          brief_id,
          expert_user_id,
          event_type: 'expert_selected'
        }
      });
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError);
      // Don't fail the main operation for notification errors
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error selecting expert:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);