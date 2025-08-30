// Microcopy constants for the outcomes and quotes system

export const MICROCOPY = {
  // Header CTAs
  HEADER_PRIMARY_CTA: "Request a custom quote",
  HEADER_SECONDARY_CTA: "Browse outcome packs",
  
  // Anonymity
  ANONYMITY_HINT: "Experts see only anonymised project details until you choose to reveal.",
  ANONYMITY_MODAL_TITLE: "How anonymity works",
  
  // Save & Continue
  SAVE_CONTINUE: "We'll email you a private link so you can finish this request later.",
  
  // Pricing
  PRICE_TOOLTIP: "Price band reflects typical outcomes. Request a quote for an exact estimate.",
  
  // SLA
  SLA_HINT: "Experts usually respond within 48 hours.",
  
  // Escrow
  ESCROW_NOTE: "Funds are held securely and only released when you accept a milestone.",
  
  // Consent Modal
  CONSENT_MODAL_TITLE: "Record & transcribe this meeting?",
  CONSENT_BODY: "Your meeting will be recorded and transcribed for project notes. You can revoke consent later.",
  CONSENT_AGREE: "I consent",
  CONSENT_DISAGREE: "I do not consent",
  
  // Card CTAs
  CARD_USE_OUTCOME: "Use this outcome",
  CARD_REQUEST_QUOTE: "Customize this outcome",
  CARD_SEE_PROOF: "See proof / case studies",
  
  // Form Labels
  PROJECT_TITLE_LABEL: "Project Title",
  PROJECT_DESCRIPTION_LABEL: "Project Description",
  REQUIRED_SKILLS_LABEL: "Required Skills",
  BUDGET_RANGE_LABEL: "Budget Range (optional)",
  DESIRED_START_DATE_LABEL: "Desired Start Date (optional)",
  
  // Form Placeholders
  PROJECT_TITLE_PLACEHOLDER: "Describe your project in a few words",
  PROJECT_DESCRIPTION_PLACEHOLDER: "Describe what you need, your goals, and any specific requirements...",
  SKILL_PLACEHOLDER: "Add a skill...",
  EMAIL_PLACEHOLDER: "your@email.com",
  
  // Form Help Text
  GUEST_EMAIL_HELP: "We'll email you a private link so you can finish this request later.",
  ANONYMITY_HELP: "Experts will see your project details but not your identity",
  
  // Buttons
  SAVE_DRAFT: "Save & Continue Later",
  SUBMIT_REQUEST: "Submit Request",
  SEND_RFP: "Send RFP",
  ACCEPT_PROPOSAL: "Accept & Escrow",
  REQUEST_CHANGES: "Request Changes",
  RAISE_DISPUTE: "Raise Dispute",
  SCHEDULE_MEETING: "Schedule Meeting",
  
  // Status Messages
  MATCHING_IN_PROGRESS: "Finding matching experts...",
  PROPOSAL_PENDING: "Waiting for expert proposals",
  MILESTONE_SUBMITTED: "Milestone submitted for review",
  PAYMENT_RELEASED: "Payment released to expert",
  
  // Error Messages
  FORM_VALIDATION_ERROR: "Please fix the errors above",
  API_ERROR: "Something went wrong. Please try again.",
  NETWORK_ERROR: "Connection error. Please check your internet connection.",
  
  // Success Messages
  DRAFT_SAVED: "Draft saved successfully",
  REQUEST_SUBMITTED: "Request submitted! Finding matching experts...",
  RFP_SENT: "RFP sent to selected experts",
  PROPOSAL_ACCEPTED: "Proposal accepted! Project is now active.",
  MILESTONE_ACCEPTED: "Milestone accepted. Payment released.",
  
  // Loading States
  LOADING_MATCHES: "We'll notify you when ready.",
  PROCESSING_PAYMENT: "Processing payment authorization...",
  PROCESSING_TRANSCRIPT: "Processing transcript...",
  
  // Navigation
  BACK_TO_OUTCOMES: "Back to Outcomes",
  VIEW_PROJECT: "View Project",
  VIEW_PROPOSALS: "View Proposals",
  
  // Meeting & Recording
  RECORDING_CONSENT_REQUIRED: "Recording consent is required from all participants",
  TRANSCRIPT_PROCESSING: "Transcript is being processed",
  TRANSCRIPT_READY: "Transcript is ready",
  
  // Quality Control
  QC_CHECKLIST_FAILED: "Quality checklist must be completed before submission",
  QC_OVERRIDE_REASON: "Override reason is required",
  
  // Dispute & Mediation
  DISPUTE_RAISED: "Dispute raised. Admin will review within 24 hours.",
  MEDIATION_SCHEDULED: "3-way mediation meeting scheduled",
  
  // A/B Test Variants
  CTA_VARIANT_A: "Request a custom quote",
  CTA_VARIANT_B: "Get an expert quote",
  
  // Tooltips
  CONFIDENCE_SCORE_TOOLTIP: "How well this expert matches your requirements",
  ESCROW_TOOLTIP: "Your payment is held securely until milestone completion",
  ANONYMITY_TOOLTIP: "Both parties remain anonymous until reveal or acceptance",
  
  // Badges
  EXPERT_VERIFIED: "Verified Expert",
  TOP_RATED: "Top Rated",
  FAST_RESPONDER: "Fast Responder",
  
  // Time Estimates
  TYPICAL_RESPONSE_TIME: "24-48 hours",
  MATCHING_TIME: "Usually within 2 hours",
  PROPOSAL_TIME: "2-5 business days",
} as const;

// Type for microcopy keys
export type MicrocopyKey = keyof typeof MICROCOPY;