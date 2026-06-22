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
  const { data: lib } = await supabase.from("aaos_library").select("kind,title,framework,question,body").in("kind", cfg.kinds).limit(40);

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
