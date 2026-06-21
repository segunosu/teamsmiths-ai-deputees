import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, Trash2, AlertTriangle } from "lucide-react";
import { REVIEW_STATUSES } from "../../constants";
import { generateOutreach } from "../../lib/generation";
import { logActivity } from "../../lib/activity";
import { ReviewStatusBadge, HumanReviewBadge } from "../RagBadge";
import type { TabProps } from "../../pages/AlphaCompanyDetail";
import type { OutreachDraft } from "../../types";

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

function DraftCard({
  draft,
  companyId,
  refetch,
}: {
  draft: OutreachDraft;
  companyId: string;
  refetch: () => void;
}) {
  const [reviewStatus, setReviewStatus] = useState(draft.review_status ?? "draft");
  const [approvedForUse, setApprovedForUse] = useState(draft.approved_for_use ?? false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const copyText = [draft.subject ? `Subject: ${draft.subject}` : null, draft.body]
    .filter(Boolean)
    .join("\n\n");

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("aaos_outreach_drafts")
        .update({ review_status: reviewStatus, approved_for_use: approvedForUse })
        .eq("id", draft.id);
      if (error) throw error;
      await logActivity({
        action: "outreach reviewed",
        summary: `${draft.outreach_type ?? "Outreach"} → ${reviewStatus}`,
        company_id: companyId,
        entity_type: "outreach",
        entity_id: draft.id,
      });
      toast.success("Draft saved");
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this outreach draft?")) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("aaos_outreach_drafts")
        .delete()
        .eq("id", draft.id);
      if (error) throw error;
      toast.success("Draft deleted");
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-sm font-semibold">
              {draft.outreach_type ?? "Outreach"}
            </CardTitle>
            <ReviewStatusBadge status={draft.review_status ?? "draft"} />
            {draft.review_status === "needs human review" && <HumanReviewBadge />}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive shrink-0"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {draft.subject && (
          <p className="font-semibold text-sm">{draft.subject}</p>
        )}
        {draft.body && (
          <div className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm leading-relaxed">
            {draft.body}
          </div>
        )}
        <div className="flex justify-end">
          <CopyButton text={copyText} />
        </div>
        <p className="text-xs text-muted-foreground">
          Source: {draft.contact_source ?? "—"} · {draft.lawful_basis_notes ?? "—"} · Suppression:{" "}
          {draft.suppression_status ?? "—"} · Unsubscribe required:{" "}
          {draft.unsubscribe_required ? "yes" : "no"}
        </p>

        <div className="space-y-3 border-t pt-3">
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
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={approvedForUse}
                  onChange={(e) => setApprovedForUse(e.target.checked)}
                  className="h-4 w-4 rounded border"
                />
                Approved for use
              </label>
            </div>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save review"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function OutreachTab({ companyId, company, refresh }: TabProps) {
  const [generating, setGenerating] = useState(false);

  const { data: drafts = [], refetch } = useQuery({
    queryKey: ["aaos_outreach_drafts", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_outreach_drafts")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OutreachDraft[];
    },
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateOutreach(companyId);
      toast.success("Outreach drafts generated");
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
          <h3 className="font-semibold">Outreach Drafts</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generates 5 outreach drafts using AI. Takes ~10–20 seconds.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="shrink-0">
          <Sparkles className="h-4 w-4 mr-1.5" />
          {generating ? "Generating…" : "Generate outreach drafts"}
        </Button>
      </div>

      {/* Compliance banner */}
      <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          No mass sending in MVP. Human approval required before any outreach is used. Each draft
          records contact source, lawful basis and suppression status.
        </span>
      </div>

      {drafts.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No outreach drafts yet. Click "Generate outreach drafts" to create them.
          </CardContent>
        </Card>
      )}

      {drafts.map((d) => (
        <DraftCard key={d.id} draft={d} companyId={companyId} refetch={refetch} />
      ))}
    </div>
  );
}
