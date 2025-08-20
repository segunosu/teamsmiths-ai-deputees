import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  type: string;
  data: {
    title: string;
    message: string;
    projectTitle?: string;
    quoteNumber?: string;
    amount?: number;
    currency?: string;
    actionUrl?: string;
  };
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, type, data }: EmailRequest = await req.json();

    let subject = "";
    let html = "";

    // Generate email content based on type
    switch (type) {
      case 'quote_received':
        subject = `New Quote Available - ${data.quoteNumber}`;
        html = generateQuoteReceivedEmail(data);
        break;
      case 'quote_approved':
        subject = `Quote Approved - ${data.quoteNumber}`;
        html = generateQuoteApprovedEmail(data);
        break;
      case 'payment_confirmed':
        subject = `Payment Confirmed - ${data.projectTitle}`;
        html = generatePaymentConfirmedEmail(data);
        break;
      case 'deliverable_submitted':
        subject = `New Deliverable Submitted - ${data.projectTitle}`;
        html = generateDeliverableSubmittedEmail(data);
        break;
      case 'deliverable_approved':
        subject = `Deliverable Approved - ${data.projectTitle}`;
        html = generateDeliverableApprovedEmail(data);
        break;
      case 'deliverable_rejected':
        subject = `Revision Requested - ${data.projectTitle}`;
        html = generateDeliverableRejectedEmail(data);
        break;
      case 'project_completed':
        subject = `Project Completed - ${data.projectTitle}`;
        html = generateProjectCompletedEmail(data);
        break;
      case 'admin_review_required':
        subject = `Admin Review Required - ${data.projectTitle || data.quoteNumber}`;
        html = generateAdminReviewEmail(data);
        break;
      default:
        subject = data.title;
        html = generateGenericEmail(data);
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
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

function generateQuoteReceivedEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Quote Available</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af, #7c3aed); padding: 30px; border-radius: 12px; text-align: center; color: white; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">💰 New Quote Available</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your custom project quote is ready for review</p>
      </div>

      <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="margin: 0 0 15px 0; color: #1e40af; font-size: 20px;">Quote Details</h2>
        <p style="margin: 8px 0;"><strong>Quote Number:</strong> ${data.quoteNumber}</p>
        <p style="margin: 8px 0;"><strong>Project:</strong> ${data.projectTitle}</p>
        ${data.amount ? `<p style="margin: 8px 0;"><strong>Total Amount:</strong> ${data.currency?.toUpperCase() === 'GBP' ? '£' : '$'}${(data.amount / 100).toLocaleString()}</p>` : ''}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        ${data.actionUrl ? `
          <a href="${data.actionUrl}" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Review Quote
          </a>
        ` : ''}
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>This is an automated notification from Teamsmiths.ai</p>
        <p>Please log in to your dashboard to take action on this quote.</p>
      </div>
    </body>
    </html>
  `;
}

function generateQuoteApprovedEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote Approved</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; border-radius: 12px; text-align: center; color: white; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">✅ Quote Approved!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your quote has been approved and the project is ready to begin</p>
      </div>

      <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #10b981;">
        <h2 style="margin: 0 0 15px 0; color: #059669; font-size: 20px;">Project Details</h2>
        <p style="margin: 8px 0;"><strong>Quote Number:</strong> ${data.quoteNumber}</p>
        <p style="margin: 8px 0;"><strong>Project:</strong> ${data.projectTitle}</p>
        ${data.amount ? `<p style="margin: 8px 0;"><strong>Total Value:</strong> ${data.currency?.toUpperCase() === 'GBP' ? '£' : '$'}${(data.amount / 100).toLocaleString()}</p>` : ''}
      </div>

      <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
        <h3 style="margin: 0 0 10px 0; color: #d97706;">Next Steps</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>The project will be created automatically</li>
          <li>You'll receive milestone payment requests as work progresses</li>
          <li>Track progress through your dashboard</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        ${data.actionUrl ? `
          <a href="${data.actionUrl}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Project
          </a>
        ` : ''}
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>Thank you for choosing Teamsmiths.ai</p>
        <p>We're excited to help bring your project to life!</p>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentConfirmedEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmed</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); padding: 30px; border-radius: 12px; text-align: center; color: white; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">💳 Payment Confirmed</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your payment has been successfully processed</p>
      </div>

      <div style="background: #f0fdfa; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #14b8a6;">
        <h2 style="margin: 0 0 15px 0; color: #0f766e; font-size: 20px;">Payment Details</h2>
        <p style="margin: 8px 0;"><strong>Project:</strong> ${data.projectTitle}</p>
        ${data.amount ? `<p style="margin: 8px 0;"><strong>Amount Paid:</strong> ${data.currency?.toUpperCase() === 'GBP' ? '£' : '$'}${(data.amount / 100).toLocaleString()}</p>` : ''}
        <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Confirmed</span></p>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px 0; color: #475569;">What happens next?</h3>
        <p style="margin: 5px 0; color: #64748b;">Your project team will be notified and work will begin shortly. You'll receive updates as deliverables are completed.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        ${data.actionUrl ? `
          <a href="${data.actionUrl}" style="background: #0f766e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Project
          </a>
        ` : ''}
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>Thank you for your payment!</p>
        <p>Receipt and project updates are available in your dashboard.</p>
      </div>
    </body>
    </html>
  `;
}

function generateDeliverableSubmittedEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Deliverable Submitted</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #7c2d12, #ea580c); padding: 30px; border-radius: 12px; text-align: center; color: white; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📄 New Deliverable Submitted</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">A deliverable is ready for your review</p>
      </div>

      <div style="background: #fffbeb; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
        <h2 style="margin: 0 0 15px 0; color: #d97706; font-size: 20px;">Deliverable Details</h2>
        <p style="margin: 8px 0;"><strong>Project:</strong> ${data.projectTitle}</p>
        <p style="margin: 8px 0;"><strong>Title:</strong> ${data.title}</p>
        <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Awaiting Review</span></p>
      </div>

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px 0; color: #475569;">Action Required</h3>
        <p style="margin: 5px 0; color: #64748b;">Please review the submitted deliverable and either approve it or request revisions. Your team is waiting for your feedback.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        ${data.actionUrl ? `
          <a href="${data.actionUrl}" style="background: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Review Deliverable
          </a>
        ` : ''}
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>Please review promptly to keep your project on track</p>
        <p>Log in to your dashboard to download and review files</p>
      </div>
    </body>
    </html>
  `;
}

function generateDeliverableApprovedEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Deliverable Approved</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; border-radius: 12px; text-align: center; color: white; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 Deliverable Approved!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Great work! Your deliverable has been approved</p>
      </div>

      <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #10b981;">
        <h2 style="margin: 0 0 15px 0; color: #059669; font-size: 20px;">Approval Details</h2>
        <p style="margin: 8px 0;"><strong>Project:</strong> ${data.projectTitle}</p>
        <p style="margin: 8px 0;"><strong>Deliverable:</strong> ${data.title}</p>
        <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Approved ✓</span></p>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px 0; color: #475569;">Excellent Work!</h3>
        <p style="margin: 5px 0; color: #64748b;">Your client is satisfied with this deliverable. Keep up the great work as you continue with the remaining project milestones.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        ${data.actionUrl ? `
          <a href="${data.actionUrl}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Project
          </a>
        ` : ''}
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>Congratulations on another successful milestone!</p>
        <p>Continue the momentum with your next deliverables</p>
      </div>
    </body>
    </html>
  `;
}

function generateDeliverableRejectedEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Revision Requested</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; border-radius: 12px; text-align: center; color: white; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🔄 Revision Requested</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your client has requested changes to your deliverable</p>
      </div>

      <div style="background: #fef2f2; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ef4444;">
        <h2 style="margin: 0 0 15px 0; color: #dc2626; font-size: 20px;">Revision Details</h2>
        <p style="margin: 8px 0;"><strong>Project:</strong> ${data.projectTitle}</p>
        <p style="margin: 8px 0;"><strong>Deliverable:</strong> ${data.title}</p>
        <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Revision Required</span></p>
      </div>

      <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
        <h3 style="margin: 0 0 10px 0; color: #d97706;">Client Feedback</h3>
        <p style="margin: 5px 0; color: #92400e; font-style: italic;">"${data.message}"</p>
      </div>

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px 0; color: #475569;">Next Steps</h3>
        <ul style="margin: 5px 0; padding-left: 20px; color: #64748b;">
          <li>Review the client's feedback carefully</li>
          <li>Make the requested changes</li>
          <li>Upload the revised deliverable</li>
          <li>Update the client on your progress</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        ${data.actionUrl ? `
          <a href="${data.actionUrl}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Start Revision
          </a>
        ` : ''}
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>Don't worry - revisions are a normal part of the process</p>
        <p>Address the feedback and resubmit when ready</p>
      </div>
    </body>
    </html>
  `;
}

function generateProjectCompletedEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Completed</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 12px; text-align: center; color: white; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 Project Completed!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Congratulations! Your project has been successfully completed</p>
      </div>

      <div style="background: #faf5ff; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #a855f7;">
        <h2 style="margin: 0 0 15px 0; color: #7c3aed; font-size: 20px;">Project Summary</h2>
        <p style="margin: 8px 0;"><strong>Project:</strong> ${data.projectTitle}</p>
        <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Completed ✓</span></p>
        <p style="margin: 8px 0;"><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px 0; color: #059669;">Thank You!</h3>
        <p style="margin: 5px 0; color: #166534;">We hope you're delighted with the results. Your project team has worked hard to deliver exactly what you envisioned.</p>
      </div>

      <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
        <h3 style="margin: 0 0 10px 0; color: #d97706;">What's Next?</h3>
        <ul style="margin: 5px 0; padding-left: 20px; color: #92400e;">
          <li>All deliverables remain accessible in your dashboard</li>
          <li>Final payments will be processed automatically</li>
          <li>Rate your experience and provide feedback</li>
          <li>Consider us for your next project!</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        ${data.actionUrl ? `
          <a href="${data.actionUrl}" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
            View Final Project
          </a>
        ` : ''}
        <a href="#" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Start New Project
        </a>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>Thank you for choosing Teamsmiths.ai</p>
        <p>We look forward to helping with your future projects!</p>
      </div>
    </body>
    </html>
  `;
}

function generateAdminReviewEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Review Required</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; border-radius: 12px; text-align: center; color: white; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">⚠️ Admin Review Required</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">A high-value item requires your approval</p>
      </div>

      <div style="background: #fef2f2; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ef4444;">
        <h2 style="margin: 0 0 15px 0; color: #dc2626; font-size: 20px;">Review Required</h2>
        ${data.quoteNumber ? `<p style="margin: 8px 0;"><strong>Quote Number:</strong> ${data.quoteNumber}</p>` : ''}
        ${data.projectTitle ? `<p style="margin: 8px 0;"><strong>Project:</strong> ${data.projectTitle}</p>` : ''}
        ${data.amount ? `<p style="margin: 8px 0;"><strong>Value:</strong> ${data.currency?.toUpperCase() === 'GBP' ? '£' : '$'}${(data.amount / 100).toLocaleString()}</p>` : ''}
        <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Awaiting Admin Approval</span></p>
      </div>

      <div style="background: #fffbef; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
        <h3 style="margin: 0 0 10px 0; color: #d97706;">Action Required</h3>
        <p style="margin: 5px 0; color: #92400e;">This item exceeds the approval threshold and requires admin review before proceeding. Please review and approve or place on hold.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        ${data.actionUrl ? `
          <a href="${data.actionUrl}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Review Now
          </a>
        ` : ''}
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>This is an automated admin notification</p>
        <p>Please review promptly to avoid project delays</p>
      </div>
    </body>
    </html>
  `;
}

function generateGenericEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af, #7c3aed); padding: 30px; border-radius: 12px; text-align: center; color: white; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📢 ${data.title}</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Notification from Teamsmiths.ai</p>
      </div>

      <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <p style="margin: 0; color: #475569; font-size: 16px;">${data.message}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        ${data.actionUrl ? `
          <a href="${data.actionUrl}" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Details
          </a>
        ` : ''}
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>This is an automated notification from Teamsmiths.ai</p>
        <p>Please log in to your dashboard for more details</p>
      </div>
    </body>
    </html>
  `;
}