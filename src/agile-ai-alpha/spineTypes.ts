import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Client = Tables<"aaos_clients">;
export type Engagement = Tables<"aaos_engagements">;
export type Diagnostic = Tables<"aaos_diagnostics">;
export type DiagnosticInput = Tables<"aaos_diagnostic_inputs">;
export type Opportunity = Tables<"aaos_ai_opportunities">;
export type Sprint = Tables<"aaos_sprints">;
export type Story = Tables<"aaos_stories">;
export type AgentRole = Tables<"aaos_agent_roles">;
export type EvidenceItem = Tables<"aaos_evidence_items">;
export type GovernanceRisk = Tables<"aaos_governance_risks">;
export type Control = Tables<"aaos_controls">;
export type FrameworkMapping = Tables<"aaos_framework_mappings">;
export type ValueLedgerEntry = Tables<"aaos_value_ledger">;
export type MonetisationRecord = Tables<"aaos_monetisation_records">;
export type PortfolioPattern = Tables<"aaos_portfolio_patterns">;
export type Benchmark = Tables<"aaos_benchmarks">;
export type AlphaReport = Tables<"aaos_reports">;
export type NarrativeNote = Tables<"aaos_narrative_notes">;
export type NarrativeSuggestion = Tables<"aaos_narrative_suggestions">;

export type ClientInsert = TablesInsert<"aaos_clients">;
export type EngagementInsert = TablesInsert<"aaos_engagements">;
