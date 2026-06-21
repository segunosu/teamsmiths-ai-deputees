import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { TabProps } from "../../pages/AlphaCompanyDetail";
import { FIT_DIMENSIONS, AUTOMATION_CATEGORIES } from "../../constants";
import { computeFitScore, fitBand, leverageFactor } from "../../lib/scoring";
import { logActivity } from "../../lib/activity";
import { RagBadge } from "../RagBadge";

type ScoreValues = Record<string, number | null | undefined>;

function buildInitialValues(row: Record<string, any> | null | undefined): ScoreValues {
  const v: ScoreValues = {};
  for (const d of FIT_DIMENSIONS) {
    v[d.key] = row ? (row[d.key] ?? null) : null;
  }
  return v;
}

export function ScoreTab({ companyId, company, refresh }: TabProps) {
  const qc = useQueryClient();

  const { data: row, isLoading } = useQuery({
    queryKey: ["aaos_company_scores", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_company_scores")
        .select("*")
        .eq("company_id", companyId)
        .order("last_scored_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [values, setValues] = useState<ScoreValues>(buildInitialValues(null));
  const [scoringNotes, setScoringNotes] = useState("");
  const [oldHours, setOldHours] = useState<string>("");
  const [newHours, setNewHours] = useState<string>("");
  const [automationCategory, setAutomationCategory] = useState<string>("");
  const [humanReview, setHumanReview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Seed form from loaded row
  useEffect(() => {
    if (row) {
      setValues(buildInitialValues(row));
      setScoringNotes(row.scoring_notes ?? "");
      setOldHours(row.old_manual_effort_hours != null ? String(row.old_manual_effort_hours) : "");
      setNewHours(row.new_ai_assisted_effort_hours != null ? String(row.new_ai_assisted_effort_hours) : "");
      setAutomationCategory(row.automation_category ?? "");
      setHumanReview(row.human_review_required ?? false);
    }
  }, [row]);

  const total = computeFitScore(values);
  const band = fitBand(total);
  const lf = leverageFactor(oldHours ? Number(oldHours) : null, newHours ? Number(newHours) : null);

  async function handleSave() {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const payload = {
        company_id: companyId,
        ai_alpha_fit_score: total,
        score_band: band.label,
        scoring_notes: scoringNotes || null,
        old_manual_effort_hours: oldHours ? Number(oldHours) : null,
        new_ai_assisted_effort_hours: newHours ? Number(newHours) : null,
        leverage_factor: lf,
        automation_category: automationCategory || null,
        human_review_required: humanReview,
        last_scored_at: now,
        ...Object.fromEntries(
          FIT_DIMENSIONS.map((d) => [d.key, values[d.key] != null ? Number(values[d.key]) : null])
        ),
      };

      let error;
      if (row?.id) {
        ({ error } = await supabase
          .from("aaos_company_scores")
          .update(payload)
          .eq("id", row.id));
      } else {
        ({ error } = await supabase.from("aaos_company_scores").insert(payload));
      }
      if (error) throw error;

      await logActivity({
        action: "score updated",
        summary: `AI Alpha Fit ${total}/100`,
        company_id: companyId,
        entity_type: "score",
      });

      toast.success(`AI Alpha Fit score saved: ${total}/100`);
      qc.invalidateQueries({ queryKey: ["aaos_company_scores", companyId] });
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to save score");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading score…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live score summary */}
      <Card>
        <CardHeader>
          <CardTitle>AI Alpha Fit Score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <span className="text-4xl font-bold">{total}<span className="text-xl text-muted-foreground">/100</span></span>
          <RagBadge rag={band.rag} label={band.label} />
        </CardContent>
      </Card>

      {/* Dimension inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Dimension Scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIT_DIMENSIONS.map((d) => (
            <div key={d.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor={`dim-${d.key}`}>{d.label}</Label>
                <span className="text-xs text-muted-foreground">max {d.max}</span>
              </div>
              <p className="text-xs text-muted-foreground">{d.hint}</p>
              <Input
                id={`dim-${d.key}`}
                type="number"
                min={0}
                max={d.max}
                value={values[d.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [d.key]: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Effort & automation */}
      <Card>
        <CardHeader>
          <CardTitle>Effort Leverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="old-hours">Old manual effort (hours)</Label>
              <Input
                id="old-hours"
                type="number"
                min={0}
                value={oldHours}
                onChange={(e) => setOldHours(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-hours">New AI-assisted effort (hours)</Label>
              <Input
                id="new-hours"
                type="number"
                min={0}
                value={newHours}
                onChange={(e) => setNewHours(e.target.value)}
              />
            </div>
          </div>
          {lf != null && (
            <p className="text-sm font-medium">
              Leverage: <span className="text-green-700">×{lf}</span>
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="automation-category">Automation category</Label>
            <select
              id="automation-category"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={automationCategory}
              onChange={(e) => setAutomationCategory(e.target.value)}
            >
              <option value="">— select —</option>
              {AUTOMATION_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
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
            <Label htmlFor="scoring-notes">Scoring notes</Label>
            <Textarea
              id="scoring-notes"
              rows={3}
              placeholder="Observations, caveats, rationale…"
              value={scoringNotes}
              onChange={(e) => setScoringNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="hr-score"
              type="checkbox"
              className="h-4 w-4 rounded border"
              checked={humanReview}
              onChange={(e) => setHumanReview(e.target.checked)}
            />
            <Label htmlFor="hr-score">Human review required</Label>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save score
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
