import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Company = Tables<"aaos_companies">;
export type CompanyInsert = TablesInsert<"aaos_companies">;
export type CompanyScore = Tables<"aaos_company_scores">;
export type Signal = Tables<"aaos_company_signals">;
export type FourPsScore = Tables<"aaos_four_ps_scores">;
export type AgileScore = Tables<"aaos_agile_ai_scores">;
export type Snapshot = Tables<"aaos_snapshots">;
export type OutreachDraft = Tables<"aaos_outreach_drafts">;
export type ProposalRoute = Tables<"aaos_proposal_routes">;
export type OnboardingTask = Tables<"aaos_onboarding_tasks">;
export type Kpi = Tables<"aaos_kpis">;
export type ValueHypothesis = Tables<"aaos_value_hypotheses">;
export type ActivityLog = Tables<"aaos_activity_log">;
