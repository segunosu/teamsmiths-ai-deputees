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

// ---------- Monetisation review ----------
export async function generateMonetisationReview(client: Client, engagementId?: string | null, valueLedgerId?: string | null) {
  const { data } = await supabase.from("aaos_monetisation_records").insert({
    client_id: client.id, engagement_id: engagementId ?? null, value_ledger_id: valueLedgerId ?? null,
    commercial_model: "Fixed Fee Plus Upside", trigger_condition: "Verified KPI uplift agreed by client over 60-90 days.",
    trigger_status: "Human Review Required", invoice_status: "Not Required", human_review_required: true,
  }).select().single();
  await logActivity({ action: "monetisation review created", summary: `Monetisation review for ${client.client_name}`, client_id: client.id, entity_type: "monetisation", entity_id: data?.id });
  return data;
}

// ---------- Portfolio pattern ----------
export async function generatePortfolioPattern(client: Client) {
  const { company } = await loadCompanyContext(client);
  const { data } = await supabase.from("aaos_portfolio_patterns").insert({
    pattern_title: `${company?.sector || "Sector"} — AI value sprint pattern`,
    pattern_type: "delivery playbook", sector: company?.sector || null, company_size_band: company?.company_size_band || null,
    summary: "Reusable, anonymised delivery pattern captured from this engagement.",
    reusable_playbook: "1) Find the most manual high-volume workflow. 2) Baseline a KPI. 3) Ship an AI-assisted prototype with human review. 4) Measure uplift. 5) Govern with 4Ps evidence.",
    source_client_id: client.id, anonymised: true, confidence_level: "medium",
  }).select().single();
  await logActivity({ action: "portfolio pattern captured", summary: `Pattern captured from ${client.client_name}`, client_id: client.id, entity_type: "pattern", entity_id: data?.id });
  return data;
}

// ---------- Reports ----------
export async function generateReport(client: Client, engagementId: string | null, reportType: string) {
  const [{ data: diag }, { data: opps }, { data: kpis }, { data: vledger }, { data: risks }, { data: monet }] = await Promise.all([
    supabase.from("aaos_diagnostics").select("*").eq("client_id", client.id).order("created_at", { ascending: false }).limit(1),
    supabase.from("aaos_ai_opportunities").select("*").eq("client_id", client.id),
    supabase.from("aaos_kpis").select("*").eq("client_id", client.id),
    supabase.from("aaos_value_ledger").select("*").eq("client_id", client.id),
    supabase.from("aaos_governance_risks").select("*").eq("client_id", client.id),
    supabase.from("aaos_monetisation_records").select("*").eq("client_id", client.id),
  ]);
  const d = diag?.[0];
  const oppLines = (opps || []).map((o: any) => `- **${o.opportunity_title}** (priority ${o.priority_score ?? "?"}, £${o.estimated_monthly_value_low ?? "?"}–£${o.estimated_monthly_value_high ?? "?"}/mo)`).join("\n") || "- None yet";
  const kpiLines = (kpis || []).map((k: any) => `- ${k.kpi_name}: baseline ${k.baseline_value ?? "?"} → target ${k.target_value ?? "?"} ${k.unit || ""} (actual ${k.actual_value ?? "—"})`).join("\n") || "- None yet";
  const valLines = (vledger || []).map((v: any) => `- ${v.value_title}: uplift ${v.calculated_uplift ?? "?"}, £${v.financial_value_low ?? "?"}–£${v.financial_value_high ?? "?"} (${v.attribution_confidence || "?"} confidence, client ${v.client_agreed || "Pending"})`).join("\n") || "- None yet";
  const riskLines = (risks || []).map((r: any) => `- [${r.risk_score ?? "?"}] ${r.risk_title} (${r.risk_domain})`).join("\n") || "- None yet";
  const content = `> ${PRELIM}

# ${reportType} — ${client.client_name}

## What we found
${d?.key_findings || d?.diagnostic_summary || "Diagnostic pending."}

## Recommended 90-day focus
${d?.recommended_90_day_focus || "To be confirmed."}

## AI opportunities
${oppLines}

## KPIs
${kpiLines}

## Value created (estimated / validated)
${valLines}

## Governance risks
${riskLines}

## Commercial
${(monet || []).length ? `${(monet || []).length} monetisation record(s) under review. Commercial terms require human review before client issue.` : "No monetisation record yet."}

## Decisions needed
- Approve this report for client sharing (human review required).
- Confirm KPI baselines and attribution confidence.

*${PRELIM}*`;
  const { data } = await supabase.from("aaos_reports").insert({
    client_id: client.id, engagement_id: engagementId, report_type: reportType, title: `${reportType} — ${client.client_name}`,
    generated_content: content, assumptions: "Template report generated from stored records.", confidence_level: "medium",
    review_status: "Needs Human Review", approved_for_client: false, generated_at: new Date().toISOString(),
    input_data_used: { opportunities: (opps || []).length, kpis: (kpis || []).length, risks: (risks || []).length } as never,
  }).select().single();
  await logActivity({ action: "report generated", summary: `${reportType} generated for ${client.client_name}`, client_id: client.id, entity_type: "report", entity_id: data?.id });
  return data;
}
