// Note: Resend is imported in edge functions only
// This file provides types and templates for use across the application

interface SendEmailParams {
  to: string;
  template: string;
  variables: Record<string, any>;
  cc?: string[];
  bcc?: string[];
}

export async function sendEmail({ 
  to, 
  template, 
  variables, 
  cc, 
  bcc 
}: SendEmailParams): Promise<{ id: string }> {
  // This is a client-side helper - actual sending happens in edge functions
  // Edge functions will use the same interface but with actual Resend implementation
  throw new Error('sendEmail should only be called from edge functions');
}

// Email template renderer for edge functions
export function renderEmailTemplate(templateCode: string, variables: Record<string, any>): {
  subject: string;
  html: string;
  text: string;
} {
  const templates = getEmailTemplates();
  const template = templates[templateCode];
  
  if (!template) {
    throw new Error(`Email template not found: ${templateCode}`);
  }

  // Simple variable substitution
  let subject = template.subject;
  let html = template.body;
  let text = template.body.replace(/<[^>]*>/g, ''); // Strip HTML for text version

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
    html = html.replace(new RegExp(placeholder, 'g'), String(value));
    text = text.replace(new RegExp(placeholder, 'g'), String(value));
  });

  // Convert markdown-style formatting to HTML
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #2754C5; text-decoration: underline;">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.*)$/gm, '<p>$1</p>');

  return { subject, html, text };
}

function getEmailTemplates(): Record<string, { subject: string; body: string }> {
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
    },
    
    retainer_offer_post_project: {
      subject: "Keep your outcome alive — add Assurance",
      body: `Your project **{{project_title}}** is complete.
To keep performance improving (and your **Outcome Assurance™** active), consider a monthly plan:
- **Bronze:** Monitor & patch
- **Silver:** Improve & extend  
- **Gold:** Evolve & experiment

[See plans]({{assurance_url}})`
    },
    
    retainer_activated: {
      subject: "Assurance plan activated — {{assurance_plan}}",
      body: `Your **{{assurance_plan}}** plan is **active** for **{{project_title}}**.
We'll monitor, improve, and evolve your solution.

[Manage plan]({{assurance_manage_url}})`
    },
    
    retainer_cancelled: {
      subject: "Assurance paused — performance coverage ended",
      body: `Your Assurance plan for **{{project_title}}** is paused.
You can reactivate anytime to restore ongoing coverage and improvement.

[Reactivate]({{assurance_reactivate_url}})`
    },
    
    meeting_scheduled: {
      subject: "Meeting confirmed — {{meeting_title}}",
      body: `Your meeting **{{meeting_title}}** is booked for **{{starts_at_human}} ({{timezone}})**.
**Join link:** {{meet_url}}

[Add to calendar]({{ics_url}})`
    },
    
    chat_message_received: {
      subject: "New message on {{project_title}}",
      body: `**{{sender_name}}**: "{{message_snippet}}"

[Open chat]({{chat_url}})`
    }
  };
}