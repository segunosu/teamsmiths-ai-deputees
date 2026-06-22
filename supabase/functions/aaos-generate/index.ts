// AI Alpha OS — generation service
// Generates AI Alpha Opportunity Snapshots, outreach drafts, proposal routes
// and (deterministic) onboarding packs. Admin-gated.
//
// AI provider: Lovable AI Gateway (LOVABLE_API_KEY) is primary. If it is not
// provisioned, the function falls back to OpenAI (OPENAI_API_KEY) using the
// GPT-5 family. gpt-4o-mini is intentionally NOT used (legacy).
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMPLIANCE_FOOTER =
  "Preliminary external assessment based on public and manually entered information. Requires validation with the company.";

const OFFER_ROUTES: Record<string, string> = {
  "AI Alpha Diagnostic": "£3,950",
  "90-Day AI Value Sprint": "£15,000 to £30,000 plus optional upside",
  "Operating Partner Subscription": "£2,500 to £10,000 per month",
  "Gain-Share Candidate": "5% to 15% of agreed verified uplift",
  "Warrant or Equity Candidate": "Human review required",
};

const DEFAULT_ONBOARDING_TASKS = [
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

// Map a Lovable model to an equivalent OpenAI fallback model.
const OPENAI_FALLBACK: Record<string, string> = {
  "google/gemini-2.5-pro": "gpt-5-2025-08-07",
  "google/gemini-2.5-flash": "gpt-5-mini-2025-08-07",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Calls Lovable AI Gateway first; falls back to OpenAI (GPT-5) if the Lovable
// key is absent. Returns { content, provider, model }.
async function callAI(system: string, user: string, model: string) {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const messages = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];

  let url: string, key: string, useModel: string, provider: string;
  if (lovableKey) {
    url = "https://ai.gateway.lovable.dev/v1/chat/completions";
    key = lovableKey;
    useModel = model;
    provider = "lovable";
  } else if (openaiKey) {
    url = "https://api.openai.com/v1/chat/completions";
    key = openaiKey;
    useModel = OPENAI_FALLBACK[model] || "gpt-5-mini-2025-08-07";
    provider = "openai";
  } else {
    throw new Error("No AI key configured. Enable Lovable AI (LOVABLE_API_KEY) or set OPENAI_API_KEY.");
  }

  // Note: GPT-5 + Gemini gateway models use default temperature; do not send
  // temperature or max_tokens to stay compatible across both.
  const resp = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: useModel, messages }),
  });
  if (resp.status === 429) throw new Error("AI rate limit reached. Please retry shortly.");
  if (resp.status === 402) throw new Error("AI credits exhausted. Top up Lovable AI credits.");
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`AI error ${resp.status} (${provider}/${useModel}): ${txt}`);
  }
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  return { content, provider, model: useModel };
}

// Robust JSON extraction that works whether or not the model wraps output in
// markdown code fences.
function extractJson(text: string): any {
  let t = (text || "").trim();
  t = t.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first >= 0 && last > first) t = t.slice(first, last + 1);
  return JSON.parse(t);
}

function companyContext(company: any, signals: any[], score: any, fourps: any, agile: any) {
  const sig = (signals || [])
    .map((s) => `- [${s.signal_strength || "?"}] ${s.signal_type}: ${s.signal_summary || ""}${s.implication ? ` (implication: ${s.implication})` : ""}`)
    .join("\n");
  return `COMPANY
Name: ${company.company_name}
Website: ${company.website || "n/a"}
Sector: ${company.sector || "n/a"} / ${company.subsector || ""}
Size band: ${company.company_size_band || "n/a"} | Revenue band: ${company.estimated_revenue_band || "n/a"}
Country/Region: ${company.country || "n/a"} / ${company.region || ""}
Ownership: ${company.ownership_type || "n/a"} | Funding: ${company.funding_stage || "n/a"}
Key contact: ${company.key_contact_name || "n/a"} (${company.key_contact_role || "role n/a"})
Notes: ${company.notes || "none"}

PUBLIC / OBSERVED SIGNALS
${sig || "none recorded"}

AI ALPHA FIT SCORE
${score ? `Total ${score.ai_alpha_fit_score ?? "?"}/100 (band ${score.score_band || "?"}). Notes: ${score.scoring_notes || ""}` : "not yet scored"}

4Ps GOVERNANCE (preliminary)
${fourps ? `Overall ${fourps.overall_4ps_score ?? "?"}/100 (${fourps.overall_4ps_band || "?"})` : "not yet assessed"}

AGILE AI MATURITY
${agile ? `Total ${agile.agile_ai_maturity_score ?? "?"} (band ${agile.agile_ai_maturity_band || "?"})` : "not yet assessed"}`;
}

// Classify a vendor into governance archetypes from what they do (the RULE):
// 80% of governance is universal; the archetype adds the use-case-specific 20%.
function archetypeTags(text: string): string[] {
  const t = (text || "").toLowerCase();
  const tags: string[] = [];
  if (/agent|autonomous|outbound|\bsdr\b|sales automation/.test(t)) tags.push("arch:agents");
  if (/vision|cctv|camera|video analytic|surveillance|biometric/.test(t)) tags.push("arch:vision");
  if (/avatar|twin|generative video|voice clone|deepfake|synthetic media|video creation|video editing/.test(t)) tags.push("arch:genmedia");
  if (/hiring|recruit|candidate|screening|talent|credit scoring/.test(t)) tags.push("arch:hiring");
  if (/value selling|value-selling|business case|\bcrm\b|pipeline|\bgtm\b|revenue team/.test(t)) tags.push("arch:gtm");
  if (/block explorer|infrastructure|provenance|lineage|marketplace|training data|data assurance/.test(t)) tags.push("arch:infra");
  return tags;
}

// Load the "most likely useful base": archetype-matched items first, then the
// universal core, deduped.
async function loadLibrary(supabase: any, kinds: string[], archTags: string[]) {
  const base = await supabase.from("aaos_library").select("kind,title,framework,question,body,tags").in("kind", kinds).limit(40);
  let items: any[] = base.data || [];
  if (archTags && archTags.length) {
    const arch = await supabase.from("aaos_library").select("kind,title,framework,question,body,tags").overlaps("tags", archTags).limit(24);
    const seen = new Set(items.map((i: any) => i.title));
    const prioritized = (arch.data || []).filter((i: any) => !seen.has(i.title));
    items = [...prioritized, ...items];
  }
  return items;
}

// ===================== GOVERNANCE artefact generation (library-grounded AI) =====================
const GOV_ARTIFACTS: Record<string, { title: string; kinds: string[]; instruction: string }> = {
  gap_memo: {
    title: "Stuck-Deal Review — Gap Memo", kinds: ["questionnaire_qa", "risk", "control"],
    instruction: "Write a Stuck-Deal Review gap memo for this AI vendor. Using the buyer questionnaire/context (if any) and the vendor's public signals, identify (1) what is most likely blocking the enterprise security/AI-risk review, (2) the specific gaps vs the reference controls, and (3) a prioritised 14-day remediation plan mapped to the Enterprise-Ready Governance Pack (policy, risk register, model cards, questionnaire-response library, incident playbook, attestation). Be specific to this vendor. GitHub-flavoured Markdown with clear headings.",
  },
  policy: { title: "AI Governance Policy", kinds: ["policy", "control"], instruction: "Draft an AI Governance Policy for this vendor structured on the 4Ps (Primed, Principled, Practised, Protected), tailored to what they do. Markdown." },
  risk_register: { title: "AI Risk Register", kinds: ["risk"], instruction: "Draft an AI risk register as a Markdown table (Risk | 4Ps | Likelihood | Impact | Mitigation | Owner) tailored to this vendor, drawing on the reference risks. 8-14 rows." },
  model_cards: { title: "Model Card(s)", kinds: ["model_card_template"], instruction: "Draft model card(s) for this vendor's AI using the template; infer sensible specifics from what they do and mark assumptions with [placeholders]. Markdown." },
  questionnaire_answers: { title: "Security Questionnaire Answers", kinds: ["questionnaire_qa"], instruction: "Using the buyer questionnaire in the context, draft tailored vendor answers for THIS vendor, grounded in the reference canonical answers. If no questionnaire is provided, answer the standard reference set. Keep [placeholders] where vendor-specific facts are unknown. Markdown Q&A." },
  incident_playbook: { title: "AI Incident Response Playbook", kinds: ["incident_playbook"], instruction: "Draft an AI incident-response playbook tailored to this vendor using the template. Markdown." },
  attestation: { title: "Governance Attestation Summary", kinds: ["attestation_template", "control"], instruction: "Draft a 1-2 page buyer-facing governance attestation summary for this vendor. Preliminary; not a certification. Markdown." },
};

async function handleGovernance(supabase: any, userId: string, body: any) {
  const artifact = body.artifact || "gap_memo";
  const cfg = GOV_ARTIFACTS[artifact];
  if (!cfg) return json({ error: `Unknown governance artifact: ${artifact}` }, 400);

  let company_id = body.company_id || null;
  const client_id = body.client_id || null;
  let companyName = "the vendor";
  let company: any = null;
  if (client_id) {
    const { data: client } = await supabase.from("aaos_clients").select("*").eq("id", client_id).maybeSingle();
    if (client) { company_id = company_id || client.company_id; companyName = client.client_name; }
  }
  if (company_id) {
    const { data: c } = await supabase.from("aaos_companies").select("*").eq("id", company_id).maybeSingle();
    if (c) { company = c; companyName = c.company_name; }
  }
  const { data: signals } = company_id
    ? await supabase.from("aaos_company_signals").select("signal_type,signal_summary").eq("company_id", company_id)
    : { data: [] };
  const archTags = archetypeTags(`${company?.sector || ""} ${company?.subsector || ""} ${company?.notes || ""} ${(signals || []).map((s: any) => s.signal_summary).join(" ")}`);
  const lib = await loadLibrary(supabase, cfg.kinds, archTags);

  const vendorCtx = company
    ? `VENDOR: ${company.company_name}\nWhat they do: ${company.sector || ""} / ${company.subsector || ""}. ${company.notes || ""}\nPublic signals:\n${(signals || []).map((s: any) => `- ${s.signal_type}: ${s.signal_summary}`).join("\n") || "none recorded"}`
    : `VENDOR: ${companyName}`;
  const libCtx = (lib || []).map((l: any) => `- [${l.framework || l.kind}] ${l.question ? l.question + " -> " : ""}${l.title}: ${l.body || ""}`).join("\n");
  const buyerCtx = body.context ? `BUYER QUESTIONNAIRE / CONTEXT PROVIDED:\n${body.context}` : "No specific buyer questionnaire provided.";

  const system = `You are a senior AI-governance consultant producing vendor-ready artefacts that help an AI vendor pass enterprise security / AI-risk reviews. Ground everything in the 4Ps (Primed, Principled, Practised, Protected) and the reference library. Be specific and practical. Use readiness language only — never claim certification (SOC 2 / ISO / EU AI Act / GDPR are targets or obligations, not achieved certifications). Always assume human review. Keep [placeholders] where a vendor-specific fact is unknown.`;
  const user = `${cfg.instruction}\n\n${vendorCtx}\n\n${buyerCtx}\n\nREFERENCE LIBRARY (reuse and tailor — do not copy verbatim):\n${libCtx}`;

  const { content, provider, model } = await callAI(system, user, "google/gemini-2.5-pro");
  const { data: inserted, error } = await supabase.from("aaos_gov_artifacts").insert({
    company_id, client_id, artifact_type: artifact, title: `${cfg.title} — ${companyName}`,
    content, source_context: body.context || null, provider, model,
    review_status: "needs human review", human_review_required: true, created_by: userId,
  }).select().single();
  if (error) throw error;
  await supabase.from("aaos_activity_log").insert({
    entity_type: "gov_artifact", entity_id: inserted.id, company_id, client_id,
    action: "governance generated", summary: `${cfg.title} generated for ${companyName} (${provider}/${model})`, created_by: userId,
  });
  return json({ ok: true, type: "governance", artifact, gov_artifact: inserted, provider, model });
}

// ===================== GOVERNANCE structured ROWS (AI-proposed, library-grounded) =====================
const FOUR_PS_SET = ["primed", "principled", "practised", "protected"];
const RISK_DOMAINS_SET = ["privacy", "security", "bias", "transparency", "explainability", "human oversight", "legal", "operational", "supplier", "data quality", "model performance", "reputation", "financial"];
const EVIDENCE_TYPES_SET = ["policy", "procedure", "screenshot", "meeting note", "decision log", "risk register", "control record", "model card", "audit trail", "incident response test", "training record", "vendor assessment", "sprint artefact", "KPI report"];
const pick = (v: any, set: string[], dflt: string) => (set.includes(v) ? v : dflt);
const clamp15 = (n: any) => { const x = Math.round(Number(n)); return x >= 1 && x <= 5 ? x : 3; };

async function handleGovRows(supabase: any, userId: string, body: any) {
  const target = body.target;
  const client_id = body.client_id;
  if (!client_id) return json({ error: "client_id is required for gov_rows" }, 400);
  const { data: client } = await supabase.from("aaos_clients").select("*").eq("id", client_id).maybeSingle();
  if (!client) return json({ error: "Client not found" }, 404);
  const engagement_id = client.current_engagement_id || null;
  const company_id = client.company_id || null;
  let company: any = null;
  if (company_id) { const { data: c } = await supabase.from("aaos_companies").select("*").eq("id", company_id).maybeSingle(); company = c; }
  const { data: signals } = company_id
    ? await supabase.from("aaos_company_signals").select("signal_type,signal_summary").eq("company_id", company_id)
    : { data: [] };

  const CFG: Record<string, { kinds: string[]; shape: string; instruction: string }> = {
    risks: { kinds: ["risk"], shape: `[{"risk_title":"...","risk_description":"...","risk_domain":"<one of: ${RISK_DOMAINS_SET.join(", ")}>","four_p_dimension":"<primed|principled|practised|protected>","likelihood":1-5,"impact":1-5,"mitigation":"..."}]`, instruction: "Propose 6-10 AI-governance RISKS specific to this vendor, grounded in the reference risks and the vendor's actual situation/signals. Tailor wording to what they do." },
    controls: { kinds: ["control"], shape: `[{"control_name":"...","control_description":"...","control_type":"process|technical|policy","related_four_p_dimension":"<primed|principled|practised|protected>"}]`, instruction: "Propose 6-10 CONTROLS that mitigate this vendor's likely AI-governance risks, grounded in the reference controls. Tailor to what they do." },
    evidence: { kinds: ["control", "questionnaire_qa"], shape: `[{"four_p_dimension":"<primed|principled|practised|protected>","evidence_title":"...","evidence_type":"<one of: ${EVIDENCE_TYPES_SET.join(", ")}>","evidence_summary":"..."}]`, instruction: "Propose the 6-10 EVIDENCE artefacts this vendor needs to clear enterprise security review, grounded in the references and tailored to what they do." },
  };
  const cfg = CFG[target];
  if (!cfg) return json({ error: `Unknown gov_rows target: ${target}` }, 400);

  const archTags = archetypeTags(`${company?.sector || ""} ${company?.subsector || ""} ${company?.notes || ""} ${(signals || []).map((s: any) => s.signal_summary).join(" ")}`);
  const lib = await loadLibrary(supabase, cfg.kinds, archTags);
  const vendorCtx = company
    ? `VENDOR: ${company.company_name} — ${company.sector || ""}/${company.subsector || ""}. ${company.notes || ""}\nPublic signals:\n${(signals || []).map((s: any) => `- ${s.signal_type}: ${s.signal_summary}`).join("\n") || "none"}`
    : `VENDOR: ${client.client_name}`;
  const libCtx = (lib || []).map((l: any) => `- [${l.framework || l.kind}] ${l.title}: ${l.body || ""}`).join("\n");

  const system = `You are a senior AI-governance consultant. Propose structured, tailored items grounded in the 4Ps and the reference library, specific to THIS vendor. Use readiness language; never claim certification. Return ONLY a valid JSON array, no markdown, no code fences.`;
  const user = `${cfg.instruction}\nReturn a JSON array of objects with EXACTLY this shape:\n${cfg.shape}\n\n${vendorCtx}\n\nREFERENCE LIBRARY (tailor, do not copy verbatim):\n${libCtx}\n\n${body.context ? "BUYER CONTEXT:\n" + body.context : ""}`;

  const { content, provider, model } = await callAI(system, user, "google/gemini-2.5-flash");
  let arr: any[] = [];
  try {
    const t = (content || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const a = t.indexOf("["); const b = t.lastIndexOf("]");
    arr = JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t);
  } catch { arr = []; }
  if (!Array.isArray(arr)) arr = [];

  let rows: any[];
  if (target === "risks") {
    rows = arr.slice(0, 12).map((r) => { const l = clamp15(r.likelihood), i = clamp15(r.impact); return {
      client_id, engagement_id, risk_title: String(r.risk_title || "Untitled risk").slice(0, 200),
      risk_description: r.risk_description || null, risk_domain: pick(r.risk_domain, RISK_DOMAINS_SET, "operational"),
      four_p_dimension: pick(r.four_p_dimension, FOUR_PS_SET, "protected"), likelihood: l, impact: i, risk_score: l * i,
      mitigation: r.mitigation || null, owner: "Owner", status: "Open", human_review_required: true, created_by: userId }; });
  } else if (target === "controls") {
    rows = arr.slice(0, 12).map((c) => ({
      client_id, engagement_id, control_name: String(c.control_name || "Untitled control").slice(0, 200),
      control_description: c.control_description || null, control_type: c.control_type || "process",
      related_four_p_dimension: pick(c.related_four_p_dimension, FOUR_PS_SET, "protected"),
      owner: "Owner", implementation_status: "Not Started", evidence_required: true, created_by: userId }));
  } else {
    rows = arr.slice(0, 12).map((e) => ({
      client_id, engagement_id, four_p_dimension: pick(e.four_p_dimension, FOUR_PS_SET, "protected"),
      evidence_title: String(e.evidence_title || "Evidence").slice(0, 200), evidence_type: pick(e.evidence_type, EVIDENCE_TYPES_SET, "procedure"),
      evidence_summary: e.evidence_summary || null, evidence_status: "Missing", created_by: userId }));
  }
  if (!rows.length) return json({ error: "AI returned no items — try again." }, 502);
  const table = target === "risks" ? "aaos_governance_risks" : target === "controls" ? "aaos_controls" : "aaos_evidence_items";
  const { data: inserted, error } = await supabase.from(table).insert(rows).select();
  if (error) throw error;
  await supabase.from("aaos_activity_log").insert({
    entity_type: target, company_id, client_id, action: `${target} generated (AI)`,
    summary: `${rows.length} ${target} proposed for ${client.client_name} (${provider}/${model})`, created_by: userId,
  });
  return json({ ok: true, target, rows: inserted, provider, model });
}

// ===================== SPINE generators (AI: diagnostic, opportunities, stories, KPIs) =====================
const STORY_TYPES_SET = ["discovery", "analysis", "build", "automation", "governance", "reporting", "testing", "data", "client action", "internal action"];
const OWNER_TYPES_SET = ["Human Consultant", "AI Product Owner", "AI Scrum Master", "AI Analyst", "AI Builder", "AI Governance Reviewer", "AI QA Reviewer", "Client Owner"];
const CONF_SET = ["low", "medium", "high"];

function parseArr(content: string): any[] {
  try {
    const t = (content || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const a = t.indexOf("["); const b = t.lastIndexOf("]");
    const r = JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t);
    return Array.isArray(r) ? r : [];
  } catch { return []; }
}

async function handleSpine(supabase: any, userId: string, body: any) {
  const target = body.target;
  const client_id = body.client_id;
  if (!client_id) return json({ error: "client_id is required for spine" }, 400);
  const { data: client } = await supabase.from("aaos_clients").select("*").eq("id", client_id).maybeSingle();
  if (!client) return json({ error: "Client not found" }, 404);
  const engagement_id = body.engagement_id || client.current_engagement_id || null;
  const company_id = client.company_id || null;
  let company: any = null;
  if (company_id) { const { data: c } = await supabase.from("aaos_companies").select("*").eq("id", company_id).maybeSingle(); company = c; }
  const { data: signals } = company_id
    ? await supabase.from("aaos_company_signals").select("signal_type,signal_summary,implication").eq("company_id", company_id)
    : { data: [] };
  const clientCtx = `CLIENT: ${client.client_name}${company ? ` — ${company.sector || ""}/${company.subsector || ""}. ${company.notes || ""}` : ""}\nSignals:\n${(signals || []).map((s: any) => `- ${s.signal_type}: ${s.signal_summary}${s.implication ? ` (=> ${s.implication})` : ""}`).join("\n") || "none recorded"}`;
  const log = (action: string, summary: string, entity_type: string, entity_id?: string) =>
    supabase.from("aaos_activity_log").insert({ entity_type, entity_id, company_id, client_id, action, summary, created_by: userId });

  if (target === "diagnostic") {
    let diagId = body.diagnostic_id;
    if (!diagId) { const { data: d } = await supabase.from("aaos_diagnostics").select("id").eq("client_id", client_id).order("created_at", { ascending: false }).limit(1); diagId = d?.[0]?.id; }
    const system = `You are a senior AI value-creation consultant writing a concise, evidence-led AI Alpha Diagnostic. Honest about assumptions; no guarantees; readiness language. Return ONLY a JSON object.`;
    const user = `Return a JSON object: {"diagnostic_summary":"...","key_findings":"...","top_opportunities_summary":"...","top_risks_summary":"...","recommended_90_day_focus":"...","value_potential_low":number,"value_potential_high":number,"confidence_level":"low|medium|high"}.\n\n${clientCtx}`;
    const { content, provider, model } = await callAI(system, user, "google/gemini-2.5-pro");
    let o: any = {}; try { o = extractJson(content); } catch { o = {}; }
    const fields = {
      diagnostic_summary: o.diagnostic_summary || null, key_findings: o.key_findings || null,
      top_opportunities_summary: o.top_opportunities_summary || null, top_risks_summary: o.top_risks_summary || null,
      recommended_90_day_focus: o.recommended_90_day_focus || null,
      value_potential_low: Number(o.value_potential_low) || null, value_potential_high: Number(o.value_potential_high) || null,
      confidence_level: pick(o.confidence_level, CONF_SET, "medium"), status: "In Progress", human_review_required: true,
    };
    let row;
    if (diagId) { const { data } = await supabase.from("aaos_diagnostics").update(fields).eq("id", diagId).select().single(); row = data; }
    else { const { data } = await supabase.from("aaos_diagnostics").insert({ client_id, engagement_id, diagnostic_name: "AI Alpha Diagnostic", ...fields }).select().single(); row = data; }
    await log("diagnostic generated (AI)", `Diagnostic drafted for ${client.client_name} (${provider}/${model})`, "diagnostic", row?.id);
    return json({ ok: true, target, diagnostic: row, provider, model });
  }

  if (target === "opportunities") {
    const system = `You are a senior AI value-creation consultant. Propose tailored AI value opportunities for this client. Return ONLY a JSON array.`;
    const user = `Return a JSON array (4-6 items): [{"opportunity_title":"...","opportunity_description":"...","business_area":"...","value_type":"cost reduction|time saving|revenue increase|conversion improvement|quality improvement|risk reduction","estimated_monthly_value_low":number,"estimated_monthly_value_high":number,"value_potential_score":1-5,"urgency_score":1-5,"confidence_score":1-5,"strategic_fit_score":1-5,"effort_score":1-5,"risk_score":1-5}].\n\n${clientCtx}`;
    const { content, provider, model } = await callAI(system, user, "google/gemini-2.5-flash");
    const rows = parseArr(content).slice(0, 8).map((o: any) => {
      const v = clamp15(o.value_potential_score), u = clamp15(o.urgency_score), c = clamp15(o.confidence_score), s = clamp15(o.strategic_fit_score), e = clamp15(o.effort_score), r = clamp15(o.risk_score);
      const low = Number(o.estimated_monthly_value_low) || null, high = Number(o.estimated_monthly_value_high) || null;
      return { client_id, engagement_id, diagnostic_id: body.diagnostic_id || null,
        opportunity_title: String(o.opportunity_title || "Opportunity").slice(0, 200), opportunity_description: o.opportunity_description || null,
        business_area: o.business_area || null, value_type: o.value_type || null,
        estimated_monthly_value_low: low, estimated_monthly_value_high: high, estimated_annual_value_low: low ? low * 12 : null, estimated_annual_value_high: high ? high * 12 : null,
        confidence_level: c >= 4 ? "high" : c <= 2 ? "low" : "medium",
        value_potential_score: v, urgency_score: u, confidence_score: c, strategic_fit_score: s, effort_score: e, risk_score: r, priority_score: (v + u + c + s) - (e + r),
        status: "New", created_by: userId };
    });
    if (!rows.length) return json({ error: "AI returned no items — try again." }, 502);
    const { data: inserted, error } = await supabase.from("aaos_ai_opportunities").insert(rows).select();
    if (error) throw error;
    await log("opportunities generated (AI)", `${rows.length} opportunities for ${client.client_name} (${provider}/${model})`, "opportunity");
    return json({ ok: true, target, rows: inserted, provider, model });
  }

  if (target === "sprint_stories") {
    const sprint_id = body.sprint_id; const opportunity_id = body.opportunity_id || null;
    if (!sprint_id) return json({ error: "sprint_id is required" }, 400);
    let opp: any = null;
    if (opportunity_id) { const { data } = await supabase.from("aaos_ai_opportunities").select("*").eq("id", opportunity_id).maybeSingle(); opp = data; }
    const system = `You are an AI delivery lead breaking an opportunity into governed Scrum stories. Return ONLY a JSON array.`;
    const user = `Return a JSON array (4-6 stories): [{"story_title":"...","user_story":"...","story_type":"discovery|analysis|build|automation|governance|reporting|testing|data|client action|internal action","acceptance_criteria":"...","definition_of_done":"...","golden_test":"... or empty","owner_type":"AI Analyst|AI Builder|AI Governance Reviewer|AI QA Reviewer|Human Consultant","points":number,"human_review_required":true or false}]. Governance/reporting/client-facing stories must set human_review_required true with a golden_test.\n\nOPPORTUNITY: ${opp ? opp.opportunity_title + " — " + (opp.opportunity_description || "") : "(general delivery)"}\n${clientCtx}`;
    const { content, provider, model } = await callAI(system, user, "google/gemini-2.5-flash");
    const rows = parseArr(content).slice(0, 8).map((s: any) => ({
      sprint_id, client_id, engagement_id, opportunity_id,
      story_title: String(s.story_title || "Story").slice(0, 200), user_story: s.user_story || null,
      story_type: pick(s.story_type, STORY_TYPES_SET, "build"), acceptance_criteria: s.acceptance_criteria || null,
      definition_of_done: s.definition_of_done || null, golden_test: s.golden_test || null,
      owner_type: pick(s.owner_type, OWNER_TYPES_SET, "AI Analyst"), points: Number(s.points) || null,
      status: "Inbox", human_review_required: !!s.human_review_required,
      review_status: s.human_review_required ? "Needs Human Review" : "Not Required", created_by: userId,
    }));
    if (!rows.length) return json({ error: "AI returned no items — try again." }, 502);
    const { data: inserted, error } = await supabase.from("aaos_stories").insert(rows).select();
    if (error) throw error;
    if (opportunity_id) await supabase.from("aaos_ai_opportunities").update({ status: "Selected for Sprint" }).eq("id", opportunity_id);
    await log("stories generated (AI)", `${rows.length} stories for ${client.client_name} (${provider}/${model})`, "story");
    return json({ ok: true, target, rows: inserted, provider, model });
  }

  if (target === "kpis") {
    const system = `You are a senior value analyst proposing measurable KPIs for this client's AI value work. Return ONLY a JSON array.`;
    const user = `Return a JSON array (3-5 KPIs): [{"kpi_name":"...","kpi_category":"cycle time|conversion|cost|quality|revenue|time saved","unit":"hours|%|£|count","baseline_value":number or null,"target_value":number or null,"confidence_level":"low|medium|high"}].\n\n${clientCtx}`;
    const { content, provider, model } = await callAI(system, user, "google/gemini-2.5-flash");
    const rows = parseArr(content).slice(0, 8).map((k: any) => ({
      client_id, engagement_id, company_id, kpi_name: String(k.kpi_name || "KPI").slice(0, 200), kpi_category: k.kpi_category || null,
      unit: k.unit || null, baseline_value: Number(k.baseline_value) || null, target_value: Number(k.target_value) || null,
      confidence_level: pick(k.confidence_level, CONF_SET, "low"),
    }));
    if (!rows.length) return json({ error: "AI returned no items — try again." }, 502);
    const { data: inserted, error } = await supabase.from("aaos_kpis").insert(rows).select();
    if (error) throw error;
    await log("KPIs generated (AI)", `${rows.length} KPIs for ${client.client_name} (${provider}/${model})`, "kpi");
    return json({ ok: true, target, rows: inserted, provider, model });
  }

  return json({ error: `Unknown spine target: ${target}` }, 400);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // ---- Auth: must be an admin ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No authorization header" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "Authentication failed" }, 401);
    const { data: isAdmin } = await supabase.rpc("is_admin", { _uid: userData.user.id });
    if (!isAdmin) return json({ error: "Admin access required" }, 403);

    const body = await req.json();
    const { type, company_id, route_type } = body;

    if (type === "governance") return await handleGovernance(supabase, userData.user.id, body);
    if (type === "gov_rows") return await handleGovRows(supabase, userData.user.id, body);
    if (type === "spine") return await handleSpine(supabase, userData.user.id, body);

    if (!type || !company_id) return json({ error: "type and company_id are required" }, 400);

    // ---- Load company context ----
    const { data: company, error: cErr } = await supabase
      .from("aaos_companies").select("*").eq("id", company_id).single();
    if (cErr || !company) return json({ error: "Company not found" }, 404);

    const [{ data: signals }, { data: scoreRows }, { data: fourpsRows }, { data: agileRows }] =
      await Promise.all([
        supabase.from("aaos_company_signals").select("*").eq("company_id", company_id),
        supabase.from("aaos_company_scores").select("*").eq("company_id", company_id).order("created_at", { ascending: false }).limit(1),
        supabase.from("aaos_four_ps_scores").select("*").eq("company_id", company_id).order("created_at", { ascending: false }).limit(1),
        supabase.from("aaos_agile_ai_scores").select("*").eq("company_id", company_id).order("created_at", { ascending: false }).limit(1),
      ]);
    const score = scoreRows?.[0];
    const fourps = fourpsRows?.[0];
    const agile = agileRows?.[0];
    const ctx = companyContext(company, signals || [], score, fourps, agile);

    const logActivity = async (action: string, summary: string, entity_id?: string, entity_type?: string) => {
      await supabase.from("aaos_activity_log").insert({
        entity_type, entity_id, company_id, action, summary, created_by: userData.user.id,
      });
    };

    // ===================== ONBOARDING (deterministic) =====================
    if (type === "onboarding") {
      const rows = DEFAULT_ONBOARDING_TASKS.map((t) => ({
        company_id,
        task_title: t,
        status: "todo",
        priority: t.includes("buyer") || t.includes("KPI") ? "high" : "medium",
        owner: "Owner",
      }));
      const { data: inserted, error } = await supabase.from("aaos_onboarding_tasks").insert(rows).select();
      if (error) throw error;
      await logActivity("onboarding pack created", `${rows.length} onboarding tasks created for ${company.company_name}`);
      return json({ ok: true, type, tasks: inserted });
    }

    // ===================== SNAPSHOT (Gemini 2.5 Pro) =====================
    if (type === "snapshot") {
      const system = `You are a senior AI value-creation consultant producing a preliminary external micro-diagnostic. Be specific and evidence-led, but honest about assumptions and never overstate certainty. Do NOT give legal, investment, or compliance advice or guarantee outcomes. Output GitHub-flavoured Markdown only.`;
      const user = `Using ONLY the data below, write an "AI Alpha Opportunity Snapshot" (2-4 pages) with these numbered sections:
1. Executive Summary
2. Why This Company Looks Interesting
3. Public Signals Observed
4. Likely Bottlenecks
5. Top 3 AI Opportunities
6. Estimated Value Range (give ranges, label assumptions)
7. Agile AI Maturity Guess
8. 4Ps Preliminary Governance Snapshot
9. Risks and Assumptions
10. Recommended 30-Day Action
11. Suggested Offer Route (choose from: AI Alpha Diagnostic; 90-Day AI Value Sprint; Operating Partner Subscription; Gain-Share Candidate; Warrant or Equity Candidate; Research More)
12. Suggested Outreach Message (short, specific, no hype)

Begin the document with a blockquote line: "> ${COMPLIANCE_FOOTER}"

${ctx}`;
      const { content: raw, provider, model } = await callAI(system, user, "google/gemini-2.5-pro");
      let content = raw;
      if (!content.includes(COMPLIANCE_FOOTER)) content = `> ${COMPLIANCE_FOOTER}\n\n` + content;
      const { data: inserted, error } = await supabase.from("aaos_snapshots").insert({
        company_id,
        title: `AI Alpha Opportunity Snapshot — ${company.company_name}`,
        generated_content: content,
        generated_at: new Date().toISOString(),
        review_status: "needs human review",
        approved_for_outreach: false,
        old_manual_effort_hours: 4,
        new_ai_assisted_effort_hours: 0.3,
        leverage_factor: 13.3,
        automation_category: "AI-Assisted",
        created_by: userData.user.id,
      }).select().single();
      if (error) throw error;
      await logActivity("snapshot generated", `Snapshot generated for ${company.company_name} (${provider}/${model})`, inserted.id, "snapshot");
      return json({ ok: true, type, snapshot: inserted, provider, model });
    }

    // ===================== OUTREACH (Gemini 2.5 Flash, 5 types) =====================
    if (type === "outreach") {
      const system = `You are a senior consultant writing evidence-led, specific B2B outreach. No hype, no false certainty, no exaggerated claims. Each message must reference: why this company, the specific signal noticed, one concrete opportunity, and a low-friction next step. Return ONLY valid JSON, no markdown, no code fences.`;
      const user = `Produce outreach drafts as JSON with this exact shape:
{
  "short_email": { "subject": "...", "body": "..." },
  "linkedin_connection_note": { "body": "..." },
  "follow_up_email": { "subject": "...", "body": "..." },
  "call_opener": { "body": "..." },
  "meeting_agenda": { "body": "..." }
}
LinkedIn connection note body must be under 300 characters. Keep emails concise.

${ctx}`;
      const { content: raw, provider, model } = await callAI(system, user, "google/gemini-2.5-flash");
      const parsed = extractJson(raw);
      const contactSource = company.source || "Manually entered";
      const lawful = "Lawful basis: legitimate interest (B2B). Source recorded. Suppression honoured; unsubscribe offered on first contact.";
      const mk = (outreach_type: string, subject: string | null, body: string) => ({
        company_id, outreach_type, subject, body,
        review_status: "needs human review", approved_for_use: false,
        contact_source: contactSource, lawful_basis_notes: lawful,
        unsubscribe_required: true, suppression_status: "not suppressed",
        created_by: userData.user.id,
      });
      const rows = [
        mk("short email", parsed.short_email?.subject ?? null, parsed.short_email?.body ?? ""),
        mk("LinkedIn connection note", null, parsed.linkedin_connection_note?.body ?? ""),
        mk("follow-up email", parsed.follow_up_email?.subject ?? null, parsed.follow_up_email?.body ?? ""),
        mk("call opener", null, parsed.call_opener?.body ?? ""),
        mk("meeting agenda", null, parsed.meeting_agenda?.body ?? ""),
      ];
      const { data: inserted, error } = await supabase.from("aaos_outreach_drafts").insert(rows).select();
      if (error) throw error;
      await logActivity("outreach generated", `5 outreach drafts generated for ${company.company_name} (${provider}/${model})`);
      return json({ ok: true, type, drafts: inserted, provider, model });
    }

    // ===================== PROPOSAL ROUTE (Gemini 2.5 Flash) =====================
    if (type === "proposal") {
      const chosenRoute = route_type || company.accepted_offer_route || "AI Alpha Diagnostic";
      const priceHint = OFFER_ROUTES[chosenRoute] || "Human review required";
      const system = `You are a senior consultant preparing an internal proposal route (not yet client-issued). Be specific and evidence-led. Never state final commercial terms as agreed. Return ONLY valid JSON, no markdown, no code fences.`;
      const user = `Produce a proposal route as JSON with this exact shape (all values are strings):
{
  "problem_statement": "...",
  "why_now": "...",
  "evidence_from_signals": "...",
  "proposed_scope": "...",
  "baseline_data_needed": "...",
  "target_kpis": "...",
  "expected_value_range": "...",
  "delivery_plan": "...",
  "governance_wrapper": "..."
}
Route type is "${chosenRoute}". Indicative pricing placeholder is "${priceHint}".
Anchor evidence_from_signals to the actual signals listed. governance_wrapper should reference the 4Ps (Primed, Principled, Practised, Protected).

${ctx}`;
      const { content: raw, provider, model } = await callAI(system, user, "google/gemini-2.5-flash");
      const p = extractJson(raw);
      const { data: inserted, error } = await supabase.from("aaos_proposal_routes").insert({
        company_id,
        route_type: chosenRoute,
        problem_statement: p.problem_statement ?? "",
        why_now: p.why_now ?? "",
        evidence_from_signals: p.evidence_from_signals ?? "",
        proposed_scope: p.proposed_scope ?? "",
        baseline_data_needed: p.baseline_data_needed ?? "",
        target_kpis: p.target_kpis ?? "",
        expected_value_range: p.expected_value_range ?? "",
        delivery_plan: p.delivery_plan ?? "",
        governance_wrapper: p.governance_wrapper ?? "",
        price_placeholder: priceHint,
        next_step: "Review internally, then issue to client after human approval.",
        commercial_terms_warning: "Commercial terms require human review before client issue.",
        review_status: "needs human review",
        human_review_required: true,
        created_by: userData.user.id,
      }).select().single();
      if (error) throw error;
      await logActivity("proposal generated", `Proposal route (${chosenRoute}) generated for ${company.company_name} (${provider}/${model})`, inserted.id, "proposal");
      return json({ ok: true, type, proposal: inserted, provider, model });
    }

    return json({ error: `Unknown type: ${type}` }, 400);
  } catch (e) {
    console.error("[aaos-generate] error", e);
    return json({ error: String(e?.message || e) }, 500);
  }
});
