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
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    // Initialize Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request
    const callRequest: ScheduleCallRequest = await req.json();
    
    if (!callRequest.briefId || !callRequest.expertUserId || !callRequest.startTime || !callRequest.endTime) {
      throw new Error("Missing required fields: briefId, expertUserId, startTime, endTime");
    }

    // Verify the requesting user is a participant in this brief
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError) {
      console.error("Auth error:", authError);
      throw new Error("Invalid authentication token");
    }
    
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('brief_participants')
      .select('role')
      .eq('brief_id', callRequest.briefId)
      .eq('user_id', user.id)
      .single();

    if (participantError) {
      console.error("Participant check error:", participantError);
      throw new Error("Error verifying user permissions");
    }

    if (!participant) {
      throw new Error("Not authorized to schedule calls for this brief");
    }

    // Get brief details for context
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('structured_brief')
      .eq('id', callRequest.briefId)
      .single();

    if (briefError) {
      console.error("Brief fetch error:", briefError);
      throw new Error("Error fetching brief details");
    }

    if (!brief) {
      throw new Error("Brief not found");
    }

    const projectTitle = brief.structured_brief?.project_title || 'Project Discussion';

    // Validate time format
    const startTime = new Date(callRequest.startTime);
    const endTime = new Date(callRequest.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new Error("Invalid date format for meeting times");
    }
    
    if (startTime >= endTime) {
      throw new Error("Start time must be before end time");
    }
    
    if (startTime < new Date()) {
      throw new Error("Cannot schedule meetings in the past");
    }

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

    if (meetingError) {
      console.error("Meeting creation error:", meetingError);
      throw new Error("Failed to create meeting record");
    }

    // Get attendees' details
    const attendeeIds = [user.id, callRequest.expertUserId];
    const { data: attendeeProfiles, error: attendeeError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .in('user_id', attendeeIds);

    if (attendeeError) {
      console.error("Attendee fetch error:", attendeeError);
      throw new Error("Error fetching attendee details");
    }

    if (!attendeeProfiles || attendeeProfiles.length === 0) {
      throw new Error("No attendee profiles found");
    }

    // Send notifications to all attendees
    const notificationPromises = attendeeProfiles.map(async (attendee) => {
      try {
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
        const isExpert = attendee.user_id === callRequest.expertUserId;
        await supabase.functions.invoke('expert-selection-notifications', {
          body: {
            to: attendee.email,
            type: 'intro_call',
            data: {
              expertName: attendee.full_name,
              clientName: attendee.full_name,
              projectTitle: projectTitle,
              meetingLink: meetLink,
              meetingDate: startTime.toLocaleDateString(),
              meetingTime: startTime.toLocaleTimeString(),
              isExpert: isExpert
            }
          }
        });
      } catch (notifError) {
        console.error(`Failed to send notification to ${attendee.email}:`, notifError);
        // Don't fail the whole operation for notification errors
      }
    });

    await Promise.allSettled(notificationPromises);

    // Add system message to brief chat
    try {
      await supabase
        .from('brief_chat_messages')
        .insert({
          brief_id: callRequest.briefId,
          sender_id: user.id,
          sender_role: 'system',
          message: `📅 Intro call scheduled for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}\n\nJoin link: ${meetLink}`,
          message_type: 'system'
        });
    } catch (chatError) {
      console.error("Failed to add chat message:", chatError);
      // Don't fail the operation for this
    }

    console.log(`Successfully scheduled intro call for brief ${callRequest.briefId}`);

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
    
    // Provide specific error messages for common issues
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;
    
    if (error.message.includes("Missing required fields")) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes("authorization") || error.message.includes("Unauthorized")) {
      errorMessage = "Authentication required";
      statusCode = 401;
    } else if (error.message.includes("Not authorized")) {
      errorMessage = "Insufficient permissions";
      statusCode = 403;
    } else if (error.message.includes("not found")) {
      errorMessage = "Resource not found";
      statusCode = 404;
    } else if (error.message.includes("Invalid date") || error.message.includes("time")) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes("environment variables")) {
      errorMessage = "Server configuration error";
      statusCode = 500;
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: Deno.env.get("NODE_ENV") === "development" ? error.message : undefined
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);