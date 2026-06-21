// AI Alpha OS — opportunity prioritisation and risk scoring.
import type { Rag } from "./scoring";

export interface OppScoreInputs {
  value_potential_score?: number | null;
  urgency_score?: number | null;
  confidence_score?: number | null;
  strategic_fit_score?: number | null;
  effort_score?: number | null;
  risk_score?: number | null;
}

// priority = (value + urgency + confidence + strategic_fit) - (effort + risk)
export function computePriorityScore(i: OppScoreInputs): number {
  const v = Number(i.value_potential_score) || 0;
  const u = Number(i.urgency_score) || 0;
  const c = Number(i.confidence_score) || 0;
  const s = Number(i.strategic_fit_score) || 0;
  const e = Number(i.effort_score) || 0;
  const r = Number(i.risk_score) || 0;
  return v + u + c + s - e - r;
}

export function priorityExplain(i: OppScoreInputs): string {
  const v = Number(i.value_potential_score) || 0;
  const u = Number(i.urgency_score) || 0;
  const c = Number(i.confidence_score) || 0;
  const s = Number(i.strategic_fit_score) || 0;
  const e = Number(i.effort_score) || 0;
  const r = Number(i.risk_score) || 0;
  return `(${v}+${u}+${c}+${s}) − (${e}+${r}) = ${v + u + c + s - e - r}`;
}

export function priorityRag(score: number): Rag {
  if (score >= 12) return "green";
  if (score >= 6) return "amber";
  return "red";
}

// risk_score = likelihood × impact (each 1-5 -> 1..25)
export function computeRiskScore(likelihood?: number | null, impact?: number | null): number {
  return (Number(likelihood) || 0) * (Number(impact) || 0);
}

export function riskRag(score: number): Rag {
  if (score === 0) return "none";
  if (score >= 15) return "red";
  if (score >= 7) return "amber";
  return "green";
}

// KPI uplift; direction-aware not modelled — uplift = actual - baseline.
export function kpiUplift(baseline?: number | null, actual?: number | null): number | null {
  if (baseline == null || actual == null) return null;
  return Math.round((Number(actual) - Number(baseline)) * 100) / 100;
}
