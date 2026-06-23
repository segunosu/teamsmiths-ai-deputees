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
import { FOUR_PS, SCORE_LABELS_1_5 } from "../../constants";
import { compute4PsOverall } from "../../lib/scoring";
import { logActivity } from "../../lib/activity";
import { RagBadge, PreliminaryBadge } from "../RagBadge";
import type { Rag } from "../../lib/scoring";

// All sub-dimension keys across all 4Ps
const ALL_SUBS = FOUR_PS.flatMap((p) => p.subs.map((s) => s.key));
// Evidence note keys per P
const EVIDENCE_KEY: Record<string, string> = {
  primed: "primed_evidence_notes",
  principled: "principled_evidence_notes",
  practised: "practised_evidence_notes",
  protected: "protected_evidence_notes",
};
const SCORE_KEY: Record<string, string> = {
  primed: "primed_score",
  principled: "principled_score",
  practised: "practised_score",
  protected: "protected_score",
};
const BAND_KEY: Record<string, string> = {
  primed: "primed_band",
  principled: "principled_band",
  practised: "practised_band",
  protected: "protected_band",
};

type SubValues = Record<string, number>;
type EvidenceValues = Record<string, string>;

function buildInitialSubs(row: Record<string, any> | null | undefined): SubValues {
  const v: SubValues = {};
  for (const key of ALL_SUBS) {
    v[key] = row ? (row[key] ?? 1) : 1;
  }
  return v;
}

function buildInitialEvidence(row: Record<string, any> | null | undefined): EvidenceValues {
  const v: EvidenceValues = {};
  for (const p of FOUR_PS) {
    v[EVIDENCE_KEY[p.key]] = row ? (row[EVIDENCE_KEY[p.key]] ?? "") : "";
  }
  return v;
}

function ragLabel(rag: Rag, score: number): string {
  return `${score}/25 — ${rag === "green" ? "Strong" : rag === "amber" ? "Developing" : "Weak"}`;
}

export function FourPsTab({ companyId, company, refresh }: TabProps) {
  const qc = useQueryClient();

  const { data: row, isLoading } = useQuery({
    queryKey: ["aaos_four_ps_scores", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_four_ps_scores")
        .select("*")
        .eq("company_id", companyId)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [subValues, setSubValues] = useState<SubValues>(buildInitialSubs(null));
  const [evidence, setEvidence] = useState<EvidenceValues>(buildInitialEvidence(null));
  const [preliminary, setPreliminary] = useState(true);
  const [humanReview, setHumanReview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (row) {
      setSubValues(buildInitialSubs(row));
      setEvidence(buildInitialEvidence(row));
      setPreliminary(row.preliminary_flag ?? true);
      setHumanReview(row.human_review_required ?? false);
    }
  }, [row]);

  const { perP, perPBand, overall, overallBand } = compute4PsOverall(subValues);

  function setSubValue(key: string, val: number) {
    setSubValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        company_id: companyId,
        overall_4ps_score: overall,
        overall_4ps_band: overallBand,
        preliminary_flag: preliminary,
        human_review_required: humanReview,
        ...subValues,
      };

      for (const p of FOUR_PS) {
        payload[SCORE_KEY[p.key]] = perP[p.key];
        payload[BAND_KEY[p.key]] = perPBand[p.key];
        payload[EVIDENCE_KEY[p.key]] = evidence[EVIDENCE_KEY[p.key]] || null;
      }

      let error;
      if (row?.id) {
        ({ error } = await supabase
          .from("aaos_four_ps_scores")
          .update(payload)
          .eq("id", row.id));
      } else {
        ({ error } = await supabase.from("aaos_four_ps_scores").insert(payload as any));
      }
      if (error) throw error;

      await logActivity({
        action: "score updated",
        summary: `4Ps ${overall}/100`,
        company_id: companyId,
        entity_type: "fourps",
      });

      toast.success(`4Ps score saved: ${overall}/100`);
      qc.invalidateQueries({ queryKey: ["aaos_four_ps_scores", companyId] });
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to save 4Ps score");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading 4Ps score…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall score */}
      <Card>
        <CardHeader>
          <CardTitle>4Ps Overall Score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <span className="text-4xl font-bold">
            {overall}<span className="text-xl text-muted-foreground">/100</span>
          </span>
          <RagBadge rag={overallBand} label={overallBand === "green" ? "Strong" : overallBand === "amber" ? "Developing" : "Weak"} />
          {preliminary && <PreliminaryBadge />}
        </CardContent>
      </Card>

      {/* Per-P cards */}
      {FOUR_PS.map((p) => {
        const pScore = perP[p.key] ?? 0;
        const pRag = perPBand[p.key] ?? "red";
        const evidenceKey = EVIDENCE_KEY[p.key];
        const evidenceVal = evidence[evidenceKey] ?? "";
        const highScoreNoEvidence =
          p.subs.some((s) => (subValues[s.key] ?? 0) >= 4) && !evidenceVal.trim();

        return (
          <Card key={p.key}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle>{p.label}</CardTitle>
                <RagBadge rag={pRag} label={ragLabel(pRag, pScore)} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {p.subs.map((sub) => (
                  <div key={sub.key} className="space-y-1">
                    <Label htmlFor={`${p.key}-${sub.key}`}>{sub.label}</Label>
                    <select
                      id={`${p.key}-${sub.key}`}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={subValues[sub.key] ?? 1}
                      onChange={(e) => setSubValue(sub.key, Number(e.target.value))}
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

              <div className="space-y-1.5">
                <Label htmlFor={`evidence-${p.key}`}>Evidence notes</Label>
                {highScoreNoEvidence && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    Evidence notes recommended for scores of 4–5.
                  </p>
                )}
                <Textarea
                  id={`evidence-${p.key}`}
                  rows={2}
                  placeholder={`Supporting evidence for ${p.label}…`}
                  value={evidenceVal}
                  onChange={(e) =>
                    setEvidence((prev) => ({ ...prev, [evidenceKey]: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              id="preliminary-flag"
              type="checkbox"
              className="h-4 w-4 rounded border"
              checked={preliminary}
              onChange={(e) => setPreliminary(e.target.checked)}
            />
            <Label htmlFor="preliminary-flag">Preliminary assessment</Label>
            {preliminary && <PreliminaryBadge />}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="hr-fourps"
              type="checkbox"
              className="h-4 w-4 rounded border"
              checked={humanReview}
              onChange={(e) => setHumanReview(e.target.checked)}
            />
            <Label htmlFor="hr-fourps">Human review required</Label>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save 4Ps score
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
