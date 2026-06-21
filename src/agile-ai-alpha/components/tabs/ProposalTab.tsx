import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, AlertTriangle } from "lucide-react";
import { REVIEW_STATUSES, PROPOSAL_ROUTE_TYPES, PROPOSAL_PRICING, COMMERCIAL_WARNING } from "../../constants";
import { generateProposalRoute } from "../../lib/generation";
import { logActivity } from "../../lib/activity";
import { ReviewStatusBadge, HumanReviewBadge } from "../RagBadge";
import type { TabProps } from "../../pages/AlphaCompanyDetail";
import type { ProposalRoute } from "../../types";

function CopyButton({ text }: { text: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1 text-xs"
      onClick={() => navigator.clipboard.writeText(text).then(() => toast.success("Copied"))}
    >
      <Copy className="h-3.5 w-3.5" />
      Copy
    </Button>
  );
}

interface FieldSectionProps {
  label: string;
  value: string | null | undefined;
}

function FieldSection({ label, value }: FieldSectionProps) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-muted-foreground mb-0.5">{label}</div>
      <div className="whitespace-pre-wrap text-sm">{value}</div>
    </div>
  );
}

function buildCopyText(p: ProposalRoute): string {
  const fields: [string, string | null | undefined][] = [
    ["Route Type", p.route_type],
    ["Problem Statement", p.problem_statement],
    ["Why Now", p.why_now],
    ["Evidence from Signals", p.evidence_from_signals],
    ["Proposed Scope", p.proposed_scope],
    ["Baseline Data Needed", p.baseline_data_needed],
    ["Target KPIs", p.target_kpis],
    ["Expected Value Range", p.expected_value_range],
    ["Delivery Plan", p.delivery_plan],
    ["Governance Wrapper", p.governance_wrapper],
    ["Price Placeholder", p.price_placeholder],
    ["Next Step", p.next_step],
  ];
  return fields
    .filter(([, v]) => v)
    .map(([label, v]) => `${label.toUpperCase()}\n${v}`)
    .join("\n\n");
}

function ProposalCard({
  proposal,
  companyId,
  refetch,
}: {
  proposal: ProposalRoute;
  companyId: string;
  refetch: () => void;
}) {
  const [reviewStatus, setReviewStatus] = useState(proposal.review_status ?? "draft");
  const [saving, setSaving] = useState(false);

  const warning = proposal.commercial_terms_warning || COMMERCIAL_WARNING;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("aaos_proposal_routes")
        .update({ review_status: reviewStatus })
        .eq("id", proposal.id);
      if (error) throw error;
      await logActivity({
        action: "proposal reviewed",
        summary: `Proposal ${proposal.route_type ?? ""} → ${reviewStatus}`,
        company_id: companyId,
        entity_type: "proposal",
        entity_id: proposal.id,
      });
      toast.success("Proposal review saved");
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-sm font-semibold">
              {proposal.route_type ?? "Proposal"}
            </CardTitle>
            <ReviewStatusBadge status={proposal.review_status ?? "draft"} />
            {proposal.review_status === "needs human review" && <HumanReviewBadge />}
            {proposal.human_review_required && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                <AlertTriangle className="h-3 w-3" />
                Human review required
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(proposal.created_at ?? "").toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Commercial warning */}
        <div className="flex items-start gap-2 rounded-md border border-amber-400 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="font-medium">{warning}</span>
        </div>

        {/* Content sections */}
        <div className="space-y-3">
          <FieldSection label="Problem Statement" value={proposal.problem_statement} />
          <FieldSection label="Why Now" value={proposal.why_now} />
          <FieldSection label="Evidence from Signals" value={proposal.evidence_from_signals} />
          <FieldSection label="Proposed Scope" value={proposal.proposed_scope} />
          <FieldSection label="Baseline Data Needed" value={proposal.baseline_data_needed} />
          <FieldSection label="Target KPIs" value={proposal.target_kpis} />
          <FieldSection label="Expected Value Range" value={proposal.expected_value_range} />
          <FieldSection label="Delivery Plan" value={proposal.delivery_plan} />
          <FieldSection label="Governance Wrapper" value={proposal.governance_wrapper} />
          <FieldSection label="Price Placeholder" value={proposal.price_placeholder} />
          <FieldSection label="Next Step" value={proposal.next_step} />
        </div>

        <div className="flex justify-end">
          <CopyButton text={buildCopyText(proposal)} />
        </div>

        {/* Review controls */}
        <div className="space-y-3 border-t pt-3">
          <div className="space-y-1">
            <Label className="text-xs">Review status</Label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
            >
              {REVIEW_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save review"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProposalTab({ companyId, company, refresh }: TabProps) {
  const [generating, setGenerating] = useState(false);
  const [selectedRouteType, setSelectedRouteType] = useState<string>(PROPOSAL_ROUTE_TYPES[0]);

  const { data: proposals = [], refetch } = useQuery({
    queryKey: ["aaos_proposal_routes", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_proposal_routes")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProposalRoute[];
    },
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateProposalRoute(companyId, selectedRouteType);
      toast.success("Proposal route generated");
      refetch();
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const priceHint = PROPOSAL_PRICING[selectedRouteType];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h3 className="font-semibold">Proposal Routes</h3>
      </div>

      {/* Controls row */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1 flex-1 min-w-48">
          <Label className="text-xs">Route type</Label>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={selectedRouteType}
            onChange={(e) => setSelectedRouteType(e.target.value)}
          >
            {PROPOSAL_ROUTE_TYPES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="shrink-0">
          <Sparkles className="h-4 w-4 mr-1.5" />
          {generating ? "Generating…" : "Generate proposal route"}
        </Button>
      </div>

      {/* Price hint */}
      {priceHint && (
        <p className="text-xs text-muted-foreground">
          Indicative price for{" "}
          <span className="font-medium">{selectedRouteType}</span>:{" "}
          <span className="font-semibold">{priceHint}</span>
        </p>
      )}

      {proposals.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No proposal routes yet. Select a route type and click "Generate proposal route".
          </CardContent>
        </Card>
      )}

      {proposals.map((p) => (
        <ProposalCard key={p.id} proposal={p} companyId={companyId} refetch={refetch} />
      ))}
    </div>
  );
}
