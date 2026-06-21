import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { TabProps } from "../../pages/AlphaCompanyDetail";
import { AGILE_DIMENSIONS, SCORE_LABELS_1_5 } from "../../constants";
import { computeAgileScore, agileBand } from "../../lib/scoring";
import { logActivity } from "../../lib/activity";
import { RagBadge, PreliminaryBadge } from "../RagBadge";

type AgileValues = Record<string, number>;

function buildInitialValues(row: Record<string, any> | null | undefined): AgileValues {
  const v: AgileValues = {};
  for (const d of AGILE_DIMENSIONS) {
    v[d.key] = row ? (row[d.key] ?? 1) : 1;
  }
  return v;
}

export function AgileTab({ companyId, company, refresh }: TabProps) {
  const qc = useQueryClient();

  const { data: row, isLoading } = useQuery({
    queryKey: ["aaos_agile_scores", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_agile_ai_scores")
        .select("*")
        .eq("company_id", companyId)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [values, setValues] = useState<AgileValues>(buildInitialValues(null));
  const [notes, setNotes] = useState("");
  const [preliminary, setPreliminary] = useState(true);
  const [humanReview, setHumanReview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (row) {
      setValues(buildInitialValues(row));
      setNotes(row.agile_ai_notes ?? "");
      setPreliminary(row.preliminary_flag ?? true);
      setHumanReview(row.human_review_required ?? false);
    }
  }, [row]);

  const total = computeAgileScore(values);
  const band = agileBand(total);

  function setValue(key: string, val: number) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        company_id: companyId,
        agile_ai_maturity_score: total,
        agile_ai_maturity_band: band.label,
        agile_ai_notes: notes || null,
        preliminary_flag: preliminary,
        human_review_required: humanReview,
        ...values,
      };

      let error;
      if (row?.id) {
        ({ error } = await supabase
          .from("aaos_agile_ai_scores")
          .update(payload)
          .eq("id", row.id));
      } else {
        ({ error } = await supabase.from("aaos_agile_ai_scores").insert(payload));
      }
      if (error) throw error;

      await logActivity({
        action: "score updated",
        summary: `Agile AI ${total}`,
        company_id: companyId,
        entity_type: "agile",
      });

      toast.success(`Agile AI score saved: ${total}`);
      qc.invalidateQueries({ queryKey: ["aaos_agile_scores", companyId] });
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to save Agile AI score");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading Agile AI score…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live score */}
      <Card>
        <CardHeader>
          <CardTitle>Agile AI Maturity Score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <span className="text-4xl font-bold">
            {total}<span className="text-xl text-muted-foreground">/35</span>
          </span>
          <RagBadge rag={band.rag} label={band.label} />
          {preliminary && <PreliminaryBadge />}
        </CardContent>
      </Card>

      {/* Dimension selects */}
      <Card>
        <CardHeader>
          <CardTitle>Dimensions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AGILE_DIMENSIONS.map((d) => (
              <div key={d.key} className="space-y-1.5">
                <Label htmlFor={`agile-${d.key}`}>{d.label}</Label>
                <select
                  id={`agile-${d.key}`}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={values[d.key] ?? 1}
                  onChange={(e) => setValue(d.key, Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} · {SCORE_LABELS_1_5[n]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes & flags */}
      <Card>
        <CardHeader>
          <CardTitle>Notes &amp; Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="agile-notes">Notes</Label>
            <Textarea
              id="agile-notes"
              rows={3}
              placeholder="Observations, caveats, rationale…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="agile-preliminary"
              type="checkbox"
              className="h-4 w-4 rounded border"
              checked={preliminary}
              onChange={(e) => setPreliminary(e.target.checked)}
            />
            <Label htmlFor="agile-preliminary">Preliminary assessment</Label>
            {preliminary && <PreliminaryBadge />}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="agile-hr"
              type="checkbox"
              className="h-4 w-4 rounded border"
              checked={humanReview}
              onChange={(e) => setHumanReview(e.target.checked)}
            />
            <Label htmlFor="agile-hr">Human review required</Label>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Agile AI score
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
