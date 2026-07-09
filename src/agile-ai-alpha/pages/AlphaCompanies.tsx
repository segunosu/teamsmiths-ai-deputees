import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Download, Search } from "lucide-react";
import { AlphaLayout } from "../components/AlphaLayout";
import { SectionSwitch, PIPELINE_TABS } from "../components/SectionSwitch";
import { CompanyDialog } from "../components/CompanyDialog";
import { RagBadge } from "../components/RagBadge";
import { fitBand } from "../lib/scoring";
import { COMPANY_STATUSES } from "../constants";
import type { Company } from "../types";

type Row = Company & { fit?: number | null };

export default function AlphaCompanies() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");
  const [status, setStatus] = useState("");
  const [region, setRegion] = useState("");
  const [minScore, setMinScore] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["aaos_companies_list"],
    queryFn: async () => {
      const [{ data: companies }, { data: scores }] = await Promise.all([
        supabase.from("aaos_companies").select("*").order("created_at", { ascending: false }),
        supabase.from("aaos_company_scores").select("company_id, ai_alpha_fit_score, created_at").order("created_at", { ascending: false }),
      ]);
      const scoreByCompany = new Map<string, number>();
      (scores || []).forEach((s) => {
        if (s.company_id && !scoreByCompany.has(s.company_id)) scoreByCompany.set(s.company_id, s.ai_alpha_fit_score ?? 0);
      });
      return (companies || []).map((c) => ({ ...c, fit: scoreByCompany.get(c.id) ?? null })) as Row[];
    },
  });

  const sectors = useMemo(() => Array.from(new Set((data || []).map((c) => c.sector).filter(Boolean))) as string[], [data]);
  const regions = useMemo(() => Array.from(new Set((data || []).map((c) => c.region).filter(Boolean))) as string[], [data]);

  const filtered = useMemo(() => {
    return (data || []).filter((c) => {
      if (q && !c.company_name.toLowerCase().includes(q.toLowerCase())) return false;
      if (sector && c.sector !== sector) return false;
      if (status && c.status !== status) return false;
      if (region && c.region !== region) return false;
      if (minScore && (c.fit ?? -1) < Number(minScore)) return false;
      return true;
    });
  }, [data, q, sector, status, region, minScore]);

  const exportCsv = () => {
    const cols = ["company_name", "website", "sector", "region", "status", "fit", "next_action", "next_action_due_date"];
    const header = cols.join(",");
    const lines = filtered.map((c) =>
      cols.map((k) => `"${String((c as any)[k] ?? "").replace(/"/g, '""')}"`).join(","),
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-alpha-companies.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AlphaLayout title="Companies">
      <SectionSwitch items={PIPELINE_TABS} />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Companies <span className="text-muted-foreground font-normal">({filtered.length})</span></h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add company</Button>
        </div>
      </div>

      <Card className="p-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search name…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={sector} onChange={(e) => setSector(e.target.value)}>
            <option value="">All sectors</option>
            {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {COMPANY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">All regions</option>
            {regions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={minScore} onChange={(e) => setMinScore(e.target.value)}>
            <option value="">Any score</option>
            <option value="80">80+ (Priority)</option>
            <option value="70">70+ (Good)</option>
            <option value="60">60+ (Nurture+)</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Fit</th>
                <th className="px-4 py-3">Next action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td className="px-4 py-6 text-muted-foreground" colSpan={6}>Loading…</td></tr>}
              {!isLoading && filtered.length === 0 && (
                <tr><td className="px-4 py-6 text-muted-foreground" colSpan={6}>No companies match. Add one to get started.</td></tr>
              )}
              {filtered.map((c) => {
                const band = c.fit != null ? fitBand(c.fit) : null;
                return (
                  <tr key={c.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/agile-ai-alpha/companies/${c.id}`)}>
                    <td className="px-4 py-3 font-medium">{c.company_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.sector || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.region || "—"}</td>
                    <td className="px-4 py-3"><span className="text-xs rounded-full border px-2 py-0.5">{c.status}</span></td>
                    <td className="px-4 py-3">{band ? <RagBadge rag={band.rag} label={`${c.fit} · ${band.label}`} /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.next_action || "—"}{c.next_action_due_date ? ` (${c.next_action_due_date})` : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <CompanyDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={() => qc.invalidateQueries({ queryKey: ["aaos_companies_list"] })} />
    </AlphaLayout>
  );
}
