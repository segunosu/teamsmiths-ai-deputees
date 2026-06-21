import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, ExternalLink } from "lucide-react";
import {
  FOUR_P_KEYS,
  FOUR_P_LABELS,
  EVIDENCE_TYPES,
  EVIDENCE_STATUSES,
} from "../../spineConstants";
import { generateEvidenceChecklist } from "../../lib/alphaGen";
import { GenerateButton, StatusPill } from "../spineUi";
import { logActivity } from "../../lib/activity";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";

export function EvidenceSection({ client, refresh }: SectionProps) {
  const qc = useQueryClient();
  const engagementId = client.current_engagement_id;

  const { data: items, refetch } = useQuery({
    queryKey: ["aaos_evidence_items", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_evidence_items")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const onDone = () => {
    refetch();
    refresh();
    qc.invalidateQueries({ queryKey: ["aaos_evidence_items", client.id] });
  };

  // ---- Add form state ----
  const [fourP, setFourP] = useState<string>(FOUR_P_KEYS[0]);
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceType, setEvidenceType] = useState<string>(EVIDENCE_TYPES[0]);
  const [evidenceSummary, setEvidenceSummary] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceStatus, setEvidenceStatus] = useState<string>("Missing");
  const [evidenceDate, setEvidenceDate] = useState("");
  const [adding, setAdding] = useState(false);

  const saveItem = async () => {
    if (!evidenceTitle.trim()) { toast.error("Evidence title is required"); return; }
    setAdding(true);
    try {
      const { data, error } = await supabase.from("aaos_evidence_items").insert({
        client_id: client.id,
        engagement_id: engagementId ?? null,
        four_p_dimension: fourP || null,
        evidence_title: evidenceTitle.trim(),
        evidence_type: evidenceType || null,
        evidence_summary: evidenceSummary || null,
        evidence_url: evidenceUrl || null,
        evidence_status: evidenceStatus || "Missing",
        evidence_date: evidenceDate || null,
      }).select().single();
      if (error) throw error;
      await logActivity({ action: "evidence added", summary: `Evidence "${evidenceTitle}" added`, client_id: client.id, entity_type: "evidence", entity_id: data?.id });
      toast.success("Evidence item added");
      setEvidenceTitle(""); setEvidenceSummary(""); setEvidenceUrl(""); setEvidenceDate("");
      setFourP(FOUR_P_KEYS[0]); setEvidenceType(EVIDENCE_TYPES[0]); setEvidenceStatus("Missing");
      onDone();
    } catch (e: any) { toast.error(e.message || "Failed to add evidence"); }
    finally { setAdding(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("aaos_evidence_items").update({ evidence_status: status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    refetch();
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("Delete this evidence item?")) return;
    const { error } = await supabase.from("aaos_evidence_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refetch();
    toast.success("Deleted");
  };

  // Status summary counts
  const counts: Record<string, number> = {};
  for (const s of EVIDENCE_STATUSES) counts[s] = 0;
  for (const item of (items || [])) {
    if (item.evidence_status && counts[item.evidence_status] !== undefined) counts[item.evidence_status]++;
  }

  // Group by 4P dimension
  const grouped: Record<string, any[]> = {};
  for (const k of FOUR_P_KEYS) grouped[k] = [];
  const ungrouped: any[] = [];
  for (const item of (items || [])) {
    if (item.four_p_dimension && grouped[item.four_p_dimension]) {
      grouped[item.four_p_dimension].push(item);
    } else {
      ungrouped.push(item);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <GenerateButton
          label="Generate evidence checklist"
          onRun={() => generateEvidenceChecklist(client, engagementId)}
          onDone={onDone}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Evidence Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status summary */}
          {(items || []).length > 0 && (
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground border rounded-md px-3 py-2 bg-muted/10">
              {EVIDENCE_STATUSES.map((s) => (
                <span key={s}><StatusPill status={s} /> {counts[s]}</span>
              ))}
            </div>
          )}

          {/* Add form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-md p-3 bg-muted/20">
            <div>
              <Label className="text-xs">4P Dimension</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={fourP} onChange={(e) => setFourP(e.target.value)}>
                {FOUR_P_KEYS.map((k) => <option key={k} value={k}>{FOUR_P_LABELS[k]}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Evidence Type</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)}>
                {EVIDENCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Evidence Title *</Label>
              <Input value={evidenceTitle} onChange={(e) => setEvidenceTitle(e.target.value)} placeholder="Title" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Summary</Label>
              <Textarea value={evidenceSummary} onChange={(e) => setEvidenceSummary(e.target.value)} placeholder="Brief summary" rows={2} />
            </div>
            <div>
              <Label className="text-xs">URL</Label>
              <Input value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={evidenceStatus} onChange={(e) => setEvidenceStatus(e.target.value)}>
                {EVIDENCE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Evidence Date</Label>
              <Input type="date" value={evidenceDate} onChange={(e) => setEvidenceDate(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button size="sm" onClick={saveItem} disabled={adding}>
                {adding ? "Saving…" : "Add Evidence Item"}
              </Button>
            </div>
          </div>

          {/* Grouped list */}
          <div className="space-y-4">
            {(items || []).length === 0 && <p className="text-sm text-muted-foreground">No evidence items yet.</p>}
            {FOUR_P_KEYS.map((k) =>
              grouped[k].length === 0 ? null : (
                <div key={k}>
                  <h4 className="text-sm font-semibold mb-2">{FOUR_P_LABELS[k]}</h4>
                  <div className="space-y-2">
                    {grouped[k].map((e: any) => (
                      <EvidenceRow key={e.id} item={e} onUpdate={updateStatus} onDelete={deleteItem} />
                    ))}
                  </div>
                </div>
              )
            )}
            {ungrouped.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Other</h4>
                <div className="space-y-2">
                  {ungrouped.map((e: any) => (
                    <EvidenceRow key={e.id} item={e} onUpdate={updateStatus} onDelete={deleteItem} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EvidenceRow({ item, onUpdate, onDelete }: { item: any; onUpdate: (id: string, status: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-sm">{item.evidence_title}</span>
          {item.evidence_type && <span className="text-xs text-muted-foreground">{item.evidence_type}</span>}
          <StatusPill status={item.evidence_status} />
          {item.evidence_url && (
            <a href={item.evidence_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="h-3 w-3" /> link
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border bg-background px-2 text-xs"
            value={item.evidence_status || ""}
            onChange={(e) => onUpdate(item.id, e.target.value)}
          >
            {EVIDENCE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {item.evidence_summary && <p className="text-xs text-muted-foreground mt-1">{item.evidence_summary}</p>}
    </div>
  );
}
