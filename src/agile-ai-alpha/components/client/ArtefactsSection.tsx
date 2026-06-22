import { useState } from "react";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { GenerateButton } from "../spineUi";
import { ReviewStatusBadge, HumanReviewBadge } from "../RagBadge";
import { generateGovernance } from "../../lib/generation";
import { REVIEW_STATUSES } from "../../constants";

const ARTIFACTS = [
  { v: "gap_memo", label: "Stuck-Deal Review — gap memo" },
  { v: "questionnaire_answers", label: "Security questionnaire answers" },
  { v: "risk_register", label: "AI risk register" },
  { v: "policy", label: "AI governance policy" },
  { v: "model_cards", label: "Model card(s)" },
  { v: "incident_playbook", label: "Incident response playbook" },
  { v: "attestation", label: "Attestation summary" },
];

// Client-scoped governance artefact generation — only THIS client's artefacts.
export function ArtefactsSection({ client }: SectionProps) {
  const [artifact, setArtifact] = useState("gap_memo");
  const [context, setContext] = useState("");

  const { data: artifacts, refetch } = useQuery({
    queryKey: ["aaos_gov_artifacts_client", client.id],
    queryFn: async () => {
      const { data } = await supabase.from("aaos_gov_artifacts").select("*").eq("client_id", client.id).order("created_at", { ascending: false });
      return data || [];
    },
  });

  const updateReview = async (id: string, status: string) => {
    await supabase.from("aaos_gov_artifacts").update({ review_status: status }).eq("id", id);
    refetch();
  };
  const copy = (t: string) => navigator.clipboard.writeText(t).then(() => toast.success("Copied"));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Generate governance artefact (AI)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Library-grounded and tailored to {client.client_name}. This is the engine behind the £1,500 Stuck-Deal Review and the £9,500 pack. Drafts require human review.</p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <Label className="text-xs">Artefact</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={artifact} onChange={(e) => setArtifact(e.target.value)}>
                {ARTIFACTS.map((a) => <option key={a.v} value={a.v}>{a.label}</option>)}
              </select>
            </div>
            <GenerateButton label="Generate with AI" onRun={() => generateGovernance({ artifact, clientId: client.id, context })} onDone={() => refetch()} />
          </div>
          <div>
            <Label className="text-xs">Buyer security questionnaire / context (optional — paste for a tailored draft)</Label>
            <Textarea rows={4} placeholder="Paste the enterprise buyer's security/AI questionnaire here for a tailored gap memo or answer set. Leave blank to draft from this client's stored data + the library." value={context} onChange={(e) => setContext(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {(artifacts || []).length === 0 && <p className="text-sm text-muted-foreground">No artefacts yet. Generate one above.</p>}
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
  );
}
