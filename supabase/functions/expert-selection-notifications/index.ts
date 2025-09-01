import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { ExpertInvitationEmail } from "./_templates/expert-invitation.tsx";
import { ExpertSelectedEmail } from "./_templates/expert-selected.tsx";
import { IntroCallScheduledEmail } from "./_templates/intro-call-scheduled.tsx";

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
    projectSummary?: string;
    budget?: string;
    matchScore?: number;
    meetingLink?: string;
    meetingDate?: string;
    meetingTime?: string;
    clientName?: string;
    acceptUrl?: string;
    declineUrl?: string;
    dashboardUrl?: string;
    isExpert?: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailRequest: EmailRequest = await req.json();
    const { to, type, data } = emailRequest;

    let html = '';
    let subject = '';

    switch (type) {
      case 'invitation':
        html = await renderAsync(
          React.createElement(ExpertInvitationEmail, {
            expertName: data.expertName || '',
            projectTitle: data.projectTitle || '',
            projectSummary: data.projectSummary || '',
            budgetRange: data.budget || '',
            matchScore: data.matchScore || 0.65,
            acceptUrl: data.acceptUrl || '',
            declineUrl: data.declineUrl || '',
          })
        );
        subject = `You've been invited to ${data.projectTitle} on Teamsmiths`;
        break;

      case 'shortlisted':
        html = `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;">
            <h1 style="color: #1a1a1a; font-size: 24px; text-align: center;">🎯 You're shortlisted!</h1>
            <p>Hi ${data.expertName},</p>
            <p>You're now shortlisted for <strong>${data.projectTitle}</strong>.</p>
            <p>The client will review your profile and may schedule an intro call.</p>
            <p>Best regards,<br/>The Teamsmiths Team</p>
          </div>
        `;
        subject = `You're shortlisted for ${data.projectTitle}`;
        break;

      case 'selected':
        html = await renderAsync(
          React.createElement(ExpertSelectedEmail, {
            expertName: data.expertName || '',
            projectTitle: data.projectTitle || '',
            clientName: data.clientName || '',
            dashboardUrl: data.dashboardUrl || '',
          })
        );
        subject = `Congratulations – you've been selected for ${data.projectTitle}!`;
        break;

      case 'not_selected':
        html = `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;">
            <h1 style="color: #1a1a1a; font-size: 24px; text-align: center;">Thank you for your interest</h1>
            <p>Hi ${data.expertName},</p>
            <p>Thank you for your interest in <strong>${data.projectTitle}</strong>.</p>
            <p>While another expert has been selected for this project, you remain eligible for future opportunities that match your expertise.</p>
            <p>We'll be in touch soon with new projects that could be a great fit.</p>
            <p>Best regards,<br/>The Teamsmiths Team</p>
          </div>
        `;
        subject = `Update on ${data.projectTitle}`;
        break;

      case 'intro_call':
        html = await renderAsync(
          React.createElement(IntroCallScheduledEmail, {
            recipientName: data.expertName || data.clientName || '',
            projectTitle: data.projectTitle || '',
            meetingDate: data.meetingDate || '',
            meetingTime: data.meetingTime || '',
            meetingLink: data.meetingLink || '',
            isExpert: Boolean(data.isExpert),
          })
        );
        subject = `Intro call scheduled for ${data.projectTitle}`;
        break;

      case 'project_kickoff':
        html = `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;">
            <h1 style="color: #1a1a1a; font-size: 24px; text-align: center;">🚀 Project kickoff confirmed!</h1>
            <p>Hi ${data.expertName},</p>
            <p>Your project <strong>${data.projectTitle}</strong> with ${data.clientName} is now confirmed and ready to begin.</p>
            <p>You can now chat directly with your client and start delivering amazing outcomes.</p>
            <p><a href="${data.dashboardUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Project</a></p>
            <p>Best regards,<br/>The Teamsmiths Team</p>
          </div>
        `;
        subject = `Project kickoff confirmed for ${data.projectTitle}`;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "Teamsmiths <notifications@teamsmiths.ai>",
      to: [to],
      subject,
      html,
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