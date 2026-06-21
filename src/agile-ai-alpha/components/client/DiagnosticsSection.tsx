import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { StatusPill, Field, GenerateButton } from "../spineUi";
import { HumanReviewBadge } from "../RagBadge";
import { generateDiagnostic } from "../../lib/alphaGen";
import { logActivity } from "../../lib/activity";
import { DIAGNOSTIC_STATUSES, DIAGNOSTIC_INPUT_TYPES } from "../../spineConstants";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";
import type { Diagnostic, DiagnosticInput } from "../../spineTypes";

export function DiagnosticsSection({ client, refresh }: SectionProps) {
  const qc = useQueryClient();
  const engagementId = client.current_engagement_id;

  const { data: diagnostics, refetch } = useQuery<Diagnostic[]>({
    queryKey: ["aaos_diagnostics", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_diagnostics")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Diagnostic[];
    },
  });

  const d = diagnostics?.[0] ?? null;

  // Editable state
  const [diagStatus, setDiagStatus] = useState<string>("");
  const [reviewStatus, setReviewStatus] = useState<string>("");
  const [humanReview, setHumanReview] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  // Sync local state when diagnostic loads (only once per diagnostic id)
  const syncedId = d?.id;
  const [lastSyncedId, setLastSyncedId] = useState<string | null>(null);
  if (d && d.id !== lastSyncedId) {
    setDiagStatus(d.status ?? "Draft");
    setReviewStatus(d.review_status ?? "");
    setHumanReview(d.human_review_required ?? false);
    setLastSyncedId(d.id);
  }

  const handleSave = async () => {
    if (!d) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("aaos_diagnostics")
        .update({ status: diagStatus, review_status: reviewStatus, human_review_required: humanReview })
        .eq("id", d.id);
      if (error) throw error;
      await logActivity({
        action: "diagnostic updated",
        summary: `Diagnostic status → ${diagStatus} for ${client.client_name}`,
        client_id: client.id,
        engagement_id: engagementId ?? null,
        entity_type: "diagnostic",
        entity_id: d.id,
      });
      toast.success("Diagnostic saved");
      refetch();
      refresh();
      qc.invalidateQueries({ queryKey: ["aaos_diagnostics", client.id] });
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Diagnostic inputs
  const { data: inputs, refetch: refetchInputs } = useQuery<DiagnosticInput[]>({
    queryKey: ["aaos_diagnostic_inputs", d?.id],
    queryFn: async () => {
      if (!d?.id) return [];
      const { data, error } = await supabase
        .from("aaos_diagnostic_inputs")
        .select("*")
        .eq("diagnostic_id", d.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as DiagnosticInput[];
    },
    enabled: !!d?.id,
  });

  // Input form state
  const [inputType, setInputType] = useState<string>(DIAGNOSTIC_INPUT_TYPES[0]);
  const [inputTitle, setInputTitle] = useState("");
  const [inputContent, setInputContent] = useState("");
  const [inputSource, setInputSource] = useState("");
  const [inputConfidence, setInputConfidence] = useState<string>("medium");
  const [addingInput, setAddingInput] = useState(false);
  const [showInputForm, setShowInputForm] = useState(false);

  const handleAddInput = async () => {
    if (!d?.id) { toast.error("No diagnostic exists yet"); return; }
    if (!inputTitle.trim()) { toast.error("Title is required"); return; }
    setAddingInput(true);
    try {
      const { error } = await supabase.from("aaos_diagnostic_inputs").insert({
        diagnostic_id: d.id,
        input_type: inputType,
        title: inputTitle.trim(),
        content: inputContent.trim() || null,
        source: inputSource.trim() || null,
        confidence_level: inputConfidence,
      });
      if (error) throw error;
      toast.success("Input added");
      setInputTitle(""); setInputContent(""); setInputSource("");
      setInputType(DIAGNOSTIC_INPUT_TYPES[0]); setInputConfidence("medium");
      setShowInputForm(false);
      refetchInputs();
      qc.invalidateQueries({ queryKey: ["aaos_diagnostic_inputs", d.id] });
    } catch (e: any) {
      toast.error(e?.message || "Failed to add input");
    } finally {
      setAddingInput(false);
    }
  };

  const handleDeleteInput = async (inp: DiagnosticInput) => {
    if (!window.confirm("Delete this input?")) return;
    const { error } = await supabase.from("aaos_diagnostic_inputs").delete().eq("id", inp.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Input deleted");
    refetchInputs();
    qc.invalidateQueries({ queryKey: ["aaos_diagnostic_inputs", d?.id] });
  };

  // No diagnostic yet
  if (diagnostics !== undefined && diagnostics.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">No diagnostic yet. Generate one to get started.</p>
            <GenerateButton
              label="Generate diagnostic"
              onRun={() => generateDiagnostic(client, engagementId)}
              onDone={() => { refetch(); refresh(); qc.invalidateQueries({ queryKey: ["aaos_diagnostics", client.id] }); }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main diagnostic card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{d?.diagnostic_name ?? "Diagnostic"}</CardTitle>
              {d && <StatusPill status={d.status} />}
              {d?.human_review_required && <HumanReviewBadge />}
            </div>
            <GenerateButton
              label="Generate diagnostic"
              onRun={() => generateDiagnostic(client, engagementId, d?.id)}
              onDone={() => { refetch(); refresh(); qc.invalidateQueries({ queryKey: ["aaos_diagnostics", client.id] }); }}
              variant="outline"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {d && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Diagnostic summary">{d.diagnostic_summary}</Field>
                <Field label="Key findings">{d.key_findings}</Field>
                <Field label="Recommended 90-day focus">{d.recommended_90_day_focus}</Field>
                <Field label="Top opportunities">{d.top_opportunities_summary}</Field>
                <Field label="Top risks">{d.top_risks_summary}</Field>
                <Field label="Value potential (low)">
                  {d.value_potential_low != null ? `£${Number(d.value_potential_low).toLocaleString()}` : "—"}
                </Field>
                <Field label="Value potential (high)">
                  {d.value_potential_high != null ? `£${Number(d.value_potential_high).toLocaleString()}` : "—"}
                </Field>
                <Field label="Readiness score">{d.readiness_score != null ? String(d.readiness_score) : "—"}</Field>
                <Field label="Confidence level">{d.confidence_level}</Field>
              </div>

              {/* Editable controls */}
              <div className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label>Status</Label>
                    <select
                      className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                      value={diagStatus}
                      onChange={(e) => setDiagStatus(e.target.value)}
                    >
                      {DIAGNOSTIC_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Review status</Label>
                    <Input
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                      placeholder="e.g. Awaiting review"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={humanReview}
                        onChange={(e) => setHumanReview(e.target.checked)}
                        className="h-4 w-4"
                      />
                      Human review required
                    </label>
                  </div>
                </div>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Diagnostic inputs sub-card */}
      {d && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Diagnostic inputs ({inputs?.length ?? 0})</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowInputForm((v) => !v)}>
                <Plus className="h-4 w-4 mr-1" /> Add input
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showInputForm && (
              <div className="border rounded-md p-3 space-y-3 bg-muted/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Input type</Label>
                    <select
                      className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                      value={inputType}
                      onChange={(e) => setInputType(e.target.value)}
                    >
                      {DIAGNOSTIC_INPUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Title *</Label>
                    <Input value={inputTitle} onChange={(e) => setInputTitle(e.target.value)} placeholder="Short title" />
                  </div>
                  <div>
                    <Label>Source</Label>
                    <Input value={inputSource} onChange={(e) => setInputSource(e.target.value)} placeholder="Interview, document, etc." />
                  </div>
                  <div>
                    <Label>Confidence</Label>
                    <select
                      className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                      value={inputConfidence}
                      onChange={(e) => setInputConfidence(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    rows={3}
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="Notes, observations, data…"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddInput} disabled={addingInput}>
                    {addingInput ? "Adding…" : "Add input"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowInputForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {(inputs || []).length === 0 && !showInputForm && (
              <p className="text-sm text-muted-foreground">No inputs yet. Add interview notes, documents, or observations.</p>
            )}

            <div className="space-y-2">
              {(inputs || []).map((inp) => (
                <div key={inp.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{inp.title}</span>
                        <span className="text-xs text-muted-foreground rounded-full bg-muted px-2 py-0.5">{inp.input_type}</span>
                        {inp.confidence_level && (
                          <span className="text-xs text-muted-foreground">confidence: {inp.confidence_level}</span>
                        )}
                      </div>
                      {inp.content && <p className="text-sm whitespace-pre-wrap text-muted-foreground">{inp.content}</p>}
                      {inp.source && <p className="text-xs text-muted-foreground">Source: {inp.source}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteInput(inp)}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
