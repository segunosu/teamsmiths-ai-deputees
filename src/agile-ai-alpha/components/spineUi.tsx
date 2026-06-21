import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Async action button with a spinner + toast + error handling. */
export function GenerateButton({
  label, onRun, onDone, variant = "default", size = "sm", icon = true, className,
}: {
  label: string;
  onRun: () => Promise<any>;
  onDone?: () => void;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default";
  icon?: boolean;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant={variant as any}
      size={size as any}
      className={className}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try { await onRun(); toast.success(`${label} done`); onDone?.(); }
        catch (e: any) { toast.error(e?.message || `${label} failed`); }
        finally { setBusy(false); }
      }}
    >
      {icon && <Sparkles className="h-4 w-4 mr-1" />}
      {busy ? "Working…" : label}
    </Button>
  );
}

const STATUS_COLORS: Record<string, string> = {
  // greens
  Active: "bg-green-100 text-green-800 border-green-300", Approved: "bg-green-100 text-green-800 border-green-300",
  Done: "bg-green-100 text-green-800 border-green-300", Complete: "bg-green-100 text-green-800 border-green-300",
  Current: "bg-green-100 text-green-800 border-green-300", Operating: "bg-green-100 text-green-800 border-green-300",
  Delivered: "bg-green-100 text-green-800 border-green-300", Paid: "bg-green-100 text-green-800 border-green-300",
  // ambers / review
  "Needs Review": "bg-amber-100 text-amber-800 border-amber-300", "Needs Human Review": "bg-amber-100 text-amber-800 border-amber-300",
  "Ready for Review": "bg-amber-100 text-amber-800 border-amber-300", "At Risk": "bg-amber-100 text-amber-800 border-amber-300",
  "In Progress": "bg-amber-100 text-amber-800 border-amber-300", Review: "bg-amber-100 text-amber-800 border-amber-300",
  "Human Review Required": "bg-amber-100 text-amber-800 border-amber-300", Pending: "bg-amber-100 text-amber-800 border-amber-300",
  Triggered: "bg-amber-100 text-amber-800 border-amber-300", "Selected for Sprint": "bg-amber-100 text-amber-800 border-amber-300",
  // reds
  Rejected: "bg-red-100 text-red-800 border-red-300", Blocked: "bg-red-100 text-red-800 border-red-300",
  Missing: "bg-red-100 text-red-800 border-red-300", Disputed: "bg-red-100 text-red-800 border-red-300",
  Stale: "bg-red-100 text-red-800 border-red-300", Cancelled: "bg-red-100 text-red-800 border-red-300",
  // blues
  Shared: "bg-blue-100 text-blue-800 border-blue-300", Sent: "bg-blue-100 text-blue-800 border-blue-300",
};

export function StatusPill({ status, className }: { status?: string | null; className?: string }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", STATUS_COLORS[status] || "bg-muted text-muted-foreground border-border", className)}>
      {status}
    </span>
  );
}

/** Labelled read-only field. */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="text-sm whitespace-pre-wrap">{children ?? "—"}</div>
    </div>
  );
}
