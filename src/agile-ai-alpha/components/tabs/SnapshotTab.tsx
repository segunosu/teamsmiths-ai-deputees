import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { REVIEW_STATUSES, COMPLIANCE_FOOTER } from "../../constants";
import { generateSnapshot } from "../../lib/generation";
import { logActivity } from "../../lib/activity";
import { ReviewStatusBadge, HumanReviewBadge } from "../RagBadge";
import type { TabProps } from "../../pages/AlphaCompanyDetail";
import type { Snapshot } from "../../types";

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

function SnapshotCard({
  snapshot,
  isLatest,
  companyId,
  refetch,
  refresh,
}: {
  snapshot: Snapshot;
  isLatest: boolean;
  companyId: string;
  refetch: () => void;
  refresh: () => void;
}) {
  const [expanded, setExpanded] = useState(isLatest);
  const [reviewStatus, setReviewStatus] = useState(snapshot.review_status ?? "draft");
  const [reviewerNotes, setReviewerNotes] = useState(snapshot.reviewer_notes ?? "");
  const [approvedForOutreach, setApprovedForOutreach] = useState(
    snapshot.approved_for_outreach ?? false,
  );
  const [saving, setSaving] = useState(false);

  const leverageText = (() => {
    const old = snapshot.old_manual_effort_hours;
    const nw = snapshot.new_ai_assisted_effort_hours;
    const lf = snapshot.leverage_factor;
    if (!old && !nw) return null;
    const parts: string[] = [];
    if (old != null) parts.push(`Manual ~${old}h`);
    if (nw != null) parts.push(`AI-assisted ~${nw}h`);
    if (lf != null) parts.push(`×${lf} leverage`);
    if (snapshot.automation_category) parts.push(snapshot.automation_category);
    return parts.join(" · ");
  })();

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("aaos_snapshots")
        .update({
          review_status: reviewStatus,
          reviewer_notes: reviewerNotes || null,
          approved_for_outreach: approvedForOutreach,
        })
        .eq("id", snapshot.id);
      if (error) throw error;
      await logActivity({
        action: "snapshot reviewed",
        summary: `Snapshot → ${reviewStatus}`,
        company_id: companyId,
        entity_type: "snapshot",
        entity_id: snapshot.id,
      });
      toast.success("Snapshot review saved");
      refetch();
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className={isLatest ? "border-primary/40" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 font-semibold text-sm hover:text-primary"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {snapshot.title ?? "Snapshot"}
            </button>
            <ReviewStatusBadge status={snapshot.review_status ?? "draft"} />
            {snapshot.review_status === "needs human review" && <HumanReviewBadge />}
            {isLatest && (
              <span className="text-xs text-muted-foreground font-normal">Latest</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {snapshot.generated_at
              ? new Date(snapshot.generated_at).toLocaleDateString()
              : new Date(snapshot.created_at ?? "").toLocaleDateString()}
          </span>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Generated content */}
          {snapshot.generated_content && (
            <div className="relative">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md bg-muted/40 p-4 text-sm leading-relaxed">
                {snapshot.generated_content}
              </div>
              <div className="mt-1 flex justify-end">
                <CopyButton text={snapshot.generated_content} />
              </div>
            </div>
          )}

          {/* Leverage line */}
          {leverageText && (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              {leverageText}
            </div>
          )}

          {/* Review controls (only shown on latest) */}
          {isLatest && (
            <div className="space-y-3 border-t pt-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={approvedForOutreach}
                      onChange={(e) => setApprovedForOutreach(e.target.checked)}
                      className="h-4 w-4 rounded border"
                    />
                    Approved for outreach
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Reviewer notes</Label>
                <Textarea
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Internal notes…"
                  rows={3}
                />
              </div>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save review"}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function SnapshotTab({ companyId, company, refresh }: TabProps) {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: snapshots = [], refetch } = useQuery({
    queryKey: ["aaos_snapshots", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_snapshots")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Snapshot[];
    },
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateSnapshot(companyId);
      toast.success("Snapshot generated");
      refetch();
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">AI Alpha Opportunity Snapshot</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Uses AI to generate a structured opportunity snapshot. Takes ~10–20 seconds.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="shrink-0">
          <Sparkles className="h-4 w-4 mr-1.5" />
          {generating ? "Generating…" : "Generate snapshot"}
        </Button>
      </div>

      {snapshots.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No snapshots yet. Click "Generate snapshot" to create one.
          </CardContent>
        </Card>
      )}

      {snapshots.map((s, i) => (
        <SnapshotCard
          key={s.id}
          snapshot={s}
          isLatest={i === 0}
          companyId={companyId}
          refetch={refetch}
          refresh={refresh}
        />
      ))}

      <p className="text-xs text-muted-foreground italic">{COMPLIANCE_FOOTER}</p>
    </div>
  );
}
