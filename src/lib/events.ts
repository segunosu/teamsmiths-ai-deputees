import { supabase } from '@/integrations/supabase/client';

export async function emitEvent(type: string, payload: any): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('events-dispatch', {
      body: { type, payload }
    });

    if (error) {
      console.error(`Failed to emit event ${type}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Error emitting event ${type}:`, error);
    throw error;
  }
}

// Event type constants for better type safety
export const EventTypes = {
  // Invitations
  INVITE_SENT: 'invite.sent',
  
  // Proposals  
  PROPOSAL_SUBMITTED: 'proposal.submitted',
  PROPOSAL_ACCEPTED: 'proposal.accepted',
  
  // Projects
  PROJECT_CREATED_FROM_PROPOSAL: 'project.created.from_proposal',
  
  // Payments
  PAYMENT_SUCCEEDED_M1: 'payment.succeeded.m1',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  
  // QA
  QA_PASSED: 'qa.passed',
  QA_FAILED: 'qa.failed',
  
  // Retainers
  RETAINER_ACTIVATED: 'retainer.activated',
  RETAINER_CANCELLED: 'retainer.cancelled',
  
  // Meetings
  MEETING_SCHEDULED: 'meeting.scheduled',
  
  // Chat
  CHAT_MESSAGE_CREATED: 'chat.message.created'
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];

// Helper functions for common events
export async function emitInviteSent(payload: {
  expert_user_id: string;
  brief_id: string;
  brief_title: string;
  client_org: string;
  why_this_expert: string;
  proposal_due_date: string;
}) {
  return emitEvent(EventTypes.INVITE_SENT, payload);
}

export async function emitProposalSubmitted(payload: {
  proposal_id: string;
  expert_user_id: string;
  brief_id: string;
  brief_title: string;
}) {
  return emitEvent(EventTypes.PROPOSAL_SUBMITTED, payload);
}

export async function emitProposalAccepted(payload: {
  proposal_id: string;
  brief_id: string;
  expert_user_id: string;
  client_user_id: string;
  brief_title: string;
  project_id: string;
}) {
  return emitEvent(EventTypes.PROPOSAL_ACCEPTED, payload);
}

export async function emitProjectCreated(payload: {
  project_id: string;
  client_user_id: string;
  expert_user_id: string;
  project_title: string;
  milestone_1_amount: number;
}) {
  return emitEvent(EventTypes.PROJECT_CREATED_FROM_PROPOSAL, payload);
}

export async function emitPaymentSucceeded(payload: {
  milestone_id: string;
  project_id: string;
  client_user_id: string;
  expert_user_id: string;
  milestone_title: string;
  amount: number;
  project_title: string;
  is_milestone_1?: boolean;
}) {
  const eventType = payload.is_milestone_1 ? EventTypes.PAYMENT_SUCCEEDED_M1 : EventTypes.PAYMENT_SUCCEEDED;
  return emitEvent(eventType, payload);
}

export async function emitQAPassed(payload: {
  milestone_id: string;
  project_id: string;
  milestone_title: string;
  project_title: string;
  expert_user_id: string;
}) {
  return emitEvent(EventTypes.QA_PASSED, payload);
}

export async function emitQAFailed(payload: {
  milestone_id: string;
  project_id: string;
  milestone_title: string;
  project_title: string;
  qa_notes: string;
  expert_user_id: string;
}) {
  return emitEvent(EventTypes.QA_FAILED, payload);
}

export async function emitMeetingScheduled(payload: {
  meeting_id: string;
  project_id: string;
  meeting_title: string;
  starts_at: string;
  meet_url: string;
  participant_user_ids: string[];
}) {
  return emitEvent(EventTypes.MEETING_SCHEDULED, payload);
}

export async function emitChatMessage(payload: {
  message_id: string;
  project_id: string;
  sender_user_id: string;
  recipient_user_id: string;
  message_snippet: string;
  project_title: string;
}) {
  return emitEvent(EventTypes.CHAT_MESSAGE_CREATED, payload);
}