import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, ExternalLink } from "lucide-react";
import type { TabProps } from "../../pages/AlphaCompanyDetail";
import { SIGNAL_TYPES, SIGNAL_STRENGTHS } from "../../constants";
import { logActivity } from "../../lib/activity";
import { RagDot } from "../RagBadge";
import type { Rag } from "../../lib/scoring";

function strengthToRag(strength: string | null | undefined): Rag {
  if (strength === "strong") return "green";
  if (strength === "medium") return "amber";
  if (strength === "weak") return "red";
  return "none";
}

const STRENGTH_LABEL_CLASS: Record<string, string> = {
  strong: "bg-green-100 text-green-800 border border-green-300",
  medium: "bg-amber-100 text-amber-800 border border-amber-300",
  weak: "bg-muted text-muted-foreground border border-border",
};

export function SignalsTab({ companyId, company, refresh }: TabProps) {
  const qc = useQueryClient();

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ["aaos_signals", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_company_signals")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Form state
  const [signalType, setSignalType] = useState<string>(SIGNAL_TYPES[0]);
  const [signalSummary, setSignalSummary] = useState("");
  const [signalUrl, setSignalUrl] = useState("");
  const [signalStrength, setSignalStrength] = useState<string>("medium");
  const [implication, setImplication] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!signalSummary.trim()) {
      toast.error("Signal summary is required.");
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase.from("aaos_company_signals").insert({
        company_id: companyId,
        signal_type: signalType,
        signal_summary: signalSummary,
        signal_url: signalUrl || null,
        signal_strength: signalStrength,
        implication: implication || null,
        evidence_notes: evidenceNotes || null,
      });
      if (error) throw error;
      await logActivity({
        action: "signal added",
        summary: `${signalType} signal added`,
        company_id: companyId,
        entity_type: "signal",
      });
      toast.success("Signal added.");
      qc.invalidateQueries({ queryKey: ["aaos_signals", companyId] });
      refresh();
      // Reset form
      setSignalSummary("");
      setSignalUrl("");
      setImplication("");
      setEvidenceNotes("");
    } catch (e: any) {
      toast.error(e.message || "Failed to add signal");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("aaos_company_signals")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Signal deleted.");
      qc.invalidateQueries({ queryKey: ["aaos_signals", companyId] });
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete signal");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add signal form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Signal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="signal-type">Type</Label>
              <select
                id="signal-type"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={signalType}
                onChange={(e) => setSignalType(e.target.value)}
              >
                {SIGNAL_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signal-strength">Strength</Label>
              <select
                id="signal-strength"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={signalStrength}
                onChange={(e) => setSignalStrength(e.target.value)}
              >
                {SIGNAL_STRENGTHS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signal-summary">Summary</Label>
            <Input
              id="signal-summary"
              placeholder="Brief summary of the signal…"
              value={signalSummary}
              onChange={(e) => setSignalSummary(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signal-url">Source URL</Label>
            <Input
              id="signal-url"
              placeholder="https://…"
              value={signalUrl}
              onChange={(e) => setSignalUrl(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="implication">Implication</Label>
            <Input
              id="implication"
              placeholder="What does this signal imply?"
              value={implication}
              onChange={(e) => setImplication(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="evidence-notes">Evidence notes</Label>
            <Textarea
              id="evidence-notes"
              rows={2}
              placeholder="Supporting evidence or notes…"
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
            />
          </div>

          <Button onClick={handleAdd} disabled={adding}>
            {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add signal
          </Button>
        </CardContent>
      </Card>

      {/* Signal list */}
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading signals…
          </div>
        )}
        {!isLoading && signals.length === 0 && (
          <p className="text-sm text-muted-foreground">No signals recorded yet.</p>
        )}
        {signals.map((sig) => (
          <Card key={sig.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{sig.signal_summary}</span>
                    <span className="rounded border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {sig.signal_type}
                    </span>
                    {sig.signal_strength && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STRENGTH_LABEL_CLASS[sig.signal_strength] ?? ""}`}
                      >
                        <RagDot rag={strengthToRag(sig.signal_strength)} />
                        {sig.signal_strength}
                      </span>
                    )}
                  </div>
                  {sig.implication && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Implication:</span> {sig.implication}
                    </p>
                  )}
                  {sig.evidence_notes && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Evidence:</span> {sig.evidence_notes}
                    </p>
                  )}
                  {sig.signal_url && (
                    <a
                      href={sig.signal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      Source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-red-600"
                  disabled={deletingId === sig.id}
                  onClick={() => handleDelete(sig.id)}
                >
                  {deletingId === sig.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
