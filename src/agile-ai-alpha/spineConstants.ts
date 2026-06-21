// AI Alpha OS — Stage 1+ (vertical spine) constants and enums.
// Mirrors the check-constraints in migration 20260621104315.

export const CLIENT_STATUSES = ["Active", "Paused", "Completed", "Nurture", "Archived"] as const;

export const ENGAGEMENT_TYPES = [
  "AI Alpha Diagnostic", "90-Day AI Value Sprint", "AI Operating Partner Subscription",
  "4Ps Governance Review", "Agile AI Maturity Review", "AI Build Sprint", "Continuous Improvement",
] as const;
export const ENGAGEMENT_STATUSES = ["Draft", "Active", "At Risk", "Complete", "Paused", "Cancelled"] as const;
export const COMMERCIAL_MODELS = [
  "Fixed Fee", "Subscription", "Fixed Fee Plus Upside", "Gain-Share", "Warrant or Equity Candidate", "Internal Demo",
] as const;

// Map an accepted_offer_route (Stage 0) to a default engagement type.
export const OFFER_ROUTE_TO_ENGAGEMENT: Record<string, string> = {
  "AI Alpha Diagnostic": "AI Alpha Diagnostic",
  "90-Day AI Value Sprint": "90-Day AI Value Sprint",
  "Operating Partner Subscription": "AI Operating Partner Subscription",
  "Gain-Share Candidate": "90-Day AI Value Sprint",
  "Warrant or Equity Candidate": "90-Day AI Value Sprint",
  "Research More Before Offer": "AI Alpha Diagnostic",
};

export const DIAGNOSTIC_STATUSES = ["Draft", "In Progress", "Ready for Review", "Approved", "Shared", "Archived"] as const;
export const DIAGNOSTIC_INPUT_TYPES = [
  "interview note", "document note", "public signal", "process observation", "KPI data",
  "system inventory", "AI tool inventory", "risk note", "client statement", "consultant observation",
] as const;

export const OPPORTUNITY_STATUSES = [
  "New", "Qualified", "Selected for Sprint", "In Delivery", "Delivered", "Rejected", "Deferred", "Measuring Impact",
] as const;
export const OPPORTUNITY_VALUE_TYPES = [
  "revenue increase", "cost reduction", "time saving", "quality improvement", "cycle time reduction",
  "conversion improvement", "retention improvement", "risk reduction",
  "delivery predictability improvement", "customer experience improvement",
] as const;

export const SPRINT_TYPES = [
  "Diagnostic Sprint", "Build Sprint", "Governance Sprint", "KPI Sprint", "Automation Sprint", "Reporting Sprint",
] as const;
export const SPRINT_STATUSES = ["Planned", "Active", "Review", "Complete", "Cancelled"] as const;

export const STORY_STATUSES = ["Inbox", "Ready", "In Progress", "Needs Review", "Rejected", "Done", "Blocked", "Deferred"] as const;
export const STORY_TYPES = [
  "discovery", "analysis", "build", "automation", "governance", "reporting", "testing", "data", "client action", "internal action",
] as const;
export const OWNER_TYPES = [
  "Human Consultant", "AI Product Owner", "AI Scrum Master", "AI Analyst", "AI Builder",
  "AI Governance Reviewer", "AI QA Reviewer", "Client Owner",
] as const;
export const STORY_REVIEW_STATUSES = ["Not Required", "Needs Human Review", "Approved", "Rejected", "Rework Required"] as const;

export const FOUR_P_KEYS = ["primed", "principled", "practised", "protected"] as const;
export const FOUR_P_LABELS: Record<string, string> = {
  primed: "Primed", principled: "Principled", practised: "Practised", protected: "Protected",
};

export const RISK_DOMAINS = [
  "privacy", "security", "bias", "transparency", "explainability", "human oversight", "legal",
  "operational", "supplier", "data quality", "model performance", "reputation", "financial",
] as const;

export const EVIDENCE_TYPES = [
  "policy", "procedure", "screenshot", "meeting note", "decision log", "risk register", "control record",
  "model card", "audit trail", "incident response test", "training record", "vendor assessment", "sprint artefact", "KPI report",
] as const;
export const EVIDENCE_STATUSES = ["Missing", "Draft", "Current", "Stale", "Approved", "Rejected"] as const;

export const CONTROL_STATUSES = ["Not Started", "Designed", "Implemented", "Operating", "Needs Review", "Retired"] as const;

export const FRAMEWORKS = [
  "EU AI Act", "NIST AI RMF", "ISO/IEC 42001", "ISO/IEC 27001 adjacent", "GDPR", "SOC 2 readiness", "UK AI principles",
] as const;

export const ATTRIBUTION_CONFIDENCE = ["Low", "Medium", "High"] as const;
export const CLIENT_AGREED = ["Yes", "No", "Pending", "Disputed"] as const;

export const MONETISATION_MODELS = [
  "Fixed Fee", "Subscription", "Fixed Fee Plus Upside", "Gain-Share", "Warrant or Equity Candidate", "No Commercial Trigger",
] as const;
export const INVOICE_STATUSES = ["Not Required", "Draft", "Ready", "Sent", "Paid", "Disputed", "Cancelled"] as const;
export const TRIGGER_STATUSES = ["Not Triggered", "Triggered", "Human Review Required", "Approved", "Rejected", "Invoiced"] as const;

export const REPORT_TYPES = [
  "AI Alpha Diagnostic Report", "90-Day AI Alpha Plan", "Sprint Review Report", "Monthly Value Creation Report",
  "4Ps Governance Report", "KPI Attribution Report", "Board Pack", "Portfolio Learning Summary", "Monetisation Summary",
] as const;
export const REPORT_STATUSES = ["Draft", "Needs Human Review", "Approved", "Shared", "Archived"] as const;

export const PATTERN_TYPES = [
  "AI use case", "sales playbook", "delivery playbook", "governance control", "KPI benchmark",
  "risk pattern", "proposal pattern", "sprint pattern", "automation pattern", "prompt pattern",
] as const;

export const OBSERVATION_TYPES = [
  "general observation", "client situation", "stakeholder dynamic", "pain point", "opportunity", "risk",
  "governance concern", "data concern", "delivery concern", "commercial concern", "KPI/value note",
  "sprint retrospective", "decision note",
] as const;

export const SUGGESTION_ITEM_TYPES = [
  "signal", "risk", "ai opportunity", "KPI hypothesis", "governance evidence gap", "4Ps score adjustment",
  "Agile AI maturity adjustment", "sprint story", "onboarding task", "stakeholder action",
  "monetisation concern", "portfolio pattern",
] as const;

// Default 90-day onboarding/diagnostic shell tasks etc. handled by conversion.
