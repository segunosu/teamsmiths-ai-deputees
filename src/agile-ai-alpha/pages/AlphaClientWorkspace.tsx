import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AlphaLayout } from "../components/AlphaLayout";
import { StatusPill } from "../components/spineUi";
import type { Client } from "../spineTypes";

import { OverviewSection } from "../components/client/OverviewSection";
import { EngagementsSection } from "../components/client/EngagementsSection";
import { DiagnosticsSection } from "../components/client/DiagnosticsSection";
import { OpportunitiesSection } from "../components/client/OpportunitiesSection";
import { SprintsSection } from "../components/client/SprintsSection";
import { GovernanceSection } from "../components/client/GovernanceSection";
import { EvidenceSection } from "../components/client/EvidenceSection";
import { ArtefactsSection } from "../components/client/ArtefactsSection";
import { KpiValueSection } from "../components/client/KpiValueSection";
import { MonetisationSection } from "../components/client/MonetisationSection";
import { ReportsSection } from "../components/client/ReportsSection";
import { PatternsSection } from "../components/client/PatternsSection";
import { ActivitySection } from "../components/client/ActivitySection";
import { JourneyStepper, NextBestAction, useJourneyProgress } from "../components/client/JourneyRail";

export interface SectionProps { client: Client; refresh: () => void; }

// Journey-grouped tabs: 5 groups mirror the delivery journey; every old ?tab= value
// still resolves (backward-compatible deep links). Sections themselves are untouched.
const GROUPS = [
  { v: "overview", label: "Overview", subs: [
    { v: "overview", label: "Snapshot" },
    { v: "activity", label: "Activity" },
  ]},
  { v: "diagnose", label: "Diagnose", subs: [
    { v: "diagnostic", label: "Diagnostic" },
    { v: "opportunities", label: "Opportunities" },
    { v: "patterns", label: "Patterns" },
  ]},
  { v: "deliver", label: "Deliver", subs: [
    { v: "engagements", label: "Engagements" },
    { v: "sprints", label: "Sprint board" },
  ]},
  { v: "governance", label: "Governance", subs: [
    { v: "governance", label: "Risks & controls" },
    { v: "evidence", label: "Evidence" },
    { v: "artefacts", label: "Artefacts" },
  ]},
  { v: "value", label: "Value", subs: [
    { v: "value", label: "KPIs & value" },
    { v: "monetisation", label: "Monetisation" },
    { v: "reports", label: "Reports" },
  ]},
] as const;

type SubValue = (typeof GROUPS)[number]["subs"][number]["v"];

function groupOf(sub: string) {
  return GROUPS.find((g) => g.subs.some((s) => s.v === sub)) ?? GROUPS[0];
}

export default function AlphaClientWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "overview";

  const { data: client, isLoading, refetch } = useQuery({
    queryKey: ["aaos_client", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("aaos_clients").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Client;
    },
    enabled: !!id,
  });

  const refresh = () => { refetch(); qc.invalidateQueries({ queryKey: ["aaos_command_centre"] }); qc.invalidateQueries({ queryKey: ["aaos_journey", id] }); };

  const { data: progress } = useJourneyProgress(id);

  if (isLoading || !client) return <AlphaLayout title="Client"><div className="text-muted-foreground">Loading…</div></AlphaLayout>;
  const props: SectionProps = { client, refresh };
  const activeGroup = groupOf(tab);
  const goTab = (v: string) => setParams({ tab: v });

  return (
    <AlphaLayout title={client.client_name}>
      <div className="mb-4">
        <button onClick={() => navigate("/agile-ai-alpha/clients")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1">
          <ArrowLeft className="h-3.5 w-3.5" /> All clients
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold">{client.client_name}</h2>
          <StatusPill status={client.status} />
          {client.company_id && (
            <Link to={`/agile-ai-alpha/companies/${client.company_id}`} className="text-sm text-primary hover:underline flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" /> source prospect
            </Link>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{[client.sector, client.region].filter(Boolean).join(" · ")}</p>
      </div>

      <JourneyStepper progress={progress} onGo={goTab} />
      <NextBestAction progress={progress} onGo={goTab} />

      <Tabs value={activeGroup.v} onValueChange={(g) => { const grp = GROUPS.find((x) => x.v === g); if (grp) goTab(grp.subs[0].v); }}>
        <TabsList className="flex flex-wrap h-auto">
          {GROUPS.map((g) => <TabsTrigger key={g.v} value={g.v}>{g.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      {activeGroup.subs.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeGroup.subs.map((sub) => (
            <button
              key={sub.v}
              onClick={() => goTab(sub.v)}
              className={
                tab === sub.v
                  ? "rounded-full border border-primary bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary"
                  : "rounded-full border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
      <Tabs value={tab}>
        <div className="mt-4">
          <TabsContent value="overview"><OverviewSection {...props} /></TabsContent>
          <TabsContent value="engagements"><EngagementsSection {...props} /></TabsContent>
          <TabsContent value="diagnostic"><DiagnosticsSection {...props} /></TabsContent>
          <TabsContent value="opportunities"><OpportunitiesSection {...props} /></TabsContent>
          <TabsContent value="sprints"><SprintsSection {...props} /></TabsContent>
          <TabsContent value="governance"><GovernanceSection {...props} /></TabsContent>
          <TabsContent value="evidence"><EvidenceSection {...props} /></TabsContent>
          <TabsContent value="artefacts"><ArtefactsSection {...props} /></TabsContent>
          <TabsContent value="value"><KpiValueSection {...props} /></TabsContent>
          <TabsContent value="monetisation"><MonetisationSection {...props} /></TabsContent>
          <TabsContent value="reports"><ReportsSection {...props} /></TabsContent>
          <TabsContent value="patterns"><PatternsSection {...props} /></TabsContent>
          <TabsContent value="activity"><ActivitySection {...props} /></TabsContent>
        </div>
      </Tabs>
    </AlphaLayout>
  );
}
