import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, Library as LibraryIcon, Sparkles } from "lucide-react";
import { AlphaLayout } from "../components/AlphaLayout";
import { GenerateButton } from "../components/spineUi";
import { ReviewStatusBadge, HumanReviewBadge } from "../components/RagBadge";
import { generateGovernance } from "../lib/generation";
import { REVIEW_STATUSES } from "../constants";

const ARTIFACTS = [
  { v: "gap_memo", label: "Stuck-Deal Review — gap memo" },
  { v: "questionnaire_answers", label: "Security questionnaire answers" },
  { v: "risk_register", label: "AI risk register" },
  { v: "policy", label: "AI governance policy" },
  { v: "model_cards", label: "Model card(s)" },
  { v: "incident_playbook", label: "Incident response playbook" },
  { v: "attestation", label: "Attestation summary" },
];

function copy(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success("Copied"));
}

function Studio() {
  const qc = useQueryClient();
  const [companyId, setCompanyId] = useState("");
  const [artifact, setArtifact] = useState("gap_memo");
  const [context, setContext] = useState("");

  const { data: companies } = useQuery({
    queryKey: ["aaos_gov_companies"],
    queryFn: async () => {
      const { data } = await supabase.from("aaos_companies").select("id, company_name").order("company_name");
      return data || [];
    },
  });

  const { data: artifacts, refetch } = useQuery({
    queryKey: ["aaos_gov_artifacts", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("aaos_gov_artifacts").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!companyId,
  });

  const updateReview = async (id: string, status: string) => {
    await supabase.from("aaos_gov_artifacts").update({ review_status: status }).eq("id", id);
    refetch();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4" /> Generate governance artefact</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Vendor / company</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                <option value="">— select company —</option>
                {(companies || []).map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Artefact</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={artifact} onChange={(e) => setArtifact(e.target.value)}>
                {ARTIFACTS.map((a) => <option key={a.v} value={a.v}>{a.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Buyer security questionnaire / context (optional — paste here for a tailored draft)</Label>
            <Textarea rows={5} placeholder="Paste the enterprise buyer's security/AI questionnaire, or any vendor specifics. Leave blank to draft from the company's stored data + the library." value={context} onChange={(e) => setContext(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <GenerateButton
              label="Generate with AI"
              onRun={async () => {
                if (!companyId) { throw new Error("Select a company first"); }
                return generateGovernance({ artifact, companyId, context });
              }}
              onDone={() => refetch()}
            />
            <span className="text-xs text-muted-foreground">Grounded in the vendor's data, signals and your reusable library. Drafts require human review.</span>
          </div>
        </CardContent>
      </Card>

      {!!companyId && (
        <div className="space-y-3">
          {(artifacts || []).length === 0 && <p className="text-sm text-muted-foreground">No artefacts yet for this company. Generate one above.</p>}
          {(artifacts || []).map((a: any) => (
            <Card key={a.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex flex-wrap items-center justify-between gap-2">
                  <span>{a.title}</span>
                  <div className="flex items-center gap-2">
                    <ReviewStatusBadge status={a.review_status} />
                    {a.human_review_required && a.review_status !== "approved" && <HumanReviewBadge />}
                    <Button size="sm" variant="outline" onClick={() => copy(a.content || "")}><Copy className="h-3.5 w-3.5 mr-1" /> Copy</Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-muted-foreground">{a.artifact_type} · {a.provider || ""}/{a.model || ""} · {new Date(a.created_at).toLocaleString()}</div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm max-h-[28rem] overflow-y-auto">{a.content}</div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Review:</Label>
                  <select className="h-9 rounded-md border bg-background px-2 text-sm" value={a.review_status} onChange={(e) => updateReview(a.id, e.target.value)}>
                    {REVIEW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function LibraryBrowser() {
  const [q, setQ] = useState("");
  const { data: items } = useQuery({
    queryKey: ["aaos_library"],
    queryFn: async () => {
      const { data } = await supabase.from("aaos_library").select("*").order("kind");
      return data || [];
    },
  });

  const filtered = (items || []).filter((i: any) =>
    !q || `${i.title} ${i.question || ""} ${i.body || ""} ${i.framework || ""}`.toLowerCase().includes(q.toLowerCase()),
  );
  const groups = filtered.reduce((acc: Record<string, any[]>, i: any) => {
    (acc[i.kind] = acc[i.kind] || []).push(i);
    return acc;
  }, {});

  const KIND_LABELS: Record<string, string> = {
    questionnaire_qa: "Security questionnaire answers", risk: "Risks", control: "Controls",
    policy: "Policy", model_card_template: "Model card template", incident_playbook: "Incident playbook",
    attestation_template: "Attestation template", playbook: "Playbooks", prompt: "Prompts",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Reusable, framework-mapped building blocks. Generation tailors these per vendor so you assemble, not author.</p>
        <Input className="max-w-xs" placeholder="Search the library…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {Object.keys(groups).length === 0 && <p className="text-sm text-muted-foreground">No matching items.</p>}
      {Object.entries(groups).map(([kind, rows]) => (
        <Card key={kind}>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><LibraryIcon className="h-4 w-4" /> {KIND_LABELS[kind] || kind} <span className="text-muted-foreground font-normal">({rows.length})</span></CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {rows.map((i: any) => (
              <div key={i.id} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {i.framework && <span className="text-xs rounded-full border px-2 py-0.5 bg-muted">{i.framework}</span>}
                  {i.four_p_dimension && <span className="text-xs rounded-full border px-2 py-0.5">{i.four_p_dimension}</span>}
                  <span className="text-sm font-medium">{i.question || i.title}</span>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{i.body}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AlphaGovernance() {
  return (
    <AlphaLayout title="Governance">
      <h2 className="text-xl font-semibold mb-1">Governance Studio</h2>
      <p className="text-sm text-muted-foreground mb-4">AI-drafted, library-grounded governance artefacts — the engine behind the £1,500 Stuck-Deal Review and the £9,500 pack.</p>
      <Tabs defaultValue="studio">
        <TabsList>
          <TabsTrigger value="studio">Studio</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="studio"><Studio /></TabsContent>
          <TabsContent value="library"><LibraryBrowser /></TabsContent>
        </div>
      </Tabs>
    </AlphaLayout>
  );
}
