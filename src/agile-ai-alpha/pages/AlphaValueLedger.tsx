import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlphaLayout } from "../components/AlphaLayout";

function fmtRange(low?: number | null, high?: number | null) {
  const l = low != null ? `£${Number(low).toLocaleString()}` : "?";
  const h = high != null ? `£${Number(high).toLocaleString()}` : "?";
  return `${l} – ${h}/mo`;
}

export default function AlphaValueLedger() {
  const { data, isLoading } = useQuery({
    queryKey: ["aaos_value_ledger"],
    queryFn: async () => {
      const [companies, vh, kpis, scores, snapshots] = await Promise.all([
        supabase.from("aaos_companies").select("id, company_name"),
        supabase.from("aaos_value_hypotheses").select("*").order("created_at", { ascending: false }),
        supabase.from("aaos_kpis").select("*").order("created_at", { ascending: false }),
        supabase.from("aaos_company_scores").select("old_manual_effort_hours, new_ai_assisted_effort_hours"),
        supabase.from("aaos_snapshots").select("old_manual_effort_hours, new_ai_assisted_effort_hours"),
      ]);
      return {
        companies: companies.data || [],
        vh: vh.data || [],
        kpis: kpis.data || [],
        effort: [...(scores.data || []), ...(snapshots.data || [])],
      };
    },
  });

  if (isLoading || !data) return <AlphaLayout title="Value Ledger"><div className="text-muted-foreground">Loading…</div></AlphaLayout>;

  const nameById = new Map(data.companies.map((c) => [c.id, c.company_name]));
  const totalLow = data.vh.reduce((a, v) => a + (Number(v.estimated_monthly_value_low) || 0), 0);
  const totalHigh = data.vh.reduce((a, v) => a + (Number(v.estimated_monthly_value_high) || 0), 0);
  const hoursSaved = data.effort.reduce((a, e) => a + Math.max(0, (Number(e.old_manual_effort_hours) || 0) - (Number(e.new_ai_assisted_effort_hours) || 0)), 0);

  return (
    <AlphaLayout title="Value Ledger">
      <p className="text-sm text-muted-foreground mb-4">Foundation for gain-share and value attribution: hypotheses, KPI baselines and consultant-leverage captured across all companies.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{data.vh.length}</div><div className="text-xs text-muted-foreground">Value hypotheses</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">£{(totalLow/1000).toFixed(0)}k–£{(totalHigh/1000).toFixed(0)}k</div><div className="text-xs text-muted-foreground">Est. monthly value (sum)</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{data.kpis.length}</div><div className="text-xs text-muted-foreground">KPI baselines</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">~{Math.round(hoursSaved)}h</div><div className="text-xs text-muted-foreground">Consultant hours saved (est.)</div></CardContent></Card>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-2"><CardTitle className="text-base">Value hypotheses</CardTitle></CardHeader>
        <CardContent>
          {data.vh.length === 0 && <p className="text-sm text-muted-foreground">No value hypotheses yet. Add them from a company's Value Ledger tab.</p>}
          {data.vh.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground"><tr>
                  <th className="py-2 pr-4">Opportunity</th><th className="py-2 pr-4">Company</th><th className="py-2 pr-4">Type</th><th className="py-2 pr-4">Est. value</th><th className="py-2 pr-4">Confidence</th><th className="py-2 pr-4">Trigger</th>
                </tr></thead>
                <tbody>
                  {data.vh.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="py-2 pr-4 font-medium">{v.opportunity_name}</td>
                      <td className="py-2 pr-4"><Link className="text-primary hover:underline" to={`/agile-ai-alpha/companies/${v.company_id}?tab=value`}>{nameById.get(v.company_id!) || "—"}</Link></td>
                      <td className="py-2 pr-4 text-muted-foreground">{v.value_type}</td>
                      <td className="py-2 pr-4">{fmtRange(v.estimated_monthly_value_low, v.estimated_monthly_value_high)}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{v.confidence_level}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{v.commercial_trigger || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">KPI baselines</CardTitle></CardHeader>
        <CardContent>
          {data.kpis.length === 0 && <p className="text-sm text-muted-foreground">No KPI baselines yet.</p>}
          {data.kpis.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground"><tr>
                  <th className="py-2 pr-4">KPI</th><th className="py-2 pr-4">Company</th><th className="py-2 pr-4">Baseline</th><th className="py-2 pr-4">Target</th><th className="py-2 pr-4">Actual</th><th className="py-2 pr-4">Unit</th>
                </tr></thead>
                <tbody>
                  {data.kpis.map((k) => (
                    <tr key={k.id} className="border-t">
                      <td className="py-2 pr-4 font-medium">{k.kpi_name}</td>
                      <td className="py-2 pr-4"><Link className="text-primary hover:underline" to={`/agile-ai-alpha/companies/${k.company_id}?tab=value`}>{nameById.get(k.company_id!) || "—"}</Link></td>
                      <td className="py-2 pr-4">{k.baseline_value ?? "—"}</td>
                      <td className="py-2 pr-4">{k.target_value ?? "—"}</td>
                      <td className="py-2 pr-4">{k.actual_value ?? "—"}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{k.unit || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AlphaLayout>
  );
}
