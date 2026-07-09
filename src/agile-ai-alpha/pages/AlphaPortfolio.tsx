import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlphaLayout } from "../components/AlphaLayout";
import { SectionSwitch, PLAYBOOK_TABS } from "../components/SectionSwitch";
import { PATTERN_TYPES } from "../spineConstants";
import { logActivity } from "../lib/activity";

const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
const COMPANY_SIZE_BANDS = ["Micro (<10)", "Small (10-49)", "Medium (50-249)", "Large (250+)"] as const;

export default function AlphaPortfolio() {
  const qc = useQueryClient();

  // Pattern form state
  const [pTitle, setPTitle] = useState("");
  const [pType, setPType] = useState<string>("");
  const [pSector, setPSector] = useState("");
  const [pSizeBand, setPSizeBand] = useState("");
  const [pSummary, setPSummary] = useState("");
  const [pPlaybook, setPPlaybook] = useState("");
  const [pAnon, setPAnon] = useState(true);
  const [pConf, setPConf] = useState<string>("medium");
  const [pSaving, setPSaving] = useState(false);

  // Benchmark form state
  const [bName, setBName] = useState("");
  const [bSector, setBSector] = useState("");
  const [bSizeBand, setBSizeBand] = useState("");
  const [bMetric, setBMetric] = useState("");
  const [bLow, setBLow] = useState("");
  const [bMedian, setBMedian] = useState("");
  const [bHigh, setBHigh] = useState("");
  const [bSample, setBSample] = useState("");
  const [bConf, setBConf] = useState<string>("medium");
  const [bNotes, setBNotes] = useState("");
  const [bSaving, setBSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["aaos_portfolio"],
    queryFn: async () => {
      const [patterns, benchmarks] = await Promise.all([
        supabase.from("aaos_portfolio_patterns").select("*").order("created_at", { ascending: false }),
        supabase.from("aaos_benchmarks").select("*").order("created_at", { ascending: false }),
      ]);
      return {
        patterns: patterns.data || [],
        benchmarks: benchmarks.data || [],
      };
    },
  });

  async function addPattern() {
    if (!pTitle.trim()) { toast.error("Pattern title is required"); return; }
    setPSaving(true);
    try {
      const { error } = await supabase.from("aaos_portfolio_patterns").insert({
        pattern_title: pTitle.trim(),
        pattern_type: pType || null,
        sector: pSector || null,
        company_size_band: pSizeBand || null,
        summary: pSummary || null,
        reusable_playbook: pPlaybook || null,
        anonymised: pAnon,
        confidence_level: pConf || null,
      });
      if (error) throw error;
      await logActivity({
        action: "portfolio pattern added",
        summary: `Added pattern: ${pTitle}`,
      });
      toast.success("Pattern added");
      setPTitle(""); setPType(""); setPSector(""); setPSizeBand("");
      setPSummary(""); setPPlaybook(""); setPAnon(true); setPConf("medium");
      qc.invalidateQueries({ queryKey: ["aaos_portfolio"] });
    } catch (e: any) {
      toast.error(e?.message || "Failed to add pattern");
    } finally {
      setPSaving(false);
    }
  }

  async function deletePattern(id: string) {
    const { error } = await supabase.from("aaos_portfolio_patterns").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Pattern deleted");
    qc.invalidateQueries({ queryKey: ["aaos_portfolio"] });
  }

  async function addBenchmark() {
    if (!bName.trim()) { toast.error("Benchmark name is required"); return; }
    setBSaving(true);
    try {
      const { error } = await supabase.from("aaos_benchmarks").insert({
        benchmark_name: bName.trim(),
        sector: bSector || null,
        company_size_band: bSizeBand || null,
        metric_name: bMetric || null,
        low_value: bLow ? Number(bLow) : null,
        median_value: bMedian ? Number(bMedian) : null,
        high_value: bHigh ? Number(bHigh) : null,
        sample_size: bSample ? Number(bSample) : null,
        confidence_level: bConf || null,
        notes: bNotes || null,
      });
      if (error) throw error;
      toast.success("Benchmark added");
      setBName(""); setBSector(""); setBSizeBand(""); setBMetric("");
      setBLow(""); setBMedian(""); setBHigh(""); setBSample(""); setBConf("medium"); setBNotes("");
      qc.invalidateQueries({ queryKey: ["aaos_portfolio"] });
    } catch (e: any) {
      toast.error(e?.message || "Failed to add benchmark");
    } finally {
      setBSaving(false);
    }
  }

  async function deleteBenchmark(id: string) {
    const { error } = await supabase.from("aaos_benchmarks").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Benchmark deleted");
    qc.invalidateQueries({ queryKey: ["aaos_portfolio"] });
  }

  if (isLoading || !data) {
    return (
      <AlphaLayout title="Portfolio">
      <SectionSwitch items={PLAYBOOK_TABS} />
        <div className="text-muted-foreground">Loading…</div>
      </AlphaLayout>
    );
  }

  const { patterns, benchmarks } = data;

  return (
    <AlphaLayout title="Portfolio">
      <SectionSwitch items={PLAYBOOK_TABS} />
      <p className="text-sm text-muted-foreground mb-6">
        Cross-client learning captured anonymously to improve future delivery. Never expose confidential client detail.
      </p>

      <div className="space-y-6">
        {/* ── Portfolio Patterns ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Portfolio patterns ({patterns.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Anonymised by default; never expose confidential client detail.
            </p>

            {/* List */}
            {patterns.length === 0 && (
              <p className="text-sm text-muted-foreground">No patterns yet.</p>
            )}
            <div className="space-y-2">
              {patterns.map((p) => (
                <div key={p.id} className="rounded-md border p-3 flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{p.pattern_title}</span>
                      {p.pattern_type && (
                        <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">{p.pattern_type}</span>
                      )}
                      {p.sector && (
                        <span className="text-xs text-muted-foreground">{p.sector}</span>
                      )}
                      <span
                        className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                          p.anonymised
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}
                      >
                        {p.anonymised ? "anonymised" : "identifiable"}
                      </span>
                    </div>
                    {p.summary && <p className="text-xs text-muted-foreground mt-1">{p.summary}</p>}
                    {p.reusable_playbook && (
                      <p className="text-xs mt-1 whitespace-pre-wrap text-foreground/80">{p.reusable_playbook}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deletePattern(p.id)}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    title="Delete pattern"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add form */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Add pattern</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Pattern title *</Label>
                  <Input value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="e.g. AI triage in logistics ops" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pattern type</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={pType}
                    onChange={(e) => setPType(e.target.value)}
                  >
                    <option value="">— select —</option>
                    {PATTERN_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Sector</Label>
                  <Input value={pSector} onChange={(e) => setPSector(e.target.value)} placeholder="e.g. Logistics" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Company size band</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={pSizeBand}
                    onChange={(e) => setPSizeBand(e.target.value)}
                  >
                    <option value="">— select —</option>
                    {COMPANY_SIZE_BANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Confidence level</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={pConf}
                    onChange={(e) => setPConf(e.target.value)}
                  >
                    {CONFIDENCE_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="pAnon"
                    checked={pAnon}
                    onChange={(e) => setPAnon(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="pAnon" className="text-xs cursor-pointer">Anonymised (default: yes)</Label>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Summary</Label>
                <Input value={pSummary} onChange={(e) => setPSummary(e.target.value)} placeholder="One-line summary" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Reusable playbook / notes</Label>
                <Textarea
                  value={pPlaybook}
                  onChange={(e) => setPPlaybook(e.target.value)}
                  placeholder="Steps, prompts, or notes for reuse…"
                  rows={3}
                />
              </div>
              <Button size="sm" onClick={addPattern} disabled={pSaving}>
                {pSaving ? "Saving…" : "Add pattern"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Benchmarks ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Benchmarks ({benchmarks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {benchmarks.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Sector</th>
                      <th className="py-2 pr-4">Metric</th>
                      <th className="py-2 pr-4">Low</th>
                      <th className="py-2 pr-4">Median</th>
                      <th className="py-2 pr-4">High</th>
                      <th className="py-2 pr-4">n</th>
                      <th className="py-2 pr-4">Conf</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarks.map((b) => (
                      <tr key={b.id} className="border-t">
                        <td className="py-2 pr-4 font-medium">{b.benchmark_name}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{b.sector || "—"}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{b.metric_name || "—"}</td>
                        <td className="py-2 pr-4">{b.low_value ?? "—"}</td>
                        <td className="py-2 pr-4">{b.median_value ?? "—"}</td>
                        <td className="py-2 pr-4">{b.high_value ?? "—"}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{b.sample_size ?? "—"}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{b.confidence_level || "—"}</td>
                        <td className="py-2">
                          <button
                            onClick={() => deleteBenchmark(b.id)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Delete benchmark"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {benchmarks.length === 0 && (
              <p className="text-sm text-muted-foreground">No benchmarks yet.</p>
            )}

            {/* Add benchmark form */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Add benchmark</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Benchmark name *</Label>
                  <Input value={bName} onChange={(e) => setBName(e.target.value)} placeholder="e.g. AI triage speed (hrs)" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Sector</Label>
                  <Input value={bSector} onChange={(e) => setBSector(e.target.value)} placeholder="e.g. Logistics" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Metric name</Label>
                  <Input value={bMetric} onChange={(e) => setBMetric(e.target.value)} placeholder="e.g. triage_hours_per_case" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Company size band</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={bSizeBand}
                    onChange={(e) => setBSizeBand(e.target.value)}
                  >
                    <option value="">— select —</option>
                    {COMPANY_SIZE_BANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Low value</Label>
                  <Input type="number" value={bLow} onChange={(e) => setBLow(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Median value</Label>
                  <Input type="number" value={bMedian} onChange={(e) => setBMedian(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">High value</Label>
                  <Input type="number" value={bHigh} onChange={(e) => setBHigh(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Sample size</Label>
                  <Input type="number" value={bSample} onChange={(e) => setBSample(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Confidence level</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={bConf}
                    onChange={(e) => setBConf(e.target.value)}
                  >
                    {CONFIDENCE_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <Input value={bNotes} onChange={(e) => setBNotes(e.target.value)} placeholder="Any context or caveats…" />
              </div>
              <Button size="sm" onClick={addBenchmark} disabled={bSaving}>
                {bSaving ? "Saving…" : "Add benchmark"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AlphaLayout>
  );
}
