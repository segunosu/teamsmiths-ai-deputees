// AI Alpha OS — deterministic scoring engines.
import { FIT_DIMENSIONS, FOUR_PS, AGILE_DIMENSIONS } from "../constants";

export type Rag = "red" | "amber" | "green" | "none";

export const RAG_CLASSES: Record<Rag, string> = {
  green: "bg-green-100 text-green-800 border-green-300",
  amber: "bg-amber-100 text-amber-800 border-amber-300",
  red: "bg-red-100 text-red-800 border-red-300",
  none: "bg-muted text-muted-foreground border-border",
};

// ---------------- AI Alpha Fit Score ----------------
export function computeFitScore(values: Record<string, number | null | undefined>): number {
  return FIT_DIMENSIONS.reduce((sum, d) => sum + (Number(values[d.key]) || 0), 0);
}

export function fitBand(total: number): { label: string; rag: Rag } {
  if (total >= 80) return { label: "Priority Target", rag: "green" };
  if (total >= 70) return { label: "Good Target", rag: "green" };
  if (total >= 60) return { label: "Nurture", rag: "amber" };
  return { label: "Reject or Low Priority", rag: "red" };
}

// ---------------- 4Ps Governance Score ----------------
export function computePScore(values: Record<string, number | null | undefined>, pKey: string): number {
  const def = FOUR_PS.find((p) => p.key === pKey);
  if (!def) return 0;
  return def.subs.reduce((sum, s) => sum + (Number(values[s.key]) || 0), 0);
}

export function pBand(score: number): Rag {
  if (score >= 20) return "green";
  if (score >= 13) return "amber";
  return "red";
}

export function compute4PsOverall(values: Record<string, number | null | undefined>): {
  perP: Record<string, number>;
  perPBand: Record<string, Rag>;
  overall: number;
  overallBand: Rag;
} {
  const perP: Record<string, number> = {};
  const perPBand: Record<string, Rag> = {};
  for (const p of FOUR_PS) {
    perP[p.key] = computePScore(values, p.key);
    perPBand[p.key] = pBand(perP[p.key]);
  }
  const overall = Object.values(perP).reduce((a, b) => a + b, 0);
  let overallBand: Rag = "red";
  if (overall >= 77) overallBand = "green";
  else if (overall >= 52) overallBand = "amber";
  return { perP, perPBand, overall, overallBand };
}

// ---------------- Agile AI Maturity Score ----------------
export function computeAgileScore(values: Record<string, number | null | undefined>): number {
  return AGILE_DIMENSIONS.reduce((sum, d) => sum + (Number(values[d.key]) || 0), 0);
}

export function agileBand(total: number): { label: string; rag: Rag } {
  // 7 dimensions, each 1-5 → 7..35
  if (total >= 26) return { label: "Green — ready for AI-amplified delivery", rag: "green" };
  if (total >= 16) return { label: "Amber — usable but needs discipline", rag: "amber" };
  return { label: "Red — weak operating base", rag: "red" };
}

// ---------------- Helpers ----------------
export function ragToText(rag: Rag): string {
  return rag === "none" ? "—" : rag.charAt(0).toUpperCase() + rag.slice(1);
}

export function leverageFactor(oldHours?: number | null, newHours?: number | null): number | null {
  const o = Number(oldHours);
  const n = Number(newHours);
  if (!o || !n) return null;
  return Math.round((o / n) * 10) / 10;
}
