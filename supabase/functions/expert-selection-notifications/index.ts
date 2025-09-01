import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  type: 'invitation' | 'shortlisted' | 'selected' | 'not_selected' | 'intro_call' | 'project_kickoff';
  data: {
    expertName?: string;
    projectTitle?: string;
    budget?: string;
    meetingLink?: string;
    clientName?: string;
    acceptUrl?: string;
    declineUrl?: string;
  };
}

const getEmailTemplate = (type: string, data: any) => {
  const templates = {
    invitation: {
      subject: "You've been invited to a new project on Teamsmiths",
      html: `
        <h2>Hi ${data.expertName},</h2>
        <p>You've been invited to <strong>${data.projectTitle}</strong>.</p>
        <p><strong>Project Summary:</strong> ${data.projectTitle}</p>
        <p><strong>Budget Range:</strong> ${data.budget}</p>
        <p>Click below to accept or decline:</p>
        <div style="margin: 20px 0;">
          <a href="${data.acceptUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;">Accept Invitation</a>
          <a href="${data.declineUrl}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Decline Invitation</a>
        </div>
      `
    },
    shortlisted: {
      subject: `You're shortlisted for ${data.projectTitle}`,
      html: `
        <h2>Hi ${data.expertName},</h2>
        <p>You're now shortlisted for <strong>${data.projectTitle}</strong>.</p>
        <p>The client will review your profile and may schedule an intro call.</p>
      `
    },
    selected: {
      subject: "Congratulations – you've been selected!",
      html: `
        <h2>Hi ${data.expertName},</h2>
        <p>Great news! You've been selected for <strong>${data.projectTitle}</strong>.</p>
        <p>Next step: the client may schedule an intro call before kickoff.</p>
      `
    },
    not_selected: {
      subject: `Outcome for ${data.projectTitle}`,
      html: `
        <h2>Hi ${data.expertName},</h2>
        <p>Thank you for your interest in <strong>${data.projectTitle}</strong>.</p>
        <p>Another expert has been selected, but you remain eligible for future projects.</p>
      `
    },
    intro_call: {
      subject: `Intro call scheduled for ${data.projectTitle}`,
      html: `
        <h2>Hi ${data.expertName},</h2>
        <p>A call has been scheduled for <strong>${data.projectTitle}</strong>.</p>
        <p>Join using this link: <a href="${data.meetingLink}">${data.meetingLink}</a></p>
      `
    },
    project_kickoff: {
      subject: `Project kickoff confirmed for ${data.projectTitle}`,
      html: `
        <h2>Hi ${data.expertName},</h2>
        <p>Your project with <strong>${data.clientName}</strong> is confirmed.</p>
        <p>You can chat directly and start delivering outcomes.</p>
      `
    }
  };

  return templates[type] || templates.invitation;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailRequest: EmailRequest = await req.json();
    const template = getEmailTemplate(emailRequest.type, emailRequest.data);

    const emailResponse = await resend.emails.send({
      from: "Teamsmiths <notifications@teamsmiths.ai>",
      to: [emailRequest.to],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in expert-selection-notifications function:", error);
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