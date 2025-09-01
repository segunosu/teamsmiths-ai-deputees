import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EVENTS-DISPATCH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";

    const { type, payload } = await req.json();
    logStep("Event received", { type, payload });

    // Handle different event types
    switch (type) {
      case 'invite.sent':
        await handleInviteSent(supabaseClient, resend, siteUrl, payload);
        break;
      case 'proposal.submitted':
        await handleProposalSubmitted(supabaseClient, resend, siteUrl, payload);
        break;
      case 'proposal.accepted':
        await handleProposalAccepted(supabaseClient, resend, siteUrl, payload);
        break;
      case 'project.created.from_proposal':
        await handleProjectCreated(supabaseClient, resend, siteUrl, payload);
        break;
      case 'payment.succeeded.m1':
      case 'payment.succeeded':
        await handlePaymentSucceeded(supabaseClient, resend, siteUrl, payload, type === 'payment.succeeded.m1');
        break;
      case 'qa.passed':
        await handleQAPassed(supabaseClient, resend, siteUrl, payload);
        break;
      case 'qa.failed':
        await handleQAFailed(supabaseClient, resend, siteUrl, payload);
        break;
      case 'retainer.activated':
        await handleRetainerActivated(supabaseClient, resend, siteUrl, payload);
        break;
      case 'retainer.cancelled':
        await handleRetainerCancelled(supabaseClient, resend, siteUrl, payload);
        break;
      case 'meeting.scheduled':
        await handleMeetingScheduled(supabaseClient, resend, siteUrl, payload);
        break;
      case 'chat.message.created':
        await handleChatMessage(supabaseClient, resend, siteUrl, payload);
        break;
      default:
        logStep("Unknown event type", { type });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleInviteSent(supabase: any, resend: any, siteUrl: string, payload: any) {
  const { expert_user_id, brief_id, brief_title, client_org, why_this_expert, proposal_due_date } = payload;
  
  // Get expert profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', expert_user_id)
    .single();

  if (!profile) return;

  const variables = {
    expert_name: profile.full_name,
    brief_title,
    client_org,
    why_this_expert,
    proposal_due_date,
    proposal_url: `${siteUrl}/proposals/submit/${brief_id}`
  };

  await sendEmailAndNotify(supabase, resend, {
    template: 'expert_invite_to_propose',
    to: profile.email,
    variables,
    userId: expert_user_id,
    notificationTitle: `New invitation: ${brief_title}`,
    notificationBody: 'You\'ve been invited to submit a proposal',
    ctaText: 'Submit Proposal',
    ctaUrl: variables.proposal_url
  });
}

async function handleProposalSubmitted(supabase: any, resend: any, siteUrl: string, payload: any) {
  const { proposal_id, expert_user_id, brief_id, brief_title } = payload;
  
  // Get expert profile
  const { data: expertProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', expert_user_id)
    .single();

  // Get brief owner
  const { data: brief } = await supabase
    .from('briefs')
    .select('user_id')
    .eq('id', brief_id)
    .single();

  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', brief.user_id)
    .single();

  if (expertProfile) {
    await sendEmailAndNotify(supabase, resend, {
      template: 'expert_proposal_submitted',
      to: expertProfile.email,
      variables: { expert_name: expertProfile.full_name, brief_title },
      userId: expert_user_id,
      notificationTitle: 'Proposal submitted successfully',
      notificationBody: `Your proposal for ${brief_title} has been submitted`
    });
  }

  // Check if this is the first proposal for this brief
  const { count } = await supabase
    .from('project_proposals')
    .select('*', { count: 'exact' })
    .eq('brief_id', brief_id);

  if (count === 1 && clientProfile) {
    await sendEmailAndNotify(supabase, resend, {
      template: 'client_proposals_ready',
      to: clientProfile.email,
      variables: {
        client_name: clientProfile.full_name,
        proposal_count: count,
        brief_title,
        review_url: `${siteUrl}/briefs/${brief_id}/proposals`
      },
      userId: brief.user_id,
      notificationTitle: `${count} proposal(s) received`,
      notificationBody: `You have new proposals for ${brief_title}`,
      ctaText: 'Review Proposals',
      ctaUrl: `${siteUrl}/briefs/${brief_id}/proposals`
    });
  }
}

async function handleProposalAccepted(supabase: any, resend: any, siteUrl: string, payload: any) {
  const { proposal_id, brief_id, expert_user_id, client_user_id, brief_title, project_id } = payload;
  
  // Get profiles
  const { data: expertProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', expert_user_id)
    .single();

  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', client_user_id)
    .single();

  // Notify winner
  if (expertProfile) {
    await sendEmailAndNotify(supabase, resend, {
      template: 'expert_proposal_won',
      to: expertProfile.email,
      variables: {
        expert_name: expertProfile.full_name,
        brief_title,
        project_url: `${siteUrl}/projects/${project_id}`
      },
      userId: expert_user_id,
      notificationTitle: '🎉 Your proposal was accepted!',
      notificationBody: `Congratulations! Your proposal for ${brief_title} was chosen`,
      ctaText: 'View Project',
      ctaUrl: `${siteUrl}/projects/${project_id}`
    });
  }

  // Notify non-winners
  const { data: otherProposals } = await supabase
    .from('project_proposals')
    .select('expert_user_id')
    .eq('brief_id', brief_id)
    .neq('id', proposal_id);

  for (const proposal of otherProposals || []) {
    const { data: loserProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', proposal.expert_user_id)
      .single();

    if (loserProfile) {
      await sendEmailAndNotify(supabase, resend, {
        template: 'expert_proposal_not_selected',
        to: loserProfile.email,
        variables: {
          expert_name: loserProfile.full_name,
          brief_title
        },
        userId: proposal.expert_user_id,
        notificationTitle: 'Proposal update',
        notificationBody: `Another proposal was selected for ${brief_title}. Thanks for participating!`
      });
    }
  }
}

async function handleProjectCreated(supabase: any, resend: any, siteUrl: string, payload: any) {
  const { project_id, client_user_id, expert_user_id, project_title, milestone_1_amount } = payload;
  
  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', client_user_id)
    .single();

  if (clientProfile) {
    const payUrl = `${siteUrl}/projects/${project_id}/milestones/1/pay`;
    const formattedAmount = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(milestone_1_amount / 100);

    await sendEmailAndNotify(supabase, resend, {
      template: 'client_pay_m1_now',
      to: clientProfile.email,
      variables: {
        client_name: clientProfile.full_name,
        project_title,
        m1_amount: formattedAmount,
        pay_url: payUrl
      },
      userId: client_user_id,
      notificationTitle: 'Payment required to start project',
      notificationBody: `Pay Milestone 1 to begin ${project_title}`,
      ctaText: 'Pay Now',
      ctaUrl: payUrl
    });
  }
}

async function handlePaymentSucceeded(supabase: any, resend: any, siteUrl: string, payload: any, isMilestone1: boolean) {
  const { milestone_id, project_id, client_user_id, expert_user_id, milestone_title, amount, project_title } = payload;
  
  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', client_user_id)
    .single();

  const { data: expertProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', expert_user_id)
    .single();

  const formattedAmount = new Intl.NumberFormat('en-GB', {
    style: 'currency', 
    currency: 'GBP'
  }).format(amount / 100);

  const projectUrl = `${siteUrl}/projects/${project_id}`;

  // Notify both client and expert
  const variables = {
    milestone_title,
    amount: formattedAmount,
    project_title,
    expert_name: expertProfile?.full_name || 'Expert',
    project_url: projectUrl
  };

  if (clientProfile) {
    await sendEmailAndNotify(supabase, resend, {
      template: 'payment_received_milestone',
      to: clientProfile.email,
      variables,
      userId: client_user_id,
      notificationTitle: 'Payment received',
      notificationBody: `Payment for ${milestone_title} on ${project_title} has been processed`,
      ctaText: 'View Project',
      ctaUrl: projectUrl
    });
  }

  if (expertProfile) {
    await sendEmailAndNotify(supabase, resend, {
      template: 'payment_received_milestone',
      to: expertProfile.email,
      variables,
      userId: expert_user_id,
      notificationTitle: 'Payment received - you can start work',
      notificationBody: `Payment for ${milestone_title} on ${project_title} has been received`,
      ctaText: 'View Project',
      ctaUrl: projectUrl
    });
  }
}

async function handleQAPassed(supabase: any, resend: any, siteUrl: string, payload: any) {
  const { milestone_id, project_id, milestone_title, project_title, expert_user_id } = payload;
  
  const { data: expertProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', expert_user_id)
    .single();

  if (expertProfile) {
    await sendEmailAndNotify(supabase, resend, {
      template: 'qa_passed_milestone',
      to: expertProfile.email,
      variables: {
        milestone_title,
        project_title,
        expert_name: expertProfile.full_name
      },
      userId: expert_user_id,
      notificationTitle: 'QA approved - payment released',
      notificationBody: `${milestone_title} on ${project_title} has passed QA. Funds released!`
    });
  }
}

async function handleQAFailed(supabase: any, resend: any, siteUrl: string, payload: any) {
  const { milestone_id, project_id, milestone_title, project_title, qa_notes, expert_user_id } = payload;
  
  const { data: expertProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', expert_user_id)
    .single();

  if (expertProfile) {
    const milestoneUrl = `${siteUrl}/projects/${project_id}/milestones/${milestone_id}`;
    
    await sendEmailAndNotify(supabase, resend, {
      template: 'qa_failed_milestone',
      to: expertProfile.email,
      variables: {
        milestone_title,
        project_title,
        qa_notes,
        milestone_url: milestoneUrl
      },
      userId: expert_user_id,
      notificationTitle: 'QA review required',
      notificationBody: `${milestone_title} on ${project_title} needs revisions`,
      ctaText: 'View Details',
      ctaUrl: milestoneUrl
    });
  }
}

async function handleRetainerActivated(supabase: any, resend: any, siteUrl: string, payload: any) {
  // Implementation for retainer activation
}

async function handleRetainerCancelled(supabase: any, resend: any, siteUrl: string, payload: any) {
  // Implementation for retainer cancellation
}

async function handleMeetingScheduled(supabase: any, resend: any, siteUrl: string, payload: any) {
  // Implementation for meeting scheduled
}

async function handleChatMessage(supabase: any, resend: any, siteUrl: string, payload: any) {
  // Implementation for chat message
}

async function sendEmailAndNotify(supabase: any, resend: any, {
  template,
  to,
  variables,
  userId,
  notificationTitle,
  notificationBody,
  ctaText,
  ctaUrl
}: {
  template: string;
  to: string;
  variables: any;
  userId: string;
  notificationTitle: string;
  notificationBody?: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  try {
    // Store in outbox first
    const { data: outboxEntry } = await supabase
      .from('email_outbox')
      .insert({
        to_email: to,
        template_code: template,
        payload: variables,
        status: 'queued'
      })
      .select('id')
      .single();

    // Render and send email
    const { subject, html } = renderEmailTemplate(template, variables);
    
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'Teamsmiths <no-reply@teamsmiths.ai>',
      to: [to],
      subject,
      html
    });

    // Update outbox
    if (emailError) {
      await supabase
        .from('email_outbox')
        .update({ 
          status: 'failed', 
          error: emailError.message 
        })
        .eq('id', outboxEntry.id);
    } else {
      await supabase
        .from('email_outbox')
        .update({ 
          status: 'sent', 
          provider_id: emailResult?.id,
          sent_at: new Date().toISOString()
        })
        .eq('id', outboxEntry.id);
    }

    // Create in-app notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: template,
        title: notificationTitle,
        body: notificationBody,
        cta_text: ctaText,
        cta_url: ctaUrl
      });

  } catch (error) {
    console.error('Error in sendEmailAndNotify:', error);
  }
}

function renderEmailTemplate(templateCode: string, variables: Record<string, any>): {
  subject: string;
  html: string;
} {
  const templates = getEmailTemplates();
  const template = templates[templateCode];
  
  if (!template) {
    throw new Error(`Email template not found: ${templateCode}`);
  }

  let subject = template.subject;
  let html = template.body;

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(placeholder, String(value));
    html = html.replace(placeholder, String(value));
  });

  // Convert markdown-style formatting to HTML
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #2754C5; text-decoration: underline;">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.*)$/gm, '<p>$1</p>');

  // Wrap in proper email HTML structure
  html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${html}
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        <strong>Teamsmiths</strong><br>
        Building AI-Powered Solutions That Actually Work
      </p>
    </body>
    </html>
  `;

  return { subject, html };
}

function getEmailTemplates() {
  return {
    expert_invite_to_propose: {
      subject: "You're a strong fit for {{brief_title}} — want to propose?",
      body: `Hi {{expert_name}},

You've been invited to propose for **{{brief_title}}** at **{{client_org}}**.
Why you? {{why_this_expert}}

**Due date:** {{proposal_due_date}}

**What to include:** scope, milestones, total price, timeline.

[Submit your proposal]({{proposal_url}})`
    },
    
    expert_proposal_submitted: {
      subject: "Proposal received — {{brief_title}}",
      body: `Hi {{expert_name}},

Thanks for submitting your proposal for **{{brief_title}}**.
We'll notify you as soon as the client makes a decision.`
    },
    
    client_proposals_ready: {
      subject: "You have {{proposal_count}} proposal(s) for {{brief_title}}",
      body: `Hi {{client_name}},

You've received **{{proposal_count}}** proposal(s) for **{{brief_title}}**.

[Review and choose]({{review_url}})`
    },
    
    expert_proposal_won: {
      subject: "🎉 Your proposal was accepted — {{brief_title}}",
      body: `Hi {{expert_name}},

Your proposal for **{{brief_title}}** was **accepted**.
We'll notify you as soon as the client pays **Milestone 1** so you can start.

[View project]({{project_url}})`
    },
    
    expert_proposal_not_selected: {
      subject: "Update on {{brief_title}}",
      body: `Hi {{expert_name}},

Thanks for submitting a proposal for **{{brief_title}}**.
The client selected another proposal this time. We'll keep you in the loop on new matches.`
    },
    
    client_pay_m1_now: {
      subject: "Pay Milestone 1 to start {{project_title}}",
      body: `Hi {{client_name}},

To kick off **{{project_title}}**, please pay **Milestone 1** ({{m1_amount}}).

[Pay Milestone 1]({{pay_url}})`
    },
    
    payment_received_milestone: {
      subject: "Payment received — {{milestone_title}}",
      body: `Payment for **{{milestone_title}}** ({{amount}}) was received for **{{project_title}}**.
Expert: {{expert_name}} can begin work.

[Open project]({{project_url}})`
    },
    
    qa_passed_milestone: {
      subject: "QA passed — {{milestone_title}} released",
      body: `QA has **passed** for **{{milestone_title}}** on **{{project_title}}**.
Funds are now **released** to {{expert_name}}.`
    },
    
    qa_failed_milestone: {
      subject: "QA flagged — action needed on {{milestone_title}}",
      body: `QA flagged **{{milestone_title}}** on **{{project_title}}**.
Issues: {{qa_notes}}

[Review and fix]({{milestone_url}})`
    }
  };
}