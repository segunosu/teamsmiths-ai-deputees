import { supabase } from '@/integrations/supabase/client';

interface NotificationParams {
  type: string;
  title: string;
  body?: string;
  cta_text?: string;
  cta_url?: string;
}

export async function notify(
  userId: string, 
  { type, title, body, cta_text, cta_url }: NotificationParams
): Promise<{ id: string } | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message: body || title, // Use body or fallback to title for message field
        body,
        cta_text,
        cta_url
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create notification:', error);
      return null;
    }

    return { id: data.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

// Helper functions for common notification types
export async function notifyExpertInvite(expertUserId: string, briefTitle: string, proposalUrl: string) {
  return notify(expertUserId, {
    type: 'expert_invite_to_propose',
    title: `New invitation: ${briefTitle}`,
    body: 'You\'ve been invited to submit a proposal',
    cta_text: 'Submit Proposal',
    cta_url: proposalUrl
  });
}

export async function notifyProposalSubmitted(expertUserId: string, briefTitle: string) {
  return notify(expertUserId, {
    type: 'expert_proposal_submitted', 
    title: 'Proposal submitted successfully',
    body: `Your proposal for ${briefTitle} has been submitted`
  });
}

export async function notifyClientProposalsReady(clientUserId: string, briefTitle: string, proposalCount: number, reviewUrl: string) {
  return notify(clientUserId, {
    type: 'client_proposals_ready',
    title: `${proposalCount} proposal(s) received`,
    body: `You have new proposals for ${briefTitle}`,
    cta_text: 'Review Proposals',
    cta_url: reviewUrl
  });
}

export async function notifyProposalWon(expertUserId: string, briefTitle: string, projectUrl: string) {
  return notify(expertUserId, {
    type: 'expert_proposal_won',
    title: '🎉 Your proposal was accepted!',
    body: `Congratulations! Your proposal for ${briefTitle} was chosen`,
    cta_text: 'View Project',
    cta_url: projectUrl
  });
}

export async function notifyProposalNotSelected(expertUserId: string, briefTitle: string) {
  return notify(expertUserId, {
    type: 'expert_proposal_not_selected',
    title: 'Proposal update',
    body: `Another proposal was selected for ${briefTitle}. Thanks for participating!`
  });
}

export async function notifyPayMilestone1(clientUserId: string, projectTitle: string, payUrl: string) {
  return notify(clientUserId, {
    type: 'client_pay_m1_now',
    title: 'Payment required to start project',
    body: `Pay Milestone 1 to begin ${projectTitle}`,
    cta_text: 'Pay Now',
    cta_url: payUrl
  });
}

export async function notifyPaymentReceived(userId: string, milestoneTitle: string, projectTitle: string, projectUrl: string) {
  return notify(userId, {
    type: 'payment_received_milestone',
    title: 'Payment received',
    body: `Payment for ${milestoneTitle} on ${projectTitle} has been processed`,
    cta_text: 'View Project',
    cta_url: projectUrl
  });
}

export async function notifyQAPassed(expertUserId: string, milestoneTitle: string, projectTitle: string) {
  return notify(expertUserId, {
    type: 'qa_passed_milestone',
    title: 'QA approved - payment released',
    body: `${milestoneTitle} on ${projectTitle} has passed QA. Funds released!`
  });
}

export async function notifyQAFailed(expertUserId: string, milestoneTitle: string, projectTitle: string, milestoneUrl: string) {
  return notify(expertUserId, {
    type: 'qa_failed_milestone', 
    title: 'QA review required',
    body: `${milestoneTitle} on ${projectTitle} needs revisions`,
    cta_text: 'View Details',
    cta_url: milestoneUrl
  });
}

export async function notifyMeetingScheduled(userId: string, meetingTitle: string, startsAt: string, meetUrl: string) {
  return notify(userId, {
    type: 'meeting_scheduled',
    title: 'Meeting confirmed',
    body: `${meetingTitle} scheduled for ${startsAt}`,
    cta_text: 'Join Meeting',
    cta_url: meetUrl
  });
}

export async function notifyChatMessage(recipientUserId: string, senderName: string, messageSnippet: string, projectTitle: string, chatUrl: string) {
  return notify(recipientUserId, {
    type: 'chat_message_received',
    title: `New message from ${senderName}`,
    body: `"${messageSnippet}" on ${projectTitle}`,
    cta_text: 'Open Chat',
    cta_url: chatUrl
  });
}