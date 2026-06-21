import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlphaLayout } from "../components/AlphaLayout";
import { StatusPill, Field } from "../components/spineUi";
import { RagBadge } from "../components/RagBadge";
import { ENGAGEMENT_STATUSES, COMMERCIAL_MODELS } from "../spineConstants";
import { priorityRag } from "../lib/spineScoring";
import { logActivity } from "../lib/activity";

export default function AlphaEngagement() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [editStatus, setEditStatus] = useState<string | null>(null);
  const [editModel, setEditModel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["aaos_engagement", id],
    queryFn: async () => {
      const [eng, diagnostics, opps, sprints] = await Promise.all([
        supabase.from("aaos_engagements").select("*").eq("id", id!).single(),
        supabase.from("aaos_diagnostics").select("id, diagnostic_name, status").eq("engagement_id", id!),
        supabase.from("aaos_ai_opportunities").select("id, opportunity_title, priority_score, status").eq("engagement_id", id!),
        supabase.from("aaos_sprints").select("id, sprint_name, status").eq("engagement_id", id!),
      ]);
      return {
        engagement: eng.data,
        diagnostics: diagnostics.data || [],
        opps: opps.data || [],
        sprints: sprints.data || [],
      };
    },
    enabled: !!id,
  });

  if (isLoading || !data) {
    return (
      <AlphaLayout title="Engagement">
        <div className="text-muted-foreground">Loading…</div>
      </AlphaLayout>
    );
  }

  const { engagement: e, diagnostics, opps, sprints } = data;

  if (!e) {
    return (
      <AlphaLayout title="Engagement not found">
        <p className="text-muted-foreground">Engagement not found.</p>
      </AlphaLayout>
    );
  }

  const currentStatus = editStatus ?? e.status ?? "";
  const currentModel = editModel ?? e.commercial_model ?? "";

  async function handleSave() {
    if (!e) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("aaos_engagements")
        .update({ status: currentStatus, commercial_model: currentModel })
        .eq("id", e.id);
      if (error) throw error;
      await logActivity({
        action: "engagement updated",
        summary: `Updated engagement ${e.engagement_name}: status=${currentStatus}, model=${currentModel}`,
        client_id: e.client_id,
        engagement_id: e.id,
      });
      toast.success("Engagement saved");
      qc.invalidateQueries({ queryKey: ["aaos_engagement", id] });
      setEditStatus(null);
      setEditModel(null);
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const isDirty = editStatus !== null || editModel !== null;

  return (
    <AlphaLayout title={e.engagement_name || "Engagement"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-semibold">{e.engagement_name || "Unnamed Engagement"}</h2>
          <StatusPill status={e.status} />
        </div>
        <Link
          to={`/agile-ai-alpha/clients/${e.client_id}`}
          className="text-sm text-primary hover:underline"
        >
          ← client workspace
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main engagement card */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Engagement details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="Engagement type">{e.engagement_type}</Field>
              <Field label="Commercial model">
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm mt-1"
                  value={currentModel}
                  onChange={(ev) => setEditModel(ev.target.value)}
                >
                  <option value="">— select —</option>
                  {COMMERCIAL_MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm mt-1"
                  value={currentStatus}
                  onChange={(ev) => setEditStatus(ev.target.value)}
                >
                  <option value="">— select —</option>
                  {ENGAGEMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Agreed price">
                {e.agreed_price != null ? `£${Number(e.agreed_price).toLocaleString()}` : "—"}
              </Field>
              <Field label="Start date">{e.start_date || "—"}</Field>
              <Field label="Target end date">{e.target_end_date || "—"}</Field>
              <Field label="Owner">{e.owner || "—"}</Field>
              <Field label="Notes">{e.notes || "—"}</Field>
              {isDirty && (
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Linked records */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Diagnostics ({diagnostics.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {diagnostics.length === 0 && (
                <p className="text-xs text-muted-foreground">No diagnostics linked.</p>
              )}
              {diagnostics.map((d) => (
                <Link
                  key={d.id}
                  to={`/agile-ai-alpha/clients/${e.client_id}?tab=diagnostics`}
                  className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50 text-sm"
                >
                  <span className="truncate">{d.diagnostic_name}</span>
                  <StatusPill status={d.status} />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Opportunities ({opps.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {opps.length === 0 && (
                <p className="text-xs text-muted-foreground">No opportunities linked.</p>
              )}
              {opps.map((o) => (
                <Link
                  key={o.id}
                  to={`/agile-ai-alpha/clients/${e.client_id}?tab=opportunities`}
                  className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50 text-sm"
                >
                  <span className="truncate">{o.opportunity_title}</span>
                  <RagBadge
                    rag={priorityRag(o.priority_score || 0)}
                    label={`P${o.priority_score ?? "?"}`}
                  />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sprints ({sprints.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {sprints.length === 0 && (
                <p className="text-xs text-muted-foreground">No sprints linked.</p>
              )}
              {sprints.map((s) => (
                <Link
                  key={s.id}
                  to={`/agile-ai-alpha/clients/${e.client_id}?tab=opportunities`}
                  className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50 text-sm"
                >
                  <span className="truncate">{s.sprint_name}</span>
                  <StatusPill status={s.status} />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AlphaLayout>
  );
}
