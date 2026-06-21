import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Rag, RAG_CLASSES } from "../lib/scoring";

export function RagDot({ rag, className }: { rag: Rag; className?: string }) {
  const color =
    rag === "green" ? "bg-green-500" : rag === "amber" ? "bg-amber-500" : rag === "red" ? "bg-red-500" : "bg-muted-foreground/40";
  return <span className={cn("inline-block h-2.5 w-2.5 rounded-full", color, className)} />;
}

export function RagBadge({ rag, label, className }: { rag: Rag; label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", RAG_CLASSES[rag], className)}>
      <RagDot rag={rag} />
      {label}
    </span>
  );
}

export function HumanReviewBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800", className)}>
      <AlertTriangle className="h-3 w-3" />
      Requires Human Review
    </span>
  );
}

const REVIEW_CLASSES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  "needs human review": "bg-amber-100 text-amber-800 border-amber-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  sent: "bg-blue-100 text-blue-800 border-blue-300",
};

export function ReviewStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", REVIEW_CLASSES[status] || REVIEW_CLASSES.draft, className)}>
      {status}
    </span>
  );
}

export function PreliminaryBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800", className)}>
      Preliminary
    </span>
  );
}
