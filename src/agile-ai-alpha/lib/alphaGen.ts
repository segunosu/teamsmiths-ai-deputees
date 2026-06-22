// AI Alpha OS — generation service abstractions (template-first, AI-upgradeable).
// Each generator reads stored data, writes structured records, and logs activity.
// These are deterministic for speed/economy; swap the bodies for AI later behind
// the same interface (see ARCHITECTURE.md / WORKFLOW_SPEC.md).
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "./activity";
import { computePriorityScore } from "./spineScoring";
import { computeRiskScore } from "./spineScoring";
import type { Client } from "../spineTypes";

const PRELIM = "Preliminary, evidence-based assessment. Requires validation with the client. Not legal, investment, or compliance advice; no certification implied.";

async function loadCompanyContext(client: Client) {
  if (!client.company_id) return { company: null, signals: [], score: null, fourps: null, agile: null };
  const [{ data: company }, { data: signals }, { data: scoreRows }, { data: fpRows }, { data: agRows }] = await Promise.all([
    supabase.from("aaos_companies").select("*").eq("id", client.company_id).maybeSingle(),
    supabase.from("aaos_company_signals").select("*").eq("company_id", client.company_id),
    supabase.from("aaos_company_scores").select("*").eq("company_id", client.company_id).order("created_at", { ascending: false }).limit(1),
    supabase.from("aaos_four_ps_scores").select("*").eq("company_id", client.company_id).order("created_at", { ascending: false }).limit(1),
    supabase.from("aaos_agile_ai_scores").select("*").eq("company_id", client.company_id).order("created_at", { ascending: false }).limit(1),
  ]);
  return { company, signals: signals || [], score: scoreRows?.[0] || null, fourps: fpRows?.[0] || null, agile: agRows?.[0] || null };
}

// ---------- AI spine generators (call aaos-generate "spine" type) ----------
// Read the client's company data + signals (+ diagnostic/opportunity) and
// AI-draft tailored, structured records for human review — not boilerplate.
async function invokeSpine(target: string, body: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke("aaos-generate", {
    body: { type: "spine", target, ...body },
  });
  if (error) throw new Error((data as any)?.error || error.message || `Failed to generate ${target}`);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as any;
}

// ---------- Diagnostic (AI) ----------
export async function generateDiagnostic(client: Client, engagementId?: string | null, diagnosticId?: string | null) {
  const res = await invokeSpine("diagnostic", { client_id: client.id, engagement_id: engagementId ?? null, diagnostic_id: diagnosticId ?? null });
  return res.diagnostic;
}

// ---------- Opportunity map (AI) ----------
export async function generateOpportunityMap(client: Client, engagementId?: string | null, diagnosticId?: string | null) {
  const res = await invokeSpine("opportunities", { client_id: client.id, engagement_id: engagementId ?? null, diagnostic_id: diagnosticId ?? null });
  return res.rows;
}

// ---------- Sprint stories from an opportunity (AI) ----------
export async function generateSprintStories(opportunity: any, sprintId: string) {
  const res = await invokeSpine("sprint_stories", {
    client_id: opportunity.client_id, engagement_id: opportunity.engagement_id,
    opportunity_id: opportunity.id, sprint_id: sprintId,
  });
  return res.rows;
}

// ---------- Governance: AI-proposed, library-grounded structured rows ----------
// These call the aaos-generate edge function (type "gov_rows"), which reads the
// vendor's data + signals + the reusable Library (risks/controls mapped to EU AI
// Act / GDPR / SOC 2 / ISO / NIST) and proposes TAILORED rows for human review —
// instead of generic boilerplate. The system holds the regulatory knowledge.
async function invokeGovRows(target: "risks" | "controls" | "evidence", client: Client) {
  const { data, error } = await supabase.functions.invoke("aaos-generate", {
    body: { type: "gov_rows", target, client_id: client.id, company_id: client.company_id },
  });
  if (error) throw new Error((data as any)?.error || error.message || `Failed to generate ${target}`);
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data as any).rows;
}

export const generateGovernanceRisks = (client: Client, _engagementId?: string | null) => invokeGovRows("risks", client);
export const generateControls = (client: Client, _engagementId?: string | null) => invokeGovRows("controls", client);
export const generateEvidenceChecklist = (client: Client, _engagementId?: string | null) => invokeGovRows("evidence", client);

// ---------- KPI baseline (AI) ----------
export async function generateKpiBaseline(client: Client, engagementId?: string | null) {
  const res = await invokeSpine("kpis", { client_id: client.id, engagement_id: engagementId ?? null });
  return res.rows;
}

// ---------- Monetisation review (AI) ----------
export async function generateMonetisationReview(client: Client, engagementId?: string | null, valueLedgerId?: string | null) {
  const res = await invokeSpine("monetisation", { client_id: client.id, engagement_id: engagementId ?? null, value_ledger_id: valueLedgerId ?? null });
  return res.record;
}

// ---------- Portfolio pattern (AI) ----------
export async function generatePortfolioPattern(client: Client) {
  const res = await invokeSpine("portfolio", { client_id: client.id });
  return res.pattern;
}

// ---------- Reports (AI) ----------
export async function generateReport(client: Client, engagementId: string | null, reportType: string) {
  const res = await invokeSpine("report", { client_id: client.id, engagement_id: engagementId ?? null, report_type: reportType });
  return res.report;
}
