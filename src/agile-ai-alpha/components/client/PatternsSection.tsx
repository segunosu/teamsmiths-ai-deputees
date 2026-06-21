import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { PATTERN_TYPES } from "../../spineConstants";
import { generatePortfolioPattern } from "../../lib/alphaGen";
import { GenerateButton } from "../spineUi";
import { logActivity } from "../../lib/activity";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";

export function PatternsSection({ client, refresh }: SectionProps) {
  const qc = useQueryClient();

  const { data: patterns, refetch } = useQuery({
    queryKey: ["aaos_portfolio_patterns", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_portfolio_patterns")
        .select("*")
        .eq("source_client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const onDone = () => {
    refetch();
    refresh();
    qc.invalidateQueries({ queryKey: ["aaos_portfolio_patterns", client.id] });
  };

  // ---- Add form state ----
  const [patternTitle, setPatternTitle] = useState("");
  const [patternType, setPatternType] = useState<string>(PATTERN_TYPES[0]);
  const [summary, setSummary] = useState("");
  const [playbook, setPlaybook] = useState("");
  const [anonymised, setAnonymised] = useState(true);
  const [confidence, setConfidence] = useState<string>("medium");
  const [adding, setAdding] = useState(false);

  const savePattern = async () => {
    if (!patternTitle.trim()) { toast.error("Pattern title is required"); return; }
    setAdding(true);
    try {
      const { data, error } = await supabase.from("aaos_portfolio_patterns").insert({
        source_client_id: client.id,
        pattern_title: patternTitle.trim(),
        pattern_type: patternType || null,
        summary: summary || null,
        reusable_playbook: playbook || null,
        anonymised,
        confidence_level: confidence || null,
      }).select().single();
      if (error) throw error;
      await logActivity({ action: "pattern added", summary: `Pattern "${patternTitle}" captured`, client_id: client.id, entity_type: "pattern", entity_id: data?.id });
      toast.success("Pattern captured");
      setPatternTitle(""); setSummary(""); setPlaybook("");
      setPatternType(PATTERN_TYPES[0]); setAnonymised(true); setConfidence("medium");
      onDone();
    } catch (e: any) { toast.error(e.message || "Failed to add pattern"); }
    finally { setAdding(false); }
  };

  const deletePattern = async (id: string) => {
    if (!window.confirm("Delete this pattern?")) return;
    const { error } = await supabase.from("aaos_portfolio_patterns").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refetch();
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <GenerateButton
          label="Capture pattern"
          onRun={() => generatePortfolioPattern(client)}
          onDone={onDone}
        />
      </div>

      {/* Muted note */}
      <p className="text-xs text-muted-foreground">
        Patterns are anonymised by default; never expose confidential client detail.
      </p>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Portfolio Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-md p-3 bg-muted/20">
            <div className="sm:col-span-2">
              <Label className="text-xs">Pattern Title *</Label>
              <Input value={patternTitle} onChange={(e) => setPatternTitle(e.target.value)} placeholder="Pattern title" />
            </div>
            <div>
              <Label className="text-xs">Pattern Type</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={patternType} onChange={(e) => setPatternType(e.target.value)}>
                {PATTERN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Confidence Level</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={confidence} onChange={(e) => setConfidence(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Summary</Label>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief summary of the pattern" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Reusable Playbook</Label>
              <Textarea value={playbook} onChange={(e) => setPlaybook(e.target.value)} placeholder="Step-by-step reusable playbook…" rows={4} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymised"
                checked={anonymised}
                onChange={(e) => setAnonymised(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="anonymised" className="text-xs cursor-pointer">Anonymised (recommended)</Label>
            </div>
            <div className="sm:col-span-2">
              <Button size="sm" onClick={savePattern} disabled={adding}>
                {adding ? "Saving…" : "Add Pattern"}
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {(patterns || []).length === 0 && <p className="text-sm text-muted-foreground">No patterns captured yet.</p>}
            {(patterns || []).map((p: any) => (
              <Card key={p.id} className="border">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">{p.pattern_title}</span>
                      {p.pattern_type && (
                        <span className="text-xs text-muted-foreground">{p.pattern_type}</span>
                      )}
                      {p.anonymised ? (
                        <span className="inline-flex items-center rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          anonymised
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          identifiable
                        </span>
                      )}
                      {p.confidence_level && (
                        <span className="text-xs text-muted-foreground capitalize">{p.confidence_level} confidence</span>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => deletePattern(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {p.summary && <p className="text-sm text-muted-foreground">{p.summary}</p>}
                  {p.reusable_playbook && (
                    <div className="rounded-md border bg-muted/10 p-3">
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Reusable Playbook</p>
                      <p className="text-sm whitespace-pre-wrap">{p.reusable_playbook}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
