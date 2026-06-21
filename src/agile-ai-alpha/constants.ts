// AI Alpha OS — shared constants, enums and scoring configuration.

export const COMPANY_STATUSES = [
  "New", "Researching", "Snapshot Ready", "Outreach Ready", "Contacted",
  "Interested", "Proposal Ready", "Accepted", "Nurture", "Rejected", "Onboarded",
] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const ACCEPTANCE_DECISIONS = ["Accept", "Nurture", "Reject", "Research More"] as const;
export type AcceptanceDecision = (typeof ACCEPTANCE_DECISIONS)[number];

export const ACCEPTED_OFFER_ROUTES = [
  "AI Alpha Diagnostic",
  "90-Day AI Value Sprint",
  "Operating Partner Subscription",
  "Gain-Share Candidate",
  "Warrant or Equity Candidate",
  "Research More Before Offer",
] as const;

export const PROPOSAL_ROUTE_TYPES = [
  "AI Alpha Diagnostic",
  "90-Day AI Value Sprint",
  "Operating Partner Subscription",
  "Gain-Share Candidate",
  "Warrant or Equity Candidate",
  "Research More",
] as const;

export const PROPOSAL_PRICING: Record<string, string> = {
  "AI Alpha Diagnostic": "£3,950",
  "90-Day AI Value Sprint": "£15,000 to £30,000 plus optional upside",
  "Operating Partner Subscription": "£2,500 to £10,000 per month",
  "Gain-Share Candidate": "5% to 15% of agreed verified uplift",
  "Warrant or Equity Candidate": "Human review required",
  "Research More": "n/a",
};

export const SIGNAL_TYPES = [
  "hiring", "funding", "website weakness", "poor conversion", "support bottleneck",
  "customer complaints", "manual workflow", "software delivery bottleneck",
  "regulatory pressure", "growth signal", "cost pressure", "AI adoption signal",
  "competitor pressure", "operational inefficiency", "other",
] as const;

export const SIGNAL_STRENGTHS = ["weak", "medium", "strong"] as const;

export const OUTREACH_TYPES = [
  "short email", "LinkedIn connection note", "follow-up email", "call opener", "meeting agenda",
] as const;

export const REVIEW_STATUSES = ["draft", "needs human review", "approved", "rejected", "sent"] as const;

export const VALUE_TYPES = [
  "revenue increase", "cost reduction", "time saving", "quality improvement",
  "cycle time reduction", "conversion improvement", "retention improvement", "risk reduction",
] as const;

export const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;

export const AUTOMATION_CATEGORIES = ["Fully Automatable", "AI-Assisted", "Human Only"] as const;

export const TASK_STATUSES = ["todo", "in progress", "blocked", "done"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export const COMPANY_SIZE_BANDS = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"] as const;
export const REVENUE_BANDS = ["<£1m", "£1m-£5m", "£5m-£20m", "£20m-£50m", "£50m-£250m", "£250m+"] as const;

// ---- AI Alpha Fit Score (out of 100) ----
export interface FitDimension { key: string; label: string; max: number; hint: string; }
export const FIT_DIMENSIONS: FitDimension[] = [
  { key: "ai_value_potential_score", label: "AI value potential", max: 25, hint: "How much value AI could realistically create" },
  { key: "pain_visibility_score", label: "Pain visibility", max: 15, hint: "How clearly the pain is visible in public signals" },
  { key: "data_workflow_readiness_score", label: "Data & workflow readiness", max: 15, hint: "Are data and workflows ready enough to apply AI" },
  { key: "buyer_accessibility_score", label: "Buyer accessibility", max: 15, hint: "Can we reach the actual buyer" },
  { key: "ability_to_pay_score", label: "Ability to pay / share upside", max: 15, hint: "Can they pay or share verified uplift" },
  { key: "governance_risk_fit_score", label: "Governance risk fit", max: 10, hint: "Is the governance / regulatory risk manageable" },
  { key: "strategic_relevance_score", label: "Strategic relevance", max: 5, hint: "Fit with our strategy and positioning" },
];

// ---- 4Ps governance (each sub-dimension 1-5, each P max 25, overall max 100) ----
export const SCORE_LABELS_1_5 = ["", "Absent", "Aware", "Defined", "Operating", "Embedded"]; // index = score

export interface FourPDef { key: "primed" | "principled" | "practised" | "protected"; label: string; subs: { key: string; label: string }[]; }
export const FOUR_PS: FourPDef[] = [
  {
    key: "primed", label: "Primed",
    subs: [
      { key: "leadership_literacy", label: "Leadership literacy" },
      { key: "workforce_literacy", label: "Workforce literacy" },
      { key: "data_readiness", label: "Data readiness" },
      { key: "infrastructure_readiness", label: "Infrastructure readiness" },
      { key: "use_case_clarity", label: "Use-case clarity" },
    ],
  },
  {
    key: "principled", label: "Principled",
    subs: [
      { key: "stated_principles", label: "Stated principles" },
      { key: "decision_rights", label: "Decision rights" },
      { key: "ethics_review_process", label: "Ethics review process" },
      { key: "transparency_standards", label: "Transparency standards" },
      { key: "human_in_the_loop_rules", label: "Human-in-the-loop rules" },
    ],
  },
  {
    key: "practised", label: "Practised",
    subs: [
      { key: "use_case_lifecycle", label: "Use-case lifecycle" },
      { key: "model_lifecycle", label: "Model lifecycle" },
      { key: "operating_cadence", label: "Operating cadence" },
      { key: "team_capability", label: "Team capability" },
      { key: "vendor_partner_discipline", label: "Vendor / partner discipline" },
    ],
  },
  {
    key: "protected", label: "Protected",
    subs: [
      { key: "risk_inventory", label: "Risk inventory" },
      { key: "regulatory_alignment", label: "Regulatory alignment" },
      { key: "model_cards", label: "Model cards" },
      { key: "audit_trail", label: "Audit trail" },
      { key: "incident_response", label: "Incident response" },
    ],
  },
];

// ---- Agile AI maturity (7 dimensions, each 1-5) ----
export const AGILE_DIMENSIONS = [
  { key: "backlog_quality", label: "Backlog quality" },
  { key: "definition_of_done", label: "Definition of done" },
  { key: "delivery_flow", label: "Delivery flow" },
  { key: "human_ai_teaming", label: "Human–AI teaming" },
  { key: "review_discipline", label: "Review discipline" },
  { key: "automation_readiness", label: "Automation readiness" },
  { key: "kpi_discipline", label: "KPI discipline" },
] as const;

export const COMPLIANCE_FOOTER =
  "Preliminary external assessment based on public and manually entered information. Requires validation with the company.";

export const COMMERCIAL_WARNING = "Commercial terms require human review before client issue.";

// Default onboarding tasks for accepted companies.
export const DEFAULT_ONBOARDING_TASKS = [
  "Confirm key buyer",
  "Send NDA if required",
  "Request baseline KPI data",
  "Request process documents",
  "Request current AI tool list",
  "Request stakeholder map",
  "Schedule discovery call",
  "Create AI Alpha Diagnostic workspace",
  "Create 4Ps assessment shell",
  "Create Agile AI assessment shell",
  "Create KPI baseline template",
  "Prepare first sprint backlog",
];
