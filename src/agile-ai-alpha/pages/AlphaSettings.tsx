import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlphaLayout } from "../components/AlphaLayout";
import { RagBadge } from "../components/RagBadge";
import { FIT_DIMENSIONS, FOUR_PS, AGILE_DIMENSIONS } from "../constants";

export default function AlphaSettings() {
  return (
    <AlphaLayout title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">AI Alpha Fit Score (max 100)</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <ul className="space-y-1">
              {FIT_DIMENSIONS.map((d) => (
                <li key={d.key} className="flex justify-between"><span>{d.label}</span><span className="text-muted-foreground">max {d.max}</span></li>
              ))}
            </ul>
            <div className="pt-2 border-t flex flex-wrap gap-2">
              <RagBadge rag="green" label="80–100 Priority" />
              <RagBadge rag="green" label="70–79 Good" />
              <RagBadge rag="amber" label="60–69 Nurture" />
              <RagBadge rag="red" label="<60 Reject / Low" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">4Ps Governance (max 100)</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="text-muted-foreground">{FOUR_PS.map((p) => p.label).join(" · ")} — each P has 5 sub-dimensions scored 1–5 (Absent → Embedded). Each P max 25.</p>
            <div className="flex flex-wrap gap-2">
              <RagBadge rag="red" label="Per-P Red <13" />
              <RagBadge rag="amber" label="Amber 13–19" />
              <RagBadge rag="green" label="Green 20+" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <RagBadge rag="red" label="Overall Red <52" />
              <RagBadge rag="amber" label="Amber 52–76" />
              <RagBadge rag="green" label="Green 77+" />
            </div>
            <p className="text-xs text-muted-foreground pt-1">Pre-sales external scoring defaults to <strong>preliminary</strong>; scores of 4–5 should carry evidence notes.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Agile AI Maturity (7 × 1–5 = max 35)</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="text-muted-foreground">{AGILE_DIMENSIONS.map((d) => d.label).join(" · ")}</p>
            <div className="flex flex-wrap gap-2">
              <RagBadge rag="red" label="Red — weak base" />
              <RagBadge rag="amber" label="Amber — needs discipline" />
              <RagBadge rag="green" label="Green — AI-ready" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Human review &amp; compliance gates</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>Human review is required before: outreach is sent · a proposal is issued · a company is accepted into delivery · gain-share, equity or warrant routes are proposed · any client-facing report is exported · any commercial term is issued externally.</p>
            <p>The platform provides <strong>preliminary assessment, readiness support, evidence preparation, governance mapping and risk flagging</strong>. It does not provide legal, investment or compliance advice, certify compliance, or guarantee outcomes. External certification requires an accredited body.</p>
            <p>Outreach records contact source, lawful basis and suppression status. No mass-send capability exists in this MVP.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Consultant leverage</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>Each workflow records old manual effort, new AI-assisted effort, leverage factor and automation category (Fully Automatable / AI-Assisted / Human Only). Snapshots, scoring, outreach and proposals target ≥10× leverage; the Value Ledger aggregates hours saved.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Backend &amp; access</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>Backend: Lovable Cloud Supabase (project iyqsbjawaampgcavsgcz). All <code>aaos_*</code> tables are protected by row-level security and restricted to admin/owner accounts. AI generation runs in the <code>aaos-generate</code> edge function (OpenAI); no keys are exposed to the browser.</p>
          </CardContent>
        </Card>
      </div>
    </AlphaLayout>
  );
}
