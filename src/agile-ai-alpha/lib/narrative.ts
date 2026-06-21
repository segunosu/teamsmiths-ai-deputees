// AI Alpha OS — Narrative Intelligence Layer.
// "Analyse Observation" turns a freeform note into STRUCTURED SUGGESTIONS.
// Nothing is auto-applied; suggestions go to a review panel (Accept/Edit/Reject).
// Rule-based for MVP; swap for AI behind the same interface later.
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "./activity";
import type { NarrativeNote } from "../spineTypes";

interface SuggestionDraft {
  suggested_item_type: string;
  suggested_title: string;
  reasoning: string;
  confidence_level: "low" | "medium" | "high";
  related_four_p_dimension?: string | null;
  related_kpi?: string | null;
}

const RULES: Record<string, (n: NarrativeNote) => SuggestionDraft[]> = {
  "pain point": (n) => [
    { suggested_item_type: "ai opportunity", suggested_title: `Address: ${n.observation_title || "pain point"}`, reasoning: "A described pain point is a candidate AI value opportunity.", confidence_level: "medium" },
    { suggested_item_type: "signal", suggested_title: `Pain signal: ${n.observation_title || "noted"}`, reasoning: "Capture as a structured signal for scoring.", confidence_level: "medium" },
  ],
  "opportunity": (n) => [
    { suggested_item_type: "ai opportunity", suggested_title: n.observation_title || "New AI opportunity", reasoning: "The observation explicitly describes an opportunity.", confidence_level: "high" },
  ],
  "risk": (n) => [
    { suggested_item_type: "risk", suggested_title: n.observation_title || "Governance risk", reasoning: "A described risk should be tracked in the governance register.", confidence_level: "high", related_four_p_dimension: "protected" },
  ],
  "governance concern": (n) => [
    { suggested_item_type: "risk", suggested_title: n.observation_title || "Governance concern", reasoning: "Track as a governance risk.", confidence_level: "medium", related_four_p_dimension: "principled" },
    { suggested_item_type: "governance evidence gap", suggested_title: "Evidence gap", reasoning: "A governance concern usually implies missing evidence.", confidence_level: "medium", related_four_p_dimension: "protected" },
  ],
  "data concern": (n) => [
    { suggested_item_type: "governance evidence gap", suggested_title: "Data readiness evidence gap", reasoning: "Data concerns map to Primed/Protected evidence.", confidence_level: "medium", related_four_p_dimension: "primed" },
    { suggested_item_type: "risk", suggested_title: n.observation_title || "Data quality risk", reasoning: "Track as a data-quality risk.", confidence_level: "medium" },
  ],
  "delivery concern": (n) => [
    { suggested_item_type: "sprint story", suggested_title: `Resolve: ${n.observation_title || "delivery concern"}`, reasoning: "A delivery concern can become a sprint story.", confidence_level: "medium" },
  ],
  "commercial concern": (n) => [
    { suggested_item_type: "monetisation concern", suggested_title: n.observation_title || "Commercial concern", reasoning: "Flag for the monetisation review (human review required).", confidence_level: "medium" },
  ],
  "KPI/value note": (n) => [
    { suggested_item_type: "KPI hypothesis", suggested_title: n.observation_title || "KPI hypothesis", reasoning: "A value note implies a measurable KPI.", confidence_level: "medium", related_kpi: n.observation_title || null },
  ],
  "stakeholder dynamic": (n) => [
    { suggested_item_type: "stakeholder action", suggested_title: n.observation_title || "Stakeholder action", reasoning: "Stakeholder dynamics often need a follow-up action.", confidence_level: "low" },
  ],
  "sprint retrospective": (n) => [
    { suggested_item_type: "portfolio pattern", suggested_title: n.observation_title || "Reusable pattern", reasoning: "Retrospective insight may be a reusable, anonymisable pattern.", confidence_level: "low" },
  ],
  "client situation": (n) => [
    { suggested_item_type: "signal", suggested_title: n.observation_title || "Client situation", reasoning: "Capture context as a signal.", confidence_level: "low" },
  ],
};

export async function analyseNarrativeObservation(note: NarrativeNote) {
  const rule = RULES[note.observation_type || "general observation"];
  const drafts = rule ? rule(note) : [
    { suggested_item_type: "signal", suggested_title: note.observation_title || "Observation", reasoning: "Captured as a general signal for review.", confidence_level: "low" as const },
  ];
  const rows = drafts.map((d) => ({
    narrative_note_id: note.id,
    suggested_item_type: d.suggested_item_type,
    suggested_title: d.suggested_title,
    reasoning: d.reasoning,
    confidence_level: d.confidence_level,
    related_four_p_dimension: d.related_four_p_dimension ?? null,
    related_kpi: d.related_kpi ?? null,
    review_status: "pending",
  }));
  const { data } = await supabase.from("aaos_narrative_suggestions").insert(rows).select();
  await supabase.from("aaos_narrative_notes").update({ ai_extraction_status: "analysed" }).eq("id", note.id);
  await logActivity({ action: "observation analysed", summary: `${rows.length} suggestion(s) from a narrative note`, company_id: note.company_id, client_id: note.client_id, entity_type: "narrative", entity_id: note.id });
  return data;
}
