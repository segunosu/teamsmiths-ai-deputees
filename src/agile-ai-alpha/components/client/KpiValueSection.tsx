import { useState } from "react";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { ATTRIBUTION_CONFIDENCE, CLIENT_AGREED } from "../../spineConstants";
import { generateKpiBaseline } from "../../lib/alphaGen";
import { kpiUplift } from "../../lib/spineScoring";
import { RagBadge } from "../RagBadge";
import { GenerateButton, StatusPill } from "../spineUi";
import { logActivity } from "../../lib/activity";
import type { ValueLedgerEntry } from "../../spineTypes";

type KpiRow = {
  id: string;
  client_id: string | null;
  engagement_id: string | null;
  company_id: string | null;
  opportunity_id: string | null;
  kpi_name: string;
  kpi_category: string | null;
  baseline_value: number | null;
  target_value: number | null;
  actual_value: number | null;
  unit: string | null;
  baseline_date: string | null;
  target_date: string | null;
  actual_date: string | null;
  data_source: string | null;
  confidence_level: string | null;
  notes: string | null;
  created_at: string;
};

const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;

export function KpiValueSection({ client, refresh }: SectionProps) {
  const qc = useQueryClient();
  const engagementId = client.current_engagement_id;

  const { data: kpis, refetch: refetchKpis } = useQuery({
    queryKey: ["aaos_kpis", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_kpis")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as KpiRow[];
    },
  });

  const { data: ledger, refetch: refetchLedger } = useQuery({
    queryKey: ["aaos_value_ledger", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_value_ledger")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ValueLedgerEntry[];
    },
  });

  return (
    <div className="space-y-6">
      <KpiCard
        client={client}
        engagementId={engagementId}
        kpis={kpis || []}
        onDone={() => {
          refetchKpis();
          refresh();
          qc.invalidateQueries({ queryKey: ["aaos_kpis"] });
        }}
      />
      <ValueLedgerCard
        client={client}
        engagementId={engagementId}
        kpis={kpis || []}
        ledger={ledger || []}
        onDone={() => {
          refetchLedger();
          refresh();
          qc.invalidateQueries({ queryKey: ["aaos_value_ledger"] });
        }}
      />
    </div>
  );
}

function KpiCard({
  client,
  engagementId,
  kpis,
  onDone,
}: {
  client: SectionProps["client"];
  engagementId: string | null | undefined;
  kpis: KpiRow[];
  onDone: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    kpi_name: "",
    kpi_category: "",
    baseline_value: "",
    target_value: "",
    actual_value: "",
    unit: "",
    baseline_date: "",
    target_date: "",
    actual_date: "",
    data_source: "",
    confidence_level: "",
  });

  const handleAdd = async () => {
    if (!form.kpi_name.trim()) { toast.error("KPI name is required"); return; }
    const { error, data } = await supabase
      .from("aaos_kpis")
      .insert({
        client_id: client.id,
        engagement_id: engagementId ?? null,
        company_id: client.company_id ?? null,
        kpi_name: form.kpi_name.trim(),
        kpi_category: form.kpi_category || null,
        baseline_value: form.baseline_value !== "" ? Number(form.baseline_value) : null,
        target_value: form.target_value !== "" ? Number(form.target_value) : null,
        actual_value: form.actual_value !== "" ? Number(form.actual_value) : null,
        unit: form.unit || null,
        baseline_date: form.baseline_date || null,
        target_date: form.target_date || null,
        actual_date: form.actual_date || null,
        data_source: form.data_source || null,
        confidence_level: form.confidence_level || null,
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "KPI added",
      summary: `KPI "${form.kpi_name}" added for ${client.client_name}`,
      client_id: client.id,
      engagement_id: engagementId,
      entity_type: "kpi",
      entity_id: data?.id,
    });
    toast.success("KPI added");
    setForm({ kpi_name: "", kpi_category: "", baseline_value: "", target_value: "", actual_value: "", unit: "", baseline_date: "", target_date: "", actual_date: "", data_source: "", confidence_level: "" });
    setShowAdd(false);
    onDone();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>KPIs</span>
          <div className="flex items-center gap-2">
            <GenerateButton
              label="Generate KPI baseline"
              onRun={() => generateKpiBaseline(client, engagementId)}
              onDone={onDone}
              variant="outline"
            />
            <Button variant="outline" size="sm" onClick={() => setShowAdd((v) => !v)}>
              <Plus className="h-4 w-4 mr-1" />
              {showAdd ? "Cancel" : "Add KPI"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="rounded-md border p-3 space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs">KPI name *</Label>
                <Input value={form.kpi_name} onChange={(e) => setForm((f) => ({ ...f, kpi_name: e.target.value }))} placeholder="e.g. Workflow cycle time" />
              </div>
              <div className="flex-1 min-w-[140px]">
                <Label className="text-xs">Category</Label>
                <Input value={form.kpi_category} onChange={(e) => setForm((f) => ({ ...f, kpi_category: e.target.value }))} placeholder="e.g. cycle time" />
              </div>
              <div className="flex-1 min-w-[80px]">
                <Label className="text-xs">Unit</Label>
                <Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="e.g. hours" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[100px]">
                <Label className="text-xs">Baseline value</Label>
                <Input type="number" value={form.baseline_value} onChange={(e) => setForm((f) => ({ ...f, baseline_value: e.target.value }))} />
              </div>
              <div className="flex-1 min-w-[100px]">
                <Label className="text-xs">Target value</Label>
                <Input type="number" value={form.target_value} onChange={(e) => setForm((f) => ({ ...f, target_value: e.target.value }))} />
              </div>
              <div className="flex-1 min-w-[100px]">
                <Label className="text-xs">Actual value</Label>
                <Input type="number" value={form.actual_value} onChange={(e) => setForm((f) => ({ ...f, actual_value: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[120px]">
                <Label className="text-xs">Baseline date</Label>
                <Input type="date" value={form.baseline_date} onChange={(e) => setForm((f) => ({ ...f, baseline_date: e.target.value }))} />
              </div>
              <div className="flex-1 min-w-[120px]">
                <Label className="text-xs">Target date</Label>
                <Input type="date" value={form.target_date} onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))} />
              </div>
              <div className="flex-1 min-w-[120px]">
                <Label className="text-xs">Actual date</Label>
                <Input type="date" value={form.actual_date} onChange={(e) => setForm((f) => ({ ...f, actual_date: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[160px]">
                <Label className="text-xs">Data source</Label>
                <Input value={form.data_source} onChange={(e) => setForm((f) => ({ ...f, data_source: e.target.value }))} placeholder="e.g. CRM export" />
              </div>
              <div className="flex-1 min-w-[130px]">
                <Label className="text-xs">Confidence level</Label>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                  value={form.confidence_level}
                  onChange={(e) => setForm((f) => ({ ...f, confidence_level: e.target.value }))}
                >
                  <option value="">— select —</option>
                  {CONFIDENCE_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Button size="sm" onClick={handleAdd}>Add KPI</Button>
          </div>
        )}

        {kpis.length === 0 && !showAdd && (
          <p className="text-sm text-muted-foreground">No KPIs yet. Generate a baseline or add one manually.</p>
        )}

        <div className="space-y-2">
          {kpis.map((kpi) => (
            <KpiRow key={kpi.id} kpi={kpi} clientId={client.id} clientName={client.client_name} engagementId={engagementId} onDone={onDone} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function KpiRow({
  kpi,
  clientId,
  clientName,
  engagementId,
  onDone,
}: {
  kpi: KpiRow;
  clientId: string;
  clientName: string;
  engagementId: string | null | undefined;
  onDone: () => void;
}) {
  const [editActual, setEditActual] = useState(kpi.actual_value?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const handleSaveActual = async () => {
    setSaving(true);
    const actual = editActual !== "" ? Number(editActual) : null;
    const { error } = await supabase
      .from("aaos_kpis")
      .update({ actual_value: actual })
      .eq("id", kpi.id);
    if (error) { toast.error(error.message); setSaving(false); return; }
    await logActivity({
      action: "KPI actual updated",
      summary: `KPI "${kpi.kpi_name}" actual updated for ${clientName}`,
      client_id: clientId,
      engagement_id: engagementId,
      entity_type: "kpi",
      entity_id: kpi.id,
    });
    toast.success("KPI updated");
    setSaving(false);
    onDone();
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this KPI?")) return;
    const { error } = await supabase.from("aaos_kpis").delete().eq("id", kpi.id);
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "KPI deleted",
      summary: `KPI "${kpi.kpi_name}" deleted`,
      client_id: clientId,
      engagement_id: engagementId,
      entity_type: "kpi",
      entity_id: kpi.id,
    });
    toast.success("Deleted");
    onDone();
  };

  const unit = kpi.unit ? ` ${kpi.unit}` : "";
  const baseline = kpi.baseline_value != null ? `${kpi.baseline_value}${unit}` : "?";
  const target = kpi.target_value != null ? `${kpi.target_value}${unit}` : "?";
  const actual = kpi.actual_value != null ? `${kpi.actual_value}${unit}` : "—";

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-medium text-sm">{kpi.kpi_name}</div>
          <div className="text-xs text-muted-foreground">
            {kpi.kpi_category && <span>{kpi.kpi_category} · </span>}
            baseline {baseline} → target {target} (actual {actual})
            {kpi.confidence_level && <span> · {kpi.confidence_level} confidence</span>}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs whitespace-nowrap">Actual value:</Label>
        <Input
          type="number"
          className="h-7 text-xs w-28"
          value={editActual}
          onChange={(e) => setEditActual(e.target.value)}
        />
        <Button size="sm" className="h-7 text-xs" disabled={saving} onClick={handleSaveActual}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function ValueLedgerCard({
  client,
  engagementId,
  kpis,
  ledger,
  onDone,
}: {
  client: SectionProps["client"];
  engagementId: string | null | undefined;
  kpis: KpiRow[];
  ledger: ValueLedgerEntry[];
  onDone: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    value_title: "",
    value_type: "",
    baseline_value: "",
    actual_value: "",
    financial_value_low: "",
    financial_value_high: "",
    attribution_confidence: "",
    attribution_notes: "",
    client_agreed: "",
    kpi_id: "",
  });

  const handleAdd = async () => {
    if (!form.value_title.trim()) { toast.error("Value title is required"); return; }
    const baseline = form.baseline_value !== "" ? Number(form.baseline_value) : null;
    const actual = form.actual_value !== "" ? Number(form.actual_value) : null;
    const calculated_uplift = kpiUplift(baseline, actual);

    const { error, data } = await supabase
      .from("aaos_value_ledger")
      .insert({
        client_id: client.id,
        engagement_id: engagementId ?? null,
        value_title: form.value_title.trim(),
        value_type: form.value_type || null,
        baseline_value: baseline,
        actual_value: actual,
        calculated_uplift,
        financial_value_low: form.financial_value_low !== "" ? Number(form.financial_value_low) : null,
        financial_value_high: form.financial_value_high !== "" ? Number(form.financial_value_high) : null,
        attribution_confidence: form.attribution_confidence || null,
        attribution_notes: form.attribution_notes || null,
        client_agreed: form.client_agreed || null,
        kpi_id: form.kpi_id || null,
        monetisation_triggered: false,
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "value recorded",
      summary: `Value entry "${form.value_title}" added for ${client.client_name}`,
      client_id: client.id,
      engagement_id: engagementId,
      entity_type: "value_ledger",
      entity_id: data?.id,
    });
    toast.success("Value entry added");
    setForm({ value_title: "", value_type: "", baseline_value: "", actual_value: "", financial_value_low: "", financial_value_high: "", attribution_confidence: "", attribution_notes: "", client_agreed: "", kpi_id: "" });
    setShowAdd(false);
    onDone();
  };

  const handleFlagMonetisation = async (entry: ValueLedgerEntry) => {
    const { error } = await supabase
      .from("aaos_value_ledger")
      .update({ monetisation_triggered: true })
      .eq("id", entry.id);
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "monetisation flagged",
      summary: `Monetisation flagged for "${entry.value_title}"`,
      client_id: client.id,
      engagement_id: engagementId,
      entity_type: "value_ledger",
      entity_id: entry.id,
    });
    toast.success("Monetisation flagged — human review required downstream");
    onDone();
  };

  const handleDelete = async (entry: ValueLedgerEntry) => {
    if (!window.confirm("Delete this value entry?")) return;
    const { error } = await supabase.from("aaos_value_ledger").delete().eq("id", entry.id);
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "value entry deleted",
      summary: `Value entry "${entry.value_title}" deleted`,
      client_id: client.id,
      engagement_id: engagementId,
      entity_type: "value_ledger",
      entity_id: entry.id,
    });
    toast.success("Deleted");
    onDone();
  };

  const attributionRag = (confidence: string | null) => {
    if (confidence === "High") return "green";
    if (confidence === "Medium") return "amber";
    return "red";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Value ledger</span>
          <Button variant="outline" size="sm" onClick={() => setShowAdd((v) => !v)}>
            <Plus className="h-4 w-4 mr-1" />
            {showAdd ? "Cancel" : "Add entry"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="rounded-md border p-3 space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs">Value title *</Label>
                <Input value={form.value_title} onChange={(e) => setForm((f) => ({ ...f, value_title: e.target.value }))} placeholder="e.g. Workflow time saving Q1" />
              </div>
              <div className="flex-1 min-w-[140px]">
                <Label className="text-xs">Value type</Label>
                <Input value={form.value_type} onChange={(e) => setForm((f) => ({ ...f, value_type: e.target.value }))} placeholder="e.g. time saving" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[100px]">
                <Label className="text-xs">Baseline value</Label>
                <Input type="number" value={form.baseline_value} onChange={(e) => setForm((f) => ({ ...f, baseline_value: e.target.value }))} />
              </div>
              <div className="flex-1 min-w-[100px]">
                <Label className="text-xs">Actual value</Label>
                <Input type="number" value={form.actual_value} onChange={(e) => setForm((f) => ({ ...f, actual_value: e.target.value }))} />
              </div>
              <div className="flex-1 min-w-[100px]">
                <Label className="text-xs">Financial low (£)</Label>
                <Input type="number" value={form.financial_value_low} onChange={(e) => setForm((f) => ({ ...f, financial_value_low: e.target.value }))} />
              </div>
              <div className="flex-1 min-w-[100px]">
                <Label className="text-xs">Financial high (£)</Label>
                <Input type="number" value={form.financial_value_high} onChange={(e) => setForm((f) => ({ ...f, financial_value_high: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[130px]">
                <Label className="text-xs">Attribution confidence</Label>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                  value={form.attribution_confidence}
                  onChange={(e) => setForm((f) => ({ ...f, attribution_confidence: e.target.value }))}
                >
                  <option value="">— select —</option>
                  {ATTRIBUTION_CONFIDENCE.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[130px]">
                <Label className="text-xs">Client agreed</Label>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                  value={form.client_agreed}
                  onChange={(e) => setForm((f) => ({ ...f, client_agreed: e.target.value }))}
                >
                  <option value="">— select —</option>
                  {CLIENT_AGREED.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <Label className="text-xs">Link to KPI (optional)</Label>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                  value={form.kpi_id}
                  onChange={(e) => setForm((f) => ({ ...f, kpi_id: e.target.value }))}
                >
                  <option value="">— none —</option>
                  {kpis.map((k) => <option key={k.id} value={k.id}>{k.kpi_name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Attribution notes</Label>
              <Textarea
                rows={2}
                value={form.attribution_notes}
                onChange={(e) => setForm((f) => ({ ...f, attribution_notes: e.target.value }))}
                placeholder="Describe how the value was attributed…"
              />
            </div>
            <Button size="sm" onClick={handleAdd}>Add entry</Button>
          </div>
        )}

        {ledger.length === 0 && !showAdd && (
          <p className="text-sm text-muted-foreground">No value ledger entries yet. Add value captured from sprint delivery.</p>
        )}

        <div className="space-y-3">
          {ledger.map((entry) => {
            const isAgreed = entry.client_agreed === "Yes";
            const uplift = entry.calculated_uplift;
            const finRange =
              entry.financial_value_low != null && entry.financial_value_high != null
                ? `£${entry.financial_value_low.toLocaleString()}–£${entry.financial_value_high.toLocaleString()}`
                : entry.financial_value_low != null
                ? `£${entry.financial_value_low.toLocaleString()}+`
                : null;

            return (
              <div
                key={entry.id}
                className={`rounded-md border p-3 space-y-2 ${isAgreed ? "border-green-300 bg-green-50/30" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="font-medium text-sm">{entry.value_title}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      {uplift != null && (
                        <span className="text-xs text-muted-foreground">Uplift: {uplift > 0 ? "+" : ""}{uplift}</span>
                      )}
                      {finRange && <span className="text-xs font-medium">{finRange}</span>}
                      {entry.attribution_confidence && (
                        <RagBadge
                          rag={attributionRag(entry.attribution_confidence)}
                          label={`${entry.attribution_confidence} confidence`}
                        />
                      )}
                      {entry.client_agreed && <StatusPill status={entry.client_agreed} />}
                      {entry.monetisation_triggered && (
                        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                          Monetisation flagged
                        </span>
                      )}
                    </div>
                    {entry.attribution_notes && (
                      <p className="text-xs text-muted-foreground">{entry.attribution_notes}</p>
                    )}
                    {!isAgreed && (
                      <p className="text-xs text-muted-foreground italic">Estimated — not yet agreed by client</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!entry.monetisation_triggered && (
                      <Button size="sm" variant="outline" onClick={() => handleFlagMonetisation(entry)}>
                        Flag monetisation
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleDelete(entry)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
