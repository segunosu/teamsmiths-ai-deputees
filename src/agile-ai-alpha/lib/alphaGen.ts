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

// ---------- Diagnostic ----------
export async function generateDiagnostic(client: Client, engagementId?: string | null, diagnosticId?: string | null) {
  const { company, signals, score, fourps, agile } = await loadCompanyContext(client);
  const sectorTxt = company?.sector ? ` in the ${company.sector} sector` : "";
  const sigTxt = signals.length
    ? signals.slice(0, 6).map((s: any) => `- ${s.signal_type}: ${s.signal_summary || ""}`).join("\n")
    : "- No public signals recorded yet.";
  const summary = `${client.client_name} is an active client${sectorTxt}. This preliminary diagnostic synthesises the AI Alpha Fit Score, recorded signals, 4Ps governance and Agile AI maturity into a 90-day value focus.`;
  const fields = {
    diagnostic_summary: summary,
    key_findings: `Observed signals:\n${sigTxt}`,
    top_opportunities_summary: "1) Automate the most manual, highest-volume workflow. 2) Reduce a visible cycle time. 3) Improve a measurable conversion or quality KPI.",
    top_risks_summary: "Data readiness and human-in-the-loop discipline are the most likely early risks; governance evidence is typically thin pre-engagement.",
    recommended_90_day_focus: "One governed AI value sprint on the highest-leverage workflow, with a KPI baseline captured in week 1 and a 4Ps evidence shell started.",
    readiness_score: agile?.agile_ai_maturity_score ?? null,
    value_potential_low: 4000,
    value_potential_high: 20000,
    confidence_level: "medium",
    status: "In Progress",
    human_review_required: true,
  };
  if (diagnosticId) {
    const { data } = await supabase.from("aaos_diagnostics").update(fields).eq("id", diagnosticId).select().single();
    await logActivity({ action: "diagnostic generated", summary: `Diagnostic drafted for ${client.client_name}`, client_id: client.id, entity_type: "diagnostic", entity_id: diagnosticId });
    return data;
  }
  const { data } = await supabase.from("aaos_diagnostics").insert({ client_id: client.id, engagement_id: engagementId ?? null, diagnostic_name: "AI Alpha Diagnostic", ...fields }).select().single();
  await logActivity({ action: "diagnostic generated", summary: `Diagnostic drafted for ${client.client_name}`, client_id: client.id, entity_type: "diagnostic", entity_id: data?.id });
  return data;
}

// ---------- Opportunity map ----------
export async function generateOpportunityMap(client: Client, engagementId?: string | null, diagnosticId?: string | null) {
  const { company } = await loadCompanyContext(client);
  const area = company?.sector || "Operations";
  const templates = [
    { opportunity_title: "AI-assisted core workflow", business_area: area, value_type: "time saving", v: 5, u: 4, c: 4, s: 4, e: 2, r: 2, low: 4000, high: 12000 },
    { opportunity_title: "Conversion / quality uplift", business_area: "Revenue", value_type: "conversion improvement", v: 4, u: 3, c: 3, s: 4, e: 3, r: 2, low: 3000, high: 9000 },
    { opportunity_title: "Support / cost reduction", business_area: "Cost", value_type: "cost reduction", v: 4, u: 3, c: 3, s: 3, e: 2, r: 2, low: 2000, high: 8000 },
  ];
  const rows = templates.map((t) => ({
    client_id: client.id, engagement_id: engagementId ?? null, diagnostic_id: diagnosticId ?? null,
    opportunity_title: t.opportunity_title,
    opportunity_description: `${t.opportunity_title} for ${client.client_name}. Template opportunity — refine with client evidence.`,
    business_area: t.business_area, value_type: t.value_type,
    estimated_monthly_value_low: t.low, estimated_monthly_value_high: t.high,
    estimated_annual_value_low: t.low * 12, estimated_annual_value_high: t.high * 12,
    implementation_effort: "Medium", time_to_impact: "30-60 days", confidence_level: "medium", risk_level: "medium",
    suggested_solution: "AI-assisted workflow with human-in-the-loop review.",
    acceptance_criteria: "Measurable improvement on the linked KPI with a documented baseline.",
    recommended_next_action: "Capture KPI baseline, then select for a value sprint.",
    status: "New",
    value_potential_score: t.v, urgency_score: t.u, confidence_score: t.c, strategic_fit_score: t.s, effort_score: t.e, risk_score: t.r,
    priority_score: computePriorityScore({ value_potential_score: t.v, urgency_score: t.u, confidence_score: t.c, strategic_fit_score: t.s, effort_score: t.e, risk_score: t.r }),
  }));
  const { data } = await supabase.from("aaos_ai_opportunities").insert(rows).select();
  await logActivity({ action: "opportunities generated", summary: `${rows.length} AI opportunities mapped for ${client.client_name}`, client_id: client.id, entity_type: "opportunity" });
  return data;
}

// ---------- Sprint stories from an opportunity ----------
export async function generateSprintStories(opportunity: any, sprintId: string) {
  const base = {
    sprint_id: sprintId, client_id: opportunity.client_id, engagement_id: opportunity.engagement_id, opportunity_id: opportunity.id,
  };
  const stories = [
    { story_title: "Discovery & data check", story_type: "discovery", owner_type: "AI Analyst", points: 2, hr: false },
    { story_title: "KPI baseline captured", story_type: "data", owner_type: "AI Analyst", points: 2, hr: false },
    { story_title: "Build AI-assisted prototype", story_type: "build", owner_type: "AI Builder", points: 5, hr: false },
    { story_title: "Governance & risk review", story_type: "governance", owner_type: "AI Governance Reviewer", points: 3, hr: true },
    { story_title: "Client-facing result write-up", story_type: "reporting", owner_type: "AI QA Reviewer", points: 2, hr: true },
  ];
  const rows = stories.map((s) => ({
    ...base,
    story_title: s.story_title,
    user_story: `As the AI Alpha operator, I want to ${s.story_title.toLowerCase()} so that "${opportunity.opportunity_title}" delivers measurable value.`,
    story_type: s.story_type,
    acceptance_criteria: "Output meets the definition of done and the linked KPI is measurable.",
    definition_of_done: "Reviewed, evidence captured, status moved to Done after any required approval.",
    golden_test: s.hr ? "A human reviewer confirms the output is accurate, safe, and client-appropriate before release." : null,
    owner_type: s.owner_type,
    points: s.points,
    status: "Inbox",
    human_review_required: s.hr,
    review_status: s.hr ? "Needs Human Review" : "Not Required",
  }));
  const { data } = await supabase.from("aaos_stories").insert(rows).select();
  await supabase.from("aaos_ai_opportunities").update({ status: "Selected for Sprint" }).eq("id", opportunity.id);
  await logActivity({ action: "stories generated", summary: `${rows.length} stories generated from "${opportunity.opportunity_title}"`, client_id: opportunity.client_id, entity_type: "story" });
  return data;
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

// ---------- KPI baseline shells ----------
export async function generateKpiBaseline(client: Client, engagementId?: string | null) {
  const rows = [
    { kpi_name: "Primary workflow cycle time", kpi_category: "cycle time", unit: "hours", confidence_level: "medium" },
    { kpi_name: "Target conversion / quality metric", kpi_category: "conversion", unit: "%", confidence_level: "low" },
  ].map((k) => ({ ...k, client_id: client.id, engagement_id: engagementId ?? null, company_id: client.company_id }));
  const { data } = await supabase.from("aaos_kpis").insert(rows).select();
  await logActivity({ action: "KPI baseline generated", summary: `${rows.length} KPI baselines for ${client.client_name}`, client_id: client.id, entity_type: "kpi" });
  return data;
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
