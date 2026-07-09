import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlphaLayout } from "../components/AlphaLayout";
import { SectionSwitch, PIPELINE_TABS } from "../components/SectionSwitch";
import { RagBadge, HumanReviewBadge } from "../components/RagBadge";
import { fitBand } from "../lib/scoring";

function Metric({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground/70 mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}

export default function AlphaDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["aaos_dashboard"],
    queryFn: async () => {
      const [companies, scores, snapshots, proposals, onboarding] = await Promise.all([
        supabase.from("aaos_companies").select("*"),
        supabase.from("aaos_company_scores").select("company_id, ai_alpha_fit_score, score_band, created_at").order("created_at", { ascending: false }),
        supabase.from("aaos_snapshots").select("id, company_id, title, review_status").eq("review_status", "needs human review"),
        supabase.from("aaos_proposal_routes").select("id, company_id, route_type, review_status").eq("review_status", "needs human review"),
        supabase.from("aaos_onboarding_tasks").select("id, company_id, task_title, status, due_date").neq("status", "done"),
      ]);
      return {
        companies: companies.data || [],
        scores: scores.data || [],
        snapshots: snapshots.data || [],
        proposals: proposals.data || [],
        onboarding: onboarding.data || [],
      };
    },
  });

  if (isLoading || !data) {
    return <AlphaLayout title="Dashboard"><div className="text-muted-foreground">Loading…</div></AlphaLayout>;
  }

  const { companies, scores, snapshots, proposals, onboarding } = data;
  const nameById = new Map(companies.map((c) => [c.id, c.company_name]));
  const latestScore = new Map<string, number>();
  scores.forEach((s) => { if (s.company_id && !latestScore.has(s.company_id)) latestScore.set(s.company_id, s.ai_alpha_fit_score ?? 0); });

  const scored = companies.map((c) => ({ ...c, fit: latestScore.get(c.id) ?? null }));
  const withScore = scored.filter((c) => c.fit != null);
  const avg = withScore.length ? Math.round(withScore.reduce((a, c) => a + (c.fit || 0), 0) / withScore.length) : 0;
  const priority = withScore.filter((c) => (c.fit || 0) >= 80).length;
  const accepted = companies.filter((c) => c.status === "Accepted" || c.status === "Onboarded" || c.acceptance_decision === "Accept").length;
  const nurture = companies.filter((c) => c.status === "Nurture" || c.acceptance_decision === "Nurture").length;
  const rejected = companies.filter((c) => c.status === "Rejected" || c.acceptance_decision === "Reject").length;

  const top10 = [...withScore].sort((a, b) => (b.fit || 0) - (a.fit || 0)).slice(0, 10);
  const needsDecision = companies.filter((c) => c.human_review_required || (!c.acceptance_decision && ["Snapshot Ready", "Proposal Ready", "Interested"].includes(c.status)));
  const today = new Date().toISOString().slice(0, 10);
  const dueTasks = onboarding.filter((t) => t.due_date && t.due_date <= today);
  const nextActions = companies.filter((c) => c.next_action).sort((a, b) => (a.next_action_due_date || "9999").localeCompare(b.next_action_due_date || "9999")).slice(0, 8);

  return (
    <AlphaLayout title="Dashboard">
      <SectionSwitch items={PIPELINE_TABS} />
      <p className="text-sm text-muted-foreground mb-4">Where to spend the next hour — highest-leverage targets and the decisions waiting on you.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Metric label="Candidate companies" value={companies.length} />
        <Metric label="Priority targets (80+)" value={priority} />
        <Metric label="Accepted" value={accepted} />
        <Metric label="Nurture" value={nurture} />
        <Metric label="Rejected" value={rejected} />
        <Metric label="Avg fit score" value={avg} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Top 10 by AI Alpha Fit Score</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {top10.length === 0 && <p className="text-sm text-muted-foreground">No scored companies yet.</p>}
            {top10.map((c) => {
              const band = fitBand(c.fit || 0);
              return (
                <Link key={c.id} to={`/agile-ai-alpha/companies/${c.id}`} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50">
                  <span className="text-sm font-medium truncate">{c.company_name}</span>
                  <RagBadge rag={band.rag} label={`${c.fit} · ${band.label}`} />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Needs your decision</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {needsDecision.length === 0 && <p className="text-sm text-muted-foreground">Nothing waiting. 👍</p>}
            {needsDecision.slice(0, 10).map((c) => (
              <Link key={c.id} to={`/agile-ai-alpha/companies/${c.id}`} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50">
                <span className="text-sm font-medium truncate">{c.company_name}</span>
                {c.human_review_required ? <HumanReviewBadge /> : <span className="text-xs text-muted-foreground">{c.status}</span>}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Micro-diagnostics to review ({snapshots.length})</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {snapshots.length === 0 && <p className="text-sm text-muted-foreground">No snapshots awaiting review.</p>}
            {snapshots.map((s) => (
              <Link key={s.id} to={`/agile-ai-alpha/companies/${s.company_id}?tab=snapshot`} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50">
                <span className="text-sm truncate">{nameById.get(s.company_id!) || s.title}</span>
                <span className="text-xs text-amber-700">needs review</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Proposals to review ({proposals.length})</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {proposals.length === 0 && <p className="text-sm text-muted-foreground">No proposals awaiting review.</p>}
            {proposals.map((p) => (
              <Link key={p.id} to={`/agile-ai-alpha/companies/${p.company_id}?tab=proposal`} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50">
                <span className="text-sm truncate">{nameById.get(p.company_id!)}</span>
                <span className="text-xs text-muted-foreground">{p.route_type}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Onboarding tasks due ({dueTasks.length})</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {dueTasks.length === 0 && <p className="text-sm text-muted-foreground">Nothing due.</p>}
            {dueTasks.slice(0, 10).map((t) => (
              <Link key={t.id} to={`/agile-ai-alpha/companies/${t.company_id}?tab=onboarding`} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50">
                <span className="text-sm truncate">{t.task_title}</span>
                <span className="text-xs text-muted-foreground">{nameById.get(t.company_id!)}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Upcoming next actions</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {nextActions.length === 0 && <p className="text-sm text-muted-foreground">No next actions set.</p>}
            {nextActions.map((c) => (
              <Link key={c.id} to={`/agile-ai-alpha/companies/${c.id}`} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50">
                <span className="text-sm truncate">{c.next_action}</span>
                <span className="text-xs text-muted-foreground">{c.next_action_due_date || ""} · {c.company_name}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AlphaLayout>
  );
}
