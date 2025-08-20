import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateJitsiRequest {
  projectId: string;
  title: string;
  includeFireflies?: boolean;
}

const logStep = (step: string, details?: any) => {
  console.log(`[create-jitsi-meet] ${step}`, details ? JSON.stringify(details) : '');
};

// Generate secure room name
const generateRoomName = (projectId: string): string => {
  const timestamp = Date.now();
  const hash = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `ts-${projectId.slice(0, 8)}-${timestamp}-${hash}`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Jitsi Meet creation");

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const clientSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid user session');
    }

    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const { projectId, title, includeFireflies } = await req.json() as CreateJitsiRequest;

    logStep("Request parsed", { projectId, title, includeFireflies });

    // Verify user is a project participant
    const { data: participation, error: participationError } = await supabase
      .from('project_participants')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (participationError || !participation) {
      throw new Error('User is not a participant in this project');
    }

    // Generate secure room name
    const roomName = generateRoomName(projectId);
    const joinUrl = `https://meet.jit.si/${roomName}`;

    logStep("Generated Jitsi room", { roomName, joinUrl });

    // Save meeting to database
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        project_id: projectId,
        title,
        provider: 'jitsi',
        join_url: joinUrl,
        organizer_user_id: user.id,
        recording_consent: includeFireflies || false
      })
      .select()
      .single();

    if (meetingError) {
      logStep("Database error", meetingError);
      throw new Error('Failed to save meeting to database');
    }

    logStep("Meeting saved to database", { meetingId: meeting.id });

    // Post chat message with Jitsi info and Fireflies instructions
    let chatMessage = `📅 Meeting created: "${title}"\n🔗 Join: ${joinUrl}\n\n⚠️ Jitsi is provided by 8×8; public instance has no SLA.\n💡 For E2EE, use Chromium browsers and enable in meeting settings.`;
    
    if (includeFireflies) {
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'fireflies_bot_email')
        .single();

      if (settings?.setting_value) {
        chatMessage += `\n\n📝 To record with Fireflies:\n1. Create a calendar invite with this meeting link\n2. Add ${settings.setting_value} as an attendee\n3. Fireflies will join automatically`;
      }
    }

    await supabase
      .from('project_chat_messages')
      .insert({
        project_id: projectId,
        user_id: user.id,
        message: chatMessage,
        message_type: 'system'
      });

    return new Response(JSON.stringify({
      success: true,
      meeting,
      joinUrl,
      roomName,
      firefliesInstructions: includeFireflies
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    logStep("Error", { error: error.message, stack: error.stack });
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});