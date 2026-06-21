import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Pencil, ExternalLink } from "lucide-react";
import { AlphaLayout } from "../components/AlphaLayout";
import { CompanyDialog } from "../components/CompanyDialog";
import { ConvertClientBanner } from "../components/ConvertClientBanner";
import type { Company } from "../types";

import { OverviewTab } from "../components/tabs/OverviewTab";
import { SignalsTab } from "../components/tabs/SignalsTab";
import { ScoreTab } from "../components/tabs/ScoreTab";
import { FourPsTab } from "../components/tabs/FourPsTab";
import { AgileTab } from "../components/tabs/AgileTab";
import { SnapshotTab } from "../components/tabs/SnapshotTab";
import { OutreachTab } from "../components/tabs/OutreachTab";
import { ProposalTab } from "../components/tabs/ProposalTab";
import { OnboardingTab } from "../components/tabs/OnboardingTab";
import { ValueLedgerTab } from "../components/tabs/ValueLedgerTab";
import { ActivityTab } from "../components/tabs/ActivityTab";

export interface TabProps { companyId: string; company: Company; refresh: () => void; }

const TABS = [
  { v: "overview", label: "Overview" },
  { v: "signals", label: "Signals" },
  { v: "score", label: "AI Alpha Score" },
  { v: "fourps", label: "4Ps Score" },
  { v: "agile", label: "Agile AI Score" },
  { v: "snapshot", label: "Snapshot" },
  { v: "outreach", label: "Outreach" },
  { v: "proposal", label: "Proposal" },
  { v: "onboarding", label: "Onboarding" },
  { v: "value", label: "Value Ledger" },
  { v: "activity", label: "Activity Log" },
];

export default function AlphaCompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editOpen, setEditOpen] = useState(false);
  const tab = searchParams.get("tab") || "overview";

  const { data: company, isLoading, refetch } = useQuery({
    queryKey: ["aaos_company", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("aaos_companies").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Company;
    },
    enabled: !!id,
  });

  const refresh = () => { refetch(); qc.invalidateQueries({ queryKey: ["aaos_dashboard"] }); };

  if (isLoading || !company) {
    return <AlphaLayout title="Company"><div className="text-muted-foreground">Loading…</div></AlphaLayout>;
  }

  const props: TabProps = { companyId: id!, company, refresh };

  return (
    <AlphaLayout title={company.company_name}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <button onClick={() => navigate("/agile-ai-alpha/companies")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> All companies
          </button>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            {company.company_name}
            {company.website && (
              <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            {[company.sector, company.region, company.company_size_band, company.status].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
      </div>

      <ConvertClientBanner company={company} />

      <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })}>
        <TabsList className="flex flex-wrap h-auto">
          {TABS.map((t) => <TabsTrigger key={t.v} value={t.v}>{t.label}</TabsTrigger>)}
        </TabsList>
        <div className="mt-4">
          <TabsContent value="overview"><OverviewTab {...props} /></TabsContent>
          <TabsContent value="signals"><SignalsTab {...props} /></TabsContent>
          <TabsContent value="score"><ScoreTab {...props} /></TabsContent>
          <TabsContent value="fourps"><FourPsTab {...props} /></TabsContent>
          <TabsContent value="agile"><AgileTab {...props} /></TabsContent>
          <TabsContent value="snapshot"><SnapshotTab {...props} /></TabsContent>
          <TabsContent value="outreach"><OutreachTab {...props} /></TabsContent>
          <TabsContent value="proposal"><ProposalTab {...props} /></TabsContent>
          <TabsContent value="onboarding"><OnboardingTab {...props} /></TabsContent>
          <TabsContent value="value"><ValueLedgerTab {...props} /></TabsContent>
          <TabsContent value="activity"><ActivityTab {...props} /></TabsContent>
        </div>
      </Tabs>

      <CompanyDialog open={editOpen} onOpenChange={setEditOpen} company={company} onSaved={() => refresh()} />
    </AlphaLayout>
  );
}
