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
import { KpiValueSection } from "../components/client/KpiValueSection";
import { MonetisationSection } from "../components/client/MonetisationSection";
import { ReportsSection } from "../components/client/ReportsSection";
import { PatternsSection } from "../components/client/PatternsSection";
import { ActivitySection } from "../components/client/ActivitySection";

export interface SectionProps { client: Client; refresh: () => void; }

const TABS = [
  { v: "overview", label: "Overview" },
  { v: "engagements", label: "Engagements" },
  { v: "diagnostic", label: "Diagnostic" },
  { v: "opportunities", label: "Opportunities" },
  { v: "sprints", label: "Sprint Board" },
  { v: "governance", label: "Governance" },
  { v: "evidence", label: "Evidence" },
  { v: "value", label: "KPIs & Value" },
  { v: "monetisation", label: "Monetisation" },
  { v: "reports", label: "Reports" },
  { v: "patterns", label: "Patterns" },
  { v: "activity", label: "Activity" },
];

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

  const refresh = () => { refetch(); qc.invalidateQueries({ queryKey: ["aaos_command_centre"] }); };

  if (isLoading || !client) return <AlphaLayout title="Client"><div className="text-muted-foreground">Loading…</div></AlphaLayout>;
  const props: SectionProps = { client, refresh };

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

      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })}>
        <TabsList className="flex flex-wrap h-auto">
          {TABS.map((t) => <TabsTrigger key={t.v} value={t.v}>{t.label}</TabsTrigger>)}
        </TabsList>
        <div className="mt-4">
          <TabsContent value="overview"><OverviewSection {...props} /></TabsContent>
          <TabsContent value="engagements"><EngagementsSection {...props} /></TabsContent>
          <TabsContent value="diagnostic"><DiagnosticsSection {...props} /></TabsContent>
          <TabsContent value="opportunities"><OpportunitiesSection {...props} /></TabsContent>
          <TabsContent value="sprints"><SprintsSection {...props} /></TabsContent>
          <TabsContent value="governance"><GovernanceSection {...props} /></TabsContent>
          <TabsContent value="evidence"><EvidenceSection {...props} /></TabsContent>
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
