import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateMeetRequest {
  projectId: string;
  title: string;
  startTime: string;
  endTime: string;
  accessToken: string;
  includeFireflies?: boolean;
}

const logStep = (step: string, details?: any) => {
  console.log(`[create-google-meet] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Google Meet creation");

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
    const { projectId, title, startTime, endTime, accessToken, includeFireflies } = await req.json() as CreateMeetRequest;

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

    // Get project participants for meeting attendees
    const { data: participants, error: participantsError } = await supabase
      .from('project_participants')
      .select(`
        user_id,
        profiles!inner(email, full_name)
      `)
      .eq('project_id', projectId);

    if (participantsError) {
      throw new Error('Failed to fetch project participants');
    }

    // Get Fireflies settings
    let firefliesEmail = null;
    if (includeFireflies) {
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'fireflies_bot_email')
        .single();

      if (settings?.setting_value) {
        firefliesEmail = settings.setting_value;
      }
    }

    logStep("Creating Google Calendar event");

    // Create Google Calendar event with conference data
    const eventData = {
      summary: title,
      start: {
        dateTime: startTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC'
      },
      attendees: [
        ...participants.map((p: any) => ({
          email: p.profiles.email,
          displayName: p.profiles.full_name
        })),
        ...(firefliesEmail ? [{ email: firefliesEmail }] : [])
      ],
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };

    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    if (!calendarResponse.ok) {
      const error = await calendarResponse.text();
      logStep("Calendar API error", { error, status: calendarResponse.status });
      throw new Error(`Google Calendar API error: ${error}`);
    }

    const calendarEvent = await calendarResponse.json();
    logStep("Calendar event created", { eventId: calendarEvent.id });

    // Extract meeting details
    const meetUrl = calendarEvent.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri;
    if (!meetUrl) {
      throw new Error('Failed to create Google Meet link');
    }

    // Save meeting to database
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        project_id: projectId,
        title,
        provider: 'google_meet',
        join_url: meetUrl,
        external_event_id: calendarEvent.id,
        starts_at: startTime,
        ends_at: endTime,
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

    // Post chat message
    await supabase
      .from('project_chat_messages')
      .insert({
        project_id: projectId,
        user_id: user.id,
        message: `📅 Meeting created: "${title}"\n🔗 Join: ${meetUrl}\n⏰ ${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}${includeFireflies ? '\n🎥 Fireflies recording enabled' : ''}`,
        message_type: 'system'
      });

    return new Response(JSON.stringify({
      success: true,
      meeting,
      meetUrl,
      calendarEventId: calendarEvent.id
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