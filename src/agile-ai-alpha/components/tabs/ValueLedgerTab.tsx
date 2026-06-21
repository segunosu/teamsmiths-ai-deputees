import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { VALUE_TYPES, CONFIDENCE_LEVELS } from "../../constants";
import { logActivity } from "../../lib/activity";
import type { TabProps } from "../../pages/AlphaCompanyDetail";
import type { Kpi, ValueHypothesis } from "../../types";

// ─── helpers ────────────────────────────────────────────────────────────────

function parseNum(val: string): number | null {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

const CONFIDENCE_CLASSES: Record<string, string> = {
  high: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-muted text-muted-foreground border-border",
};

function ConfidenceBadge({ level }: { level: string | null }) {
  const l = level ?? "low";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${CONFIDENCE_CLASSES[l] ?? CONFIDENCE_CLASSES.low}`}
    >
      {l}
    </span>
  );
}

function ValueTypeBadge({ type }: { type: string | null }) {
  return (
    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
      {type ?? "—"}
    </span>
  );
}

// ─── KPI section ─────────────────────────────────────────────────────────────

function KpiRow({ kpi, refetch }: { kpi: Kpi; refetch: () => void }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this KPI?")) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("aaos_kpis").delete().eq("id", kpi.id);
      if (error) throw error;
      toast.success("KPI deleted");
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{kpi.kpi_name}</span>
          {kpi.kpi_category && (
            <span className="text-xs text-muted-foreground">{kpi.kpi_category}</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {[
            kpi.baseline_value != null ? `Baseline: ${kpi.baseline_value}` : null,
            kpi.target_value != null ? `Target: ${kpi.target_value}` : null,
            kpi.actual_value != null ? `Actual: ${kpi.actual_value}` : null,
            kpi.unit ? kpi.unit : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
        {(kpi.baseline_date || kpi.target_date) && (
          <div className="text-xs text-muted-foreground">
            {[
              kpi.baseline_date ? `From: ${kpi.baseline_date}` : null,
              kpi.target_date ? `By: ${kpi.target_date}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        )}
        {kpi.notes && <p className="text-xs text-muted-foreground italic">{kpi.notes}</p>}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-destructive shrink-0"
        onClick={handleDelete}
        disabled={deleting}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function KpisSection({ companyId }: { companyId: string }) {
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [kpiName, setKpiName] = useState("");
  const [kpiCategory, setKpiCategory] = useState("");
  const [baselineValue, setBaselineValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [actualValue, setActualValue] = useState("");
  const [unit, setUnit] = useState("");
  const [baselineDate, setBaselineDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: kpis = [], refetch } = useQuery({
    queryKey: ["aaos_kpis", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_kpis")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Kpi[];
    },
  });

  const handleAdd = async () => {
    if (!kpiName.trim()) {
      toast.error("KPI name is required");
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase.from("aaos_kpis").insert({
        company_id: companyId,
        kpi_name: kpiName.trim(),
        kpi_category: kpiCategory.trim() || null,
        baseline_value: parseNum(baselineValue),
        target_value: parseNum(targetValue),
        actual_value: parseNum(actualValue),
        unit: unit.trim() || null,
        baseline_date: baselineDate || null,
        target_date: targetDate || null,
        notes: notes.trim() || null,
      });
      if (error) throw error;
      await logActivity({
        action: "KPI added",
        summary: kpiName.trim(),
        company_id: companyId,
        entity_type: "kpi",
      });
      toast.success("KPI added");
      setKpiName("");
      setKpiCategory("");
      setBaselineValue("");
      setTargetValue("");
      setActualValue("");
      setUnit("");
      setBaselineDate("");
      setTargetDate("");
      setNotes("");
      setShowForm(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Add failed");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">KPIs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {kpis.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3">No KPIs yet.</p>
        ) : (
          <div>
            {kpis.map((k) => (
              <KpiRow key={k.id} kpi={k} refetch={refetch} />
            ))}
          </div>
        )}

        {!showForm ? (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add KPI
          </Button>
        ) : (
          <div className="space-y-3 border-t pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">KPI name *</Label>
                <Input
                  value={kpiName}
                  onChange={(e) => setKpiName(e.target.value)}
                  placeholder="e.g. Customer acquisition cost"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Input
                  value={kpiCategory}
                  onChange={(e) => setKpiCategory(e.target.value)}
                  placeholder="e.g. Financial, Operations"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">Baseline value</Label>
                <Input
                  type="number"
                  value={baselineValue}
                  onChange={(e) => setBaselineValue(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Target value</Label>
                <Input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Actual value</Label>
                <Input
                  type="number"
                  value={actualValue}
                  onChange={(e) => setActualValue(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Unit</Label>
                <Input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="£, %, hrs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Baseline date</Label>
                <input
                  type="date"
                  value={baselineDate}
                  onChange={(e) => setBaselineDate(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Target date</Label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={adding}>
                {adding ? "Adding…" : "Add KPI"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Value Hypotheses section ─────────────────────────────────────────────────

function HypothesisCard({
  hyp,
  refetch,
}: {
  hyp: ValueHypothesis;
  refetch: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this value hypothesis?")) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("aaos_value_hypotheses")
        .delete()
        .eq("id", hyp.id);
      if (error) throw error;
      toast.success("Hypothesis deleted");
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const valueRange =
    hyp.estimated_monthly_value_low != null || hyp.estimated_monthly_value_high != null
      ? `£${hyp.estimated_monthly_value_low ?? "?"}–£${hyp.estimated_monthly_value_high ?? "?"} / month`
      : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{hyp.opportunity_name}</span>
              <ValueTypeBadge type={hyp.value_type} />
              <ConfidenceBadge level={hyp.confidence_level} />
            </div>
            {valueRange && (
              <p className="text-sm font-medium text-green-700">{valueRange}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive shrink-0"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {hyp.assumptions && (
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-0.5">
              Assumptions
            </div>
            <p className="text-sm whitespace-pre-wrap">{hyp.assumptions}</p>
          </div>
        )}
        {hyp.attribution_notes && (
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-0.5">
              Attribution notes
            </div>
            <p className="text-sm whitespace-pre-wrap">{hyp.attribution_notes}</p>
          </div>
        )}
        {hyp.commercial_trigger && (
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-0.5">
              Commercial trigger
            </div>
            <p className="text-sm">{hyp.commercial_trigger}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ValueHypothesesSection({ companyId }: { companyId: string }) {
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [oppName, setOppName] = useState("");
  const [valueType, setValueType] = useState<string>(VALUE_TYPES[0]);
  const [valueLow, setValueLow] = useState("");
  const [valueHigh, setValueHigh] = useState("");
  const [assumptions, setAssumptions] = useState("");
  const [confidence, setConfidence] = useState<string>(CONFIDENCE_LEVELS[1]);
  const [attribution, setAttribution] = useState("");
  const [trigger, setTrigger] = useState("");

  const { data: hypotheses = [], refetch } = useQuery({
    queryKey: ["aaos_value_hypotheses", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_value_hypotheses")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ValueHypothesis[];
    },
  });

  const handleAdd = async () => {
    if (!oppName.trim()) {
      toast.error("Opportunity name is required");
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase.from("aaos_value_hypotheses").insert({
        company_id: companyId,
        opportunity_name: oppName.trim(),
        value_type: valueType,
        estimated_monthly_value_low: parseNum(valueLow),
        estimated_monthly_value_high: parseNum(valueHigh),
        assumptions: assumptions.trim() || null,
        confidence_level: confidence,
        attribution_notes: attribution.trim() || null,
        commercial_trigger: trigger.trim() || null,
      });
      if (error) throw error;
      await logActivity({
        action: "value hypothesis added",
        summary: oppName.trim(),
        company_id: companyId,
        entity_type: "value_hypothesis",
      });
      toast.success("Value hypothesis added");
      setOppName("");
      setValueType(VALUE_TYPES[0]);
      setValueLow("");
      setValueHigh("");
      setAssumptions("");
      setConfidence(CONFIDENCE_LEVELS[1]);
      setAttribution("");
      setTrigger("");
      setShowForm(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Add failed");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Value Hypotheses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hypotheses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3">No value hypotheses yet.</p>
        ) : (
          <div className="space-y-3">
            {hypotheses.map((h) => (
              <HypothesisCard key={h.id} hyp={h} refetch={refetch} />
            ))}
          </div>
        )}

        {!showForm ? (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add value hypothesis
          </Button>
        ) : (
          <div className="space-y-3 border-t pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Opportunity name *</Label>
                <Input
                  value={oppName}
                  onChange={(e) => setOppName(e.target.value)}
                  placeholder="e.g. Automate invoice processing"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Value type</Label>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={valueType}
                  onChange={(e) => setValueType(e.target.value)}
                >
                  {VALUE_TYPES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Est. monthly value (low, £)</Label>
                <Input
                  type="number"
                  value={valueLow}
                  onChange={(e) => setValueLow(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Est. monthly value (high, £)</Label>
                <Input
                  type="number"
                  value={valueHigh}
                  onChange={(e) => setValueHigh(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Assumptions</Label>
              <Textarea
                value={assumptions}
                onChange={(e) => setAssumptions(e.target.value)}
                placeholder="Key assumptions behind this estimate…"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Confidence level</Label>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value)}
                >
                  {CONFIDENCE_LEVELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Commercial trigger</Label>
                <Input
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="e.g. Reaching £5m ARR"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Attribution notes</Label>
              <Textarea
                value={attribution}
                onChange={(e) => setAttribution(e.target.value)}
                placeholder="How would we attribute this value to our work?"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={adding}>
                {adding ? "Adding…" : "Add hypothesis"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main tab ────────────────────────────────────────────────────────────────

export function ValueLedgerTab({ companyId, company, refresh }: TabProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Value Ledger</h3>
      <KpisSection companyId={companyId} />
      <ValueHypothesesSection companyId={companyId} />
    </div>
  );
}
