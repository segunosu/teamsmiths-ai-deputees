import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlphaLayout } from "../components/AlphaLayout";
import { RagBadge } from "../components/RagBadge";
import { priorityRag, riskRag } from "../lib/spineScoring";

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
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

function WidgetCard({ title, children, count }: { title: string; children: React.ReactNode; count?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          {title}{count != null ? ` (${count})` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0.5">{children}</CardContent>
    </Card>
  );
}

function WidgetRow({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50 text-sm"
    >
      {children}
    </Link>
  );
}

export default function AlphaCommandCentre() {
  const { data, isLoading } = useQuery({
    queryKey: ["aaos_command_centre"],
    queryFn: async () => {
      const [
        companiesRes, clientsRes, engagementsRes, oppsRes,
        storiesRes, risksRes, evidenceRes, kpisRes,
        vledgerRes, monetRes, reportsRes, patternsRes,
        scoresRes, snapsRes, sprintsRes,
      ] = await Promise.all([
        supabase.from("aaos_companies").select("id, company_name, status"),
        supabase.from("aaos_clients").select("id, client_name, company_id, status"),
        supabase.from("aaos_engagements").select("id, status"),
        supabase.from("aaos_ai_opportunities").select("id, client_id, opportunity_title, priority_score, status"),
        supabase.from("aaos_stories").select("id, client_id, story_title, status, review_status, human_review_required"),
        supabase.from("aaos_governance_risks").select("id, client_id, risk_title, risk_score, status"),
        supabase.from("aaos_evidence_items").select("id, evidence_status"),
        supabase.from("aaos_kpis").select("id, actual_date, actual_value"),
        supabase.from("aaos_value_ledger").select("id, financial_value_low, financial_value_high, client_agreed"),
        supabase.from("aaos_monetisation_records").select("id, client_id, trigger_status"),
        supabase.from("aaos_reports").select("id, client_id, title, review_status"),
        supabase.from("aaos_portfolio_patterns").select("id"),
        supabase.from("aaos_company_scores").select("old_manual_effort_hours, new_ai_assisted_effort_hours"),
        supabase.from("aaos_snapshots").select("old_manual_effort_hours, new_ai_assisted_effort_hours"),
        supabase.from("aaos_sprints").select("ai_points_completed, human_points_completed, status, blockers"),
      ]);

      return {
        companies: companiesRes.data || [],
        clients: clientsRes.data || [],
        engagements: engagementsRes.data || [],
        opps: oppsRes.data || [],
        stories: storiesRes.data || [],
        risks: risksRes.data || [],
        evidence: evidenceRes.data || [],
        kpis: kpisRes.data || [],
        vledger: vledgerRes.data || [],
        monet: monetRes.data || [],
        reports: reportsRes.data || [],
        patterns: patternsRes.data || [],
        scores: scoresRes.data || [],
        snaps: snapsRes.data || [],
        sprints: sprintsRes.data || [],
      };
    },
  });

  if (isLoading || !data) {
    return (
      <AlphaLayout title="Command Centre">
        <div className="text-muted-foreground">Loading…</div>
      </AlphaLayout>
    );
  }

  const {
    companies, clients, engagements, opps, stories, risks,
    evidence, kpis, vledger, monet, reports, patterns, scores, snaps, sprints,
  } = data;

  // ── Metrics ──
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const activeEngagements = engagements.filter((e) => e.status === "Active").length;

  const valueCreatedLow = vledger.reduce((a, v) => a + (Number(v.financial_value_low) || 0), 0);
  const valueCreatedHigh = vledger.reduce((a, v) => a + (Number(v.financial_value_high) || 0), 0);
  const valueStr =
    valueCreatedLow === 0 && valueCreatedHigh === 0
      ? "£0"
      : `£${(valueCreatedLow / 1000).toFixed(0)}k–£${(valueCreatedHigh / 1000).toFixed(0)}k`;

  const monetTriggers = monet.filter(
    (m) => m.trigger_status === "Triggered" || m.trigger_status === "Human Review Required"
  ).length;

  // Leverage factor
  const totalOld =
    scores.reduce((a, s) => a + (Number(s.old_manual_effort_hours) || 0), 0) +
    snaps.reduce((a, s) => a + (Number(s.old_manual_effort_hours) || 0), 0);
  const totalNew =
    scores.reduce((a, s) => a + (Number(s.new_ai_assisted_effort_hours) || 0), 0) +
    snaps.reduce((a, s) => a + (Number(s.new_ai_assisted_effort_hours) || 0), 0);
  const leverageFactor = totalNew > 0 ? Math.round((totalOld / totalNew) * 10) / 10 : 0;

  // ── Widget data ──

  // 1. Accepted prospects to convert (companies accepted/onboarded but not yet a client)
  const clientCompanyIds = new Set(clients.map((c) => c.company_id).filter(Boolean));
  const prospectsToConvert = companies.filter(
    (co) =>
      (co.status === "Accepted" || co.status === "Onboarded") &&
      !clientCompanyIds.has(co.id)
  );

  // 2. Top opportunities by priority_score
  const topOpps = [...opps]
    .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
    .slice(0, 8);

  // 3. Stories needing review
  const storiesNeedingReview = stories.filter(
    (s) =>
      s.review_status === "Needs Human Review" ||
      (s.human_review_required && s.review_status !== "Approved" && s.status !== "Done")
  );

  // 4. Top governance risks (not closed, sorted by risk_score desc)
  const topRisks = [...risks]
    .filter((r) => r.status !== "Closed")
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
    .slice(0, 8);

  // 5. Missing evidence count
  const missingEvidence = evidence.filter((e) => e.evidence_status === "Missing").length;

  // 6. Sprints at risk (Active + has blockers)
  const sprintsAtRisk = sprints.filter(
    (s) => s.status === "Active" && s.blockers && String(s.blockers).trim() !== ""
  ).length;

  // 7. Reports to review
  const reportsToReview = reports.filter((r) => r.review_status === "Needs Human Review");

  // 8. Monetisation triggers
  const monetTriggerRecords = monet.filter(
    (m) => m.trigger_status === "Triggered" || m.trigger_status === "Human Review Required"
  );

  // 9. KPI movement this month (within last 31 days)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 31);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  const recentKpis = kpis.filter((k) => k.actual_date && k.actual_date >= cutoffISO && k.actual_value != null).length;

  // Client name lookup
  const clientNameById = new Map(clients.map((c) => [c.id, c.client_name]));

  return (
    <AlphaLayout title="Command Centre">
      <p className="text-sm text-muted-foreground mb-6">
        Where to spend the next hour. A senior consultant should know what to do next in 60 seconds.
      </p>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <MetricCard label="Active clients" value={activeClients} />
        <MetricCard label="Active engagements" value={activeEngagements} />
        <MetricCard label="Value created" value={valueStr} hint="across value ledger" />
        <MetricCard label="Monetisation triggers" value={monetTriggers} hint="triggered or needs review" />
        <MetricCard
          label="Consultant leverage"
          value={leverageFactor > 0 ? `×${leverageFactor}` : "—"}
          hint="old hours ÷ new AI-assisted hours"
        />
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* 1. Prospects to convert */}
        <WidgetCard title="Accepted prospects to convert" count={prospectsToConvert.length}>
          {prospectsToConvert.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-1">All accepted prospects have been converted.</p>
          )}
          {prospectsToConvert.map((co) => (
            <WidgetRow key={co.id} to={`/agile-ai-alpha/companies/${co.id}`}>
              <span className="truncate">{co.company_name}</span>
              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{co.status}</span>
            </WidgetRow>
          ))}
        </WidgetCard>

        {/* 2. Top opportunities */}
        <WidgetCard title="Top opportunities" count={topOpps.length}>
          {topOpps.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-1">No opportunities yet.</p>
          )}
          {topOpps.map((o) => (
            <WidgetRow key={o.id} to={`/agile-ai-alpha/clients/${o.client_id}?tab=opportunities`}>
              <span className="truncate text-sm">{o.opportunity_title}</span>
              <RagBadge
                rag={priorityRag(o.priority_score || 0)}
                label={`P${o.priority_score ?? "?"}`}
              />
            </WidgetRow>
          ))}
        </WidgetCard>

        {/* 3. Stories needing review */}
        <WidgetCard title="Stories needing review" count={storiesNeedingReview.length}>
          {storiesNeedingReview.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-1">No stories awaiting review.</p>
          )}
          {storiesNeedingReview.slice(0, 8).map((s) => (
            <WidgetRow key={s.id} to={`/agile-ai-alpha/clients/${s.client_id}?tab=sprints`}>
              <span className="truncate text-sm">{s.story_title}</span>
              <span className="text-xs text-amber-700 ml-2 flex-shrink-0">{s.review_status}</span>
            </WidgetRow>
          ))}
        </WidgetCard>

        {/* 4. Top governance risks */}
        <WidgetCard title="Top governance risks" count={topRisks.length}>
          {topRisks.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-1">No open risks.</p>
          )}
          {topRisks.map((r) => (
            <WidgetRow key={r.id} to={`/agile-ai-alpha/clients/${r.client_id}?tab=governance`}>
              <span className="truncate text-sm">{r.risk_title}</span>
              <RagBadge rag={riskRag(r.risk_score || 0)} label={`${r.risk_score ?? "?"}`} />
            </WidgetRow>
          ))}
        </WidgetCard>

        {/* 5. Missing evidence */}
        <WidgetCard title="Missing evidence">
          <div className="px-2 py-2">
            {missingEvidence === 0 ? (
              <p className="text-xs text-muted-foreground">No missing evidence items.</p>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-600">{missingEvidence}</span>
                <div>
                  <p className="text-xs text-muted-foreground">evidence items marked Missing</p>
                  <Link to="/agile-ai-alpha/clients" className="text-xs text-primary hover:underline">
                    View clients →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </WidgetCard>

        {/* 6. Sprints at risk */}
        <WidgetCard title="Sprints at risk">
          <div className="px-2 py-2">
            {sprintsAtRisk === 0 ? (
              <p className="text-xs text-muted-foreground">No active sprints with blockers.</p>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-amber-600">{sprintsAtRisk}</span>
                <div>
                  <p className="text-xs text-muted-foreground">active sprint{sprintsAtRisk !== 1 ? "s" : ""} with blockers</p>
                  <Link to="/agile-ai-alpha/clients" className="text-xs text-primary hover:underline">
                    View clients →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </WidgetCard>

        {/* 7. Reports to review */}
        <WidgetCard title="Reports to review" count={reportsToReview.length}>
          {reportsToReview.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-1">No reports awaiting review.</p>
          )}
          {reportsToReview.slice(0, 8).map((r) => (
            <WidgetRow key={r.id} to={`/agile-ai-alpha/clients/${r.client_id}?tab=reports`}>
              <span className="truncate text-sm">{r.title}</span>
              <span className="text-xs text-amber-700 ml-2 flex-shrink-0">needs review</span>
            </WidgetRow>
          ))}
        </WidgetCard>

        {/* 8. Monetisation triggers */}
        <WidgetCard title="Monetisation triggers" count={monetTriggerRecords.length}>
          {monetTriggerRecords.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-1">No active monetisation triggers.</p>
          )}
          {monetTriggerRecords.slice(0, 8).map((m) => (
            <WidgetRow key={m.id} to={`/agile-ai-alpha/clients/${m.client_id}?tab=monetisation`}>
              <span className="truncate text-sm">
                {clientNameById.get(m.client_id!) || m.client_id}
              </span>
              <span className="text-xs text-amber-700 ml-2 flex-shrink-0">{m.trigger_status}</span>
            </WidgetRow>
          ))}
        </WidgetCard>

        {/* 9. KPI movement this month */}
        <WidgetCard title="KPI movement this month">
          <div className="px-2 py-2">
            {recentKpis === 0 ? (
              <p className="text-xs text-muted-foreground">No KPI actuals recorded in the last 31 days.</p>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-green-700">{recentKpis}</span>
                <div>
                  <p className="text-xs text-muted-foreground">KPI actual{recentKpis !== 1 ? "s" : ""} recorded in the last 31 days</p>
                  <Link to="/agile-ai-alpha/clients" className="text-xs text-primary hover:underline">
                    View clients →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </WidgetCard>

        {/* 10. Portfolio patterns */}
        <WidgetCard title="Portfolio patterns captured">
          <div className="px-2 py-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">{patterns.length}</span>
              <div>
                <p className="text-xs text-muted-foreground">anonymised patterns captured</p>
                <Link to="/agile-ai-alpha/portfolio" className="text-xs text-primary hover:underline">
                  View portfolio →
                </Link>
              </div>
            </div>
          </div>
        </WidgetCard>

      </div>
    </AlphaLayout>
  );
}
