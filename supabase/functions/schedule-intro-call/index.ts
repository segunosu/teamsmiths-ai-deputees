import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduleCallRequest {
  briefId: string;
  expertUserId: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  recordingConsent?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

    // Initialize Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const callRequest: ScheduleCallRequest = await req.json();

    // Verify the requesting user is a participant in this brief
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('brief_participants')
      .select('role')
      .eq('brief_id', callRequest.briefId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      throw new Error("Not authorized to schedule calls for this brief");
    }

    // Get brief details for context
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('structured_brief')
      .eq('id', callRequest.briefId)
      .single();

    if (briefError) throw briefError;

    const projectTitle = brief.structured_brief?.project_title || 'Project Discussion';

    // Create Google Meet link (simplified - in production, use proper Google Calendar API)
    const meetingId = `teamsmiths-${callRequest.briefId.slice(0, 8)}-${Date.now()}`;
    const meetLink = `https://meet.google.com/${meetingId}`;

    // Store meeting in meetings table
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        organizer_user_id: user.id,
        title: callRequest.title || `Intro Call - ${projectTitle}`,
        starts_at: callRequest.startTime,
        ends_at: callRequest.endTime,
        provider: 'google_meet',
        join_url: meetLink,
        recording_consent: callRequest.recordingConsent || false,
        metadata: {
          brief_id: callRequest.briefId,
          expert_user_id: callRequest.expertUserId,
          meeting_type: 'intro_call'
        }
      })
      .select()
      .single();

    if (meetingError) throw meetingError;

    // Get attendees' details
    const { data: attendeeProfiles, error: attendeeError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .in('user_id', callRequest.attendees);

    if (attendeeError) throw attendeeError;

    // Send notifications to all attendees
    for (const attendee of attendeeProfiles) {
      // Create in-app notification
      await supabase
        .from('notifications')
        .insert({
          user_id: attendee.user_id,
          type: 'intro_call_scheduled',
          title: 'Intro call scheduled',
          message: `A call has been scheduled for ${projectTitle}.`,
          related_id: meeting.id
        });

      // Send email notification
      await supabase.functions.invoke('expert-selection-notifications', {
        body: {
          to: attendee.email,
          type: 'intro_call',
          data: {
            expertName: attendee.full_name,
            projectTitle: projectTitle,
            meetingLink: meetLink
          }
        }
      });
    }

    // Add system message to brief chat
    await supabase
      .from('brief_chat_messages')
      .insert({
        brief_id: callRequest.briefId,
        sender_id: user.id,
        sender_role: 'system',
        message: `📅 Intro call scheduled for ${new Date(callRequest.startTime).toLocaleDateString()} at ${new Date(callRequest.startTime).toLocaleTimeString()}\n\nJoin link: ${meetLink}`,
        message_type: 'system'
      });

    return new Response(
      JSON.stringify({
        success: true,
        meeting: {
          id: meeting.id,
          title: meeting.title,
          startTime: meeting.starts_at,
          endTime: meeting.ends_at,
          joinUrl: meeting.join_url
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in schedule-intro-call function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);