// Front-end API service layer for outcomes and quotes system
import { supabase } from '@/integrations/supabase/client';

// Types
export interface Match {
  anonymizedExpertId: string;
  roleBadge: string;                            // e.g., "Senior Data Engineer"
  confidenceScore: number;                      // 0–100
  rationale: Array<'skill-match' | 'budget-fit' | 'availability' | 'rating'>;
  rateEstimate?: { type: 'hour' | 'day' | 'project'; min?: number; max?: number; currency: string };
  availability?: string;                        // e.g., "2–3 weeks"
  sampleLinks?: string[];
}

export interface Proposal {
  id: string;
  expertId: string;
  deliverables: Array<{
    title: string;
    description: string;
    dueDate?: string;
  }>;
  milestones: Array<{
    name: string;
    dueDate: string;
    paymentPercent: number;
    description?: string;
  }>;
  totalPrice: number;
  currency: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  terms?: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CRPayload {
  title: string;
  description: string;
  deliverables?: Array<{ title: string }>;
  milestones?: Array<{
    name: string;
    durationDays?: number;
    acceptanceCriteria?: string;
    paymentPercent?: number;
  }>;
  budgetMin?: number;
  budgetTypical?: number;
  budgetMax?: number;
  requiredSkills?: string[];
  desiredStartDate?: string;
  anonymityFlag: boolean;
  guestEmail?: string;
}

// API Functions

/**
 * Customization Request (CR) APIs
 */
export async function createCR(payload: CRPayload): Promise<{ crId: string; status: 'draft' | 'open'; saveToken?: string }> {
  const { data, error } = await supabase.functions.invoke('create-customization-request', {
    body: payload
  });

  if (error) throw error;
  return data;
}

export async function submitCR(crId: string): Promise<{ matchJobId: string }> {
  const { data, error } = await supabase.functions.invoke('submit-customization-request', {
    body: { crId }
  });

  if (error) throw error;
  return data;
}

export async function getMatchResults(matchJobId: string): Promise<{ status: 'pending' | 'completed'; matches: Match[] }> {
  const { data, error } = await supabase.functions.invoke('get-match-results', {
    body: { matchJobId }
  });

  if (error) throw error;
  return data;
}

/**
 * Shortlist & RFP APIs
 */
export async function sendRfp(crId: string, expertIds: string[], message?: string): Promise<void> {
  const { error } = await supabase.functions.invoke('send-rfp', {
    body: { crId, expertIds, message }
  });

  if (error) throw error;
}

/**
 * Proposal APIs
 */
export async function listProposals(crId: string): Promise<Proposal[]> {
  const { data, error } = await supabase.functions.invoke('list-proposals', {
    body: { crId }
  });

  if (error) throw error;
  return data;
}

export async function createCounterProposal(proposalId: string, payload: Partial<Proposal>): Promise<Proposal> {
  const { data, error } = await supabase.functions.invoke('create-counter-proposal', {
    body: { proposalId, ...payload }
  });

  if (error) throw error;
  return data;
}

export async function acceptProposal(proposalId: string): Promise<{ projectId: string; escrowId?: string }> {
  const { data, error } = await supabase.functions.invoke('accept-proposal', {
    body: { proposalId }
  });

  if (error) throw error;
  return data;
}

/**
 * Milestone APIs
 */
export async function submitMilestone(milestoneId: string, payload: {
  deliverables: Array<{ file: File; notes?: string }>;
  qcChecklist: Record<string, boolean>;
  overrideReason?: string;
}): Promise<void> {
  const formData = new FormData();
  formData.append('milestoneId', milestoneId);
  formData.append('qcChecklist', JSON.stringify(payload.qcChecklist));
  
  if (payload.overrideReason) {
    formData.append('overrideReason', payload.overrideReason);
  }

  payload.deliverables.forEach((deliverable, index) => {
    formData.append(`deliverable_${index}`, deliverable.file);
    if (deliverable.notes) {
      formData.append(`notes_${index}`, deliverable.notes);
    }
  });

  const { error } = await supabase.functions.invoke('submit-milestone', {
    body: formData
  });

  if (error) throw error;
}

export async function acceptMilestone(milestoneId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('accept-milestone', {
    body: { milestoneId }
  });

  if (error) throw error;
}

export async function requestMilestoneChanges(milestoneId: string, message: string): Promise<void> {
  const { error } = await supabase.functions.invoke('request-milestone-changes', {
    body: { milestoneId, message }
  });

  if (error) throw error;
}

export async function raiseMilestoneDispute(milestoneId: string, reason: string): Promise<void> {
  const { error } = await supabase.functions.invoke('raise-milestone-dispute', {
    body: { milestoneId, reason }
  });

  if (error) throw error;
}

/**
 * Meeting APIs
 */
export async function createMeeting(projectId: string, payload: {
  title: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  recordingConsent?: boolean;
}): Promise<{ meetingId: string; meetLink: string }> {
  const { data, error } = await supabase.functions.invoke('create-google-meet', {
    body: { projectId, ...payload }
  });

  if (error) throw error;
  return data;
}

/**
 * Chat APIs
 */
export async function sendMessage(sessionId: string, content: string, attachments?: File[]): Promise<void> {
  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('content', content);
  
  if (attachments) {
    attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file);
    });
  }

  const { error } = await supabase.functions.invoke('send-chat-message', {
    body: formData
  });

  if (error) throw error;
}

export async function getChatHistory(sessionId: string): Promise<Array<{
  id: string;
  role: 'user' | 'expert' | 'system';
  content: string;
  timestamp: string;
  attachments?: string[];
}>> {
  const { data, error } = await supabase.functions.invoke('get-chat-history', {
    body: { sessionId }
  });

  if (error) throw error;
  return data;
}

/**
 * Outcome Card Data APIs
 */
export async function getOutcomeCards(viewMode: 'proof' | 'catalog'): Promise<Array<{
  id: string;
  title: string;
  subtitle?: string;
  deliverables: string[];
  durationEstimate: string;
  priceBand?: { low?: number; typical?: number; high?: number; currency: string };
  evidence?: Array<{ type: 'case' | 'tool'; text: string; link?: string }>;
  expertBadges?: Array<{ role: string; expertiseTag?: string }>;
  tags?: string[];
}>> {
  const { data, error } = await supabase.functions.invoke('get-outcome-cards', {
    body: { viewMode }
  });

  if (error) throw error;
  return data;
}

/**
 * Error handling utility
 */
export class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Generic error handler for API calls
 */
export function handleAPIError(error: any): never {
  if (error?.message) {
    throw new APIError(error.message, error.code, error.statusCode);
  }
  throw new APIError('An unexpected error occurred');
}