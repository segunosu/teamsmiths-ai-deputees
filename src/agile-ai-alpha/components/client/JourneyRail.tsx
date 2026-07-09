import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Journey stepper + "Next best action" for the client workspace.
 * Derives progress from record counts only (head:true) — no data duplication,
 * no writes, spine-safe (see ARCHITECTURE.md vertical spine).
 */

export interface JourneyProgress {
  hasDiagnostic: boolean;
  hasOpportunities: boolean;
  hasSprints: boolean;
  hasGovernance: boolean;
  hasValue: boolean;
}

async function count(table: "aaos_diagnostics" | "aaos_ai_opportunities" | "aaos_sprints" | "aaos_governance_risks" | "aaos_evidence_items" | "aaos_value_ledger", clientId: string) {
  const { count: n } = await supabase.from(table).select("id", { count: "exact", head: true }).eq("client_id", clientId);
  return n ?? 0;
}

export function useJourneyProgress(clientId: string | undefined) {
  return useQuery({
    queryKey: ["aaos_journey", clientId],
    enabled: !!clientId,
    queryFn: async (): Promise<JourneyProgress> => {
      const [diag, opps, sprints, risks, evidence, value] = await Promise.all([
        count("aaos_diagnostics", clientId!),
        count("aaos_ai_opportunities", clientId!),
        count("aaos_sprints", clientId!),
        count("aaos_governance_risks", clientId!),
        count("aaos_evidence_items", clientId!),
        count("aaos_value_ledger", clientId!),
      ]);
      return {
        hasDiagnostic: diag > 0,
        hasOpportunities: opps > 0,
        hasSprints: sprints > 0,
        hasGovernance: risks + evidence > 0,
        hasValue: value > 0,
      };
    },
  });
}

const STEPS: { label: string; key: keyof JourneyProgress | "client"; tab: string }[] = [
  { label: "Prospect", key: "client", tab: "overview" },
  { label: "Diagnose", key: "hasDiagnostic", tab: "diagnostic" },
  { label: "Deliver", key: "hasSprints", tab: "sprints" },
  { label: "Govern", key: "hasGovernance", tab: "governance" },
  { label: "Prove value", key: "hasValue", tab: "value" },
];

export function JourneyStepper({ progress, onGo }: { progress?: JourneyProgress; onGo: (tab: string) => void }) {
  const done = (k: (typeof STEPS)[number]["key"]) => (k === "client" ? true : !!progress?.[k]);
  const currentIdx = STEPS.findIndex((s) => !done(s.key));
  return (
    <div className="mb-4 flex overflow-hidden rounded-xl border bg-background">
      {STEPS.map((s, i) => {
        const isDone = done(s.key);
        const isCurrent = i === currentIdx;
        return (
          <button
            key={s.label}
            onClick={() => onGo(s.tab)}
            className={cn(
              "flex-1 px-2 py-2.5 text-center text-xs sm:text-sm transition-colors",
              isCurrent ? "bg-primary/10 font-semibold text-primary" : isDone ? "text-emerald-600" : "text-muted-foreground",
              i > 0 && "border-l",
            )}
          >
            <span className="mr-1 hidden text-[10px] uppercase tracking-wide opacity-60 sm:inline">{i + 1}</span>
            {s.label}
            {isDone && <Check className="ml-1 inline h-3.5 w-3.5" />}
          </button>
        );
      })}
    </div>
  );
}

export function NextBestAction({ progress, onGo }: { progress?: JourneyProgress; onGo: (tab: string) => void }) {
  if (!progress) return null;
  const action = !progress.hasDiagnostic
    ? { text: "Run the AI Alpha Diagnostic — everything downstream hangs off it.", cta: "Start diagnostic", tab: "diagnostic" }
    : !progress.hasOpportunities
      ? { text: "Turn the diagnostic into scored AI opportunities.", cta: "Map opportunities", tab: "opportunities" }
      : !progress.hasSprints
        ? { text: "Plan the first delivery sprint from the top opportunity.", cta: "Plan sprint", tab: "sprints" }
        : !progress.hasGovernance
          ? { text: "Stand up governance: log risks and start collecting evidence.", cta: "Open governance", tab: "governance" }
          : !progress.hasValue
            ? { text: "Log measured value in the ledger — estimated vs validated, with assumptions.", cta: "Log value", tab: "value" }
            : { text: "Spine complete. Generate a client report or capture a portfolio pattern.", cta: "Generate report", tab: "reports" };
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-l-4 border-l-primary bg-background p-3.5">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next best action</div>
        <div className="truncate text-sm">{action.text}</div>
      </div>
      <Button size="sm" onClick={() => onGo(action.tab)}>
        {action.cta} <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
