import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, AlertCircle, Pencil } from "lucide-react";
import {
  RISK_DOMAINS,
  FOUR_P_KEYS,
  FOUR_P_LABELS,
  CONTROL_STATUSES,
  FRAMEWORKS,
} from "../../spineConstants";
import { generateGovernanceRisks, generateControls } from "../../lib/alphaGen";
import { computeRiskScore, riskRag } from "../../lib/spineScoring";
import { RagBadge, HumanReviewBadge } from "../RagBadge";
import { GenerateButton, StatusPill } from "../spineUi";
import { logActivity } from "../../lib/activity";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";

export function GovernanceSection({ client, refresh }: SectionProps) {
  const qc = useQueryClient();
  const engagementId = client.current_engagement_id;

  const refetchAll = () => {
    refresh();
    qc.invalidateQueries({ queryKey: ["aaos_governance_risks", client.id] });
    qc.invalidateQueries({ queryKey: ["aaos_controls", client.id] });
    qc.invalidateQueries({ queryKey: ["aaos_framework_mappings", client.id] });
  };

  const { data: risks, refetch: refetchRisks } = useQuery({
    queryKey: ["aaos_governance_risks", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_governance_risks")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: controls, refetch: refetchControls } = useQuery({
    queryKey: ["aaos_controls", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_controls")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: mappings, refetch: refetchMappings } = useQuery({
    queryKey: ["aaos_framework_mappings", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_framework_mappings")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // ---- Risk add form state ----
  const [riskTitle, setRiskTitle] = useState("");
  const [riskDesc, setRiskDesc] = useState("");
  const [riskDomain, setRiskDomain] = useState<string>(RISK_DOMAINS[0]);
  const [riskFourP, setRiskFourP] = useState<string>(FOUR_P_KEYS[0]);
  const [riskLikelihood, setRiskLikelihood] = useState("");
  const [riskImpact, setRiskImpact] = useState("");
  const [riskMitigation, setRiskMitigation] = useState("");
  const [riskOwner, setRiskOwner] = useState("");
  const [riskDueDate, setRiskDueDate] = useState("");
  const [addingRisk, setAddingRisk] = useState(false);

  const saveRisk = async () => {
    if (!riskTitle.trim()) { toast.error("Risk title is required"); return; }
    setAddingRisk(true);
    try {
      const l = riskLikelihood !== "" ? Number(riskLikelihood) : null;
      const i = riskImpact !== "" ? Number(riskImpact) : null;
      const score = (l != null && i != null) ? computeRiskScore(l, i) : null;
      const { data, error } = await supabase.from("aaos_governance_risks").insert({
        client_id: client.id,
        engagement_id: engagementId ?? null,
        risk_title: riskTitle.trim(),
        risk_description: riskDesc || null,
        risk_domain: riskDomain || null,
        four_p_dimension: riskFourP || null,
        likelihood: l,
        impact: i,
        risk_score: score,
        mitigation: riskMitigation || null,
        owner: riskOwner || null,
        due_date: riskDueDate || null,
        status: "Open",
        human_review_required: true,
      }).select().single();
      if (error) throw error;
      await logActivity({ action: "risk added", summary: `Risk "${riskTitle}" added`, client_id: client.id, entity_type: "risk", entity_id: data?.id });
      toast.success("Risk added");
      setRiskTitle(""); setRiskDesc(""); setRiskDomain(RISK_DOMAINS[0]); setRiskFourP(FOUR_P_KEYS[0]);
      setRiskLikelihood(""); setRiskImpact(""); setRiskMitigation(""); setRiskOwner(""); setRiskDueDate("");
      refetchRisks();
      refresh();
    } catch (e: any) { toast.error(e.message || "Failed to add risk"); }
    finally { setAddingRisk(false); }
  };

  const updateRiskStatus = async (id: string, status: string, humanReviewRequired: boolean) => {
    if (status === "Closed" && humanReviewRequired) {
      const confirmed = window.confirm("Human review required before closing this risk. Confirm review has been completed?");
      if (!confirmed) return;
    }
    const { error } = await supabase.from("aaos_governance_risks").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated");
    refetchRisks();
  };

  const deleteRisk = async (id: string) => {
    if (!window.confirm("Delete this risk?")) return;
    const { error } = await supabase.from("aaos_governance_risks").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refetchRisks();
    toast.success("Deleted");
  };

  // ---- Control add form state ----
  const [ctrlName, setCtrlName] = useState("");
  const [ctrlDesc, setCtrlDesc] = useState("");
  const [ctrlType, setCtrlType] = useState("");
  const [ctrlRiskId, setCtrlRiskId] = useState("");
  const [ctrlFourP, setCtrlFourP] = useState<string>(FOUR_P_KEYS[0]);
  const [ctrlOwner, setCtrlOwner] = useState("");
  const [ctrlStatus, setCtrlStatus] = useState<string>(CONTROL_STATUSES[0]);
  const [ctrlEvidenceRequired, setCtrlEvidenceRequired] = useState(false);
  const [addingCtrl, setAddingCtrl] = useState(false);

  const saveControl = async () => {
    if (!ctrlName.trim()) { toast.error("Control name is required"); return; }
    setAddingCtrl(true);
    try {
      const { data, error } = await supabase.from("aaos_controls").insert({
        client_id: client.id,
        engagement_id: engagementId ?? null,
        control_name: ctrlName.trim(),
        control_description: ctrlDesc || null,
        control_type: ctrlType || null,
        related_risk_id: ctrlRiskId || null,
        related_four_p_dimension: ctrlFourP || null,
        owner: ctrlOwner || null,
        implementation_status: ctrlStatus || null,
        evidence_required: ctrlEvidenceRequired,
      }).select().single();
      if (error) throw error;
      await logActivity({ action: "control added", summary: `Control "${ctrlName}" added`, client_id: client.id, entity_type: "control", entity_id: data?.id });
      toast.success("Control added");
      setCtrlName(""); setCtrlDesc(""); setCtrlType(""); setCtrlRiskId(""); setCtrlFourP(FOUR_P_KEYS[0]);
      setCtrlOwner(""); setCtrlStatus(CONTROL_STATUSES[0]); setCtrlEvidenceRequired(false);
      refetchControls();
      refresh();
    } catch (e: any) { toast.error(e.message || "Failed to add control"); }
    finally { setAddingCtrl(false); }
  };

  const updateControlStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("aaos_controls").update({ implementation_status: status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    refetchControls();
  };

  const deleteControl = async (id: string) => {
    if (!window.confirm("Delete this control?")) return;
    const { error } = await supabase.from("aaos_controls").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refetchControls();
    toast.success("Deleted");
  };

  // ---- Framework mapping add form state ----
  const [fwName, setFwName] = useState<string>(FRAMEWORKS[0]);
  const [fwRef, setFwRef] = useState("");
  const [fwSummary, setFwSummary] = useState("");
  const [fwFourP, setFwFourP] = useState<string>(FOUR_P_KEYS[0]);
  const [fwCtrlId, setFwCtrlId] = useState("");
  const [fwStatus, setFwStatus] = useState("");
  const [addingFw, setAddingFw] = useState(false);

  const saveMapping = async () => {
    const { data, error } = await supabase.from("aaos_framework_mappings").insert({
      client_id: client.id,
      engagement_id: engagementId ?? null,
      framework_name: fwName || null,
      requirement_reference: fwRef || null,
      requirement_summary: fwSummary || null,
      related_four_p_dimension: fwFourP || null,
      related_control_id: fwCtrlId || null,
      status: fwStatus || null,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    toast.success("Mapping added");
    setFwRef(""); setFwSummary(""); setFwFourP(FOUR_P_KEYS[0]); setFwCtrlId(""); setFwStatus("");
    setFwName(FRAMEWORKS[0]);
    refetchMappings();
    refresh();
  };

  const deleteMapping = async (id: string) => {
    if (!window.confirm("Delete this mapping?")) return;
    const { error } = await supabase.from("aaos_framework_mappings").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refetchMappings();
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <GenerateButton
          label="Generate risks"
          onRun={() => generateGovernanceRisks(client, engagementId)}
          onDone={refetchAll}
        />
        <GenerateButton
          label="Generate controls"
          onRun={() => generateControls(client, engagementId)}
          onDone={refetchAll}
          variant="outline"
        />
      </div>

      {/* Risks Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Governance Risks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-md p-3 bg-muted/20">
            <div className="sm:col-span-2">
              <Label className="text-xs">Risk Title *</Label>
              <Input value={riskTitle} onChange={(e) => setRiskTitle(e.target.value)} placeholder="Risk title" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea value={riskDesc} onChange={(e) => setRiskDesc(e.target.value)} placeholder="Risk description" rows={2} />
            </div>
            <div>
              <Label className="text-xs">Domain</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={riskDomain} onChange={(e) => setRiskDomain(e.target.value)}>
                {RISK_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">4P Dimension</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={riskFourP} onChange={(e) => setRiskFourP(e.target.value)}>
                {FOUR_P_KEYS.map((k) => <option key={k} value={k}>{FOUR_P_LABELS[k]}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Likelihood (1-5)</Label>
              <Input type="number" min={1} max={5} value={riskLikelihood} onChange={(e) => setRiskLikelihood(e.target.value)} placeholder="1-5" />
            </div>
            <div>
              <Label className="text-xs">Impact (1-5)</Label>
              <Input type="number" min={1} max={5} value={riskImpact} onChange={(e) => setRiskImpact(e.target.value)} placeholder="1-5" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Mitigation</Label>
              <Textarea value={riskMitigation} onChange={(e) => setRiskMitigation(e.target.value)} placeholder="Mitigation plan" rows={2} />
            </div>
            <div>
              <Label className="text-xs">Owner</Label>
              <Input value={riskOwner} onChange={(e) => setRiskOwner(e.target.value)} placeholder="Owner name" />
            </div>
            <div>
              <Label className="text-xs">Due Date</Label>
              <Input type="date" value={riskDueDate} onChange={(e) => setRiskDueDate(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button size="sm" onClick={saveRisk} disabled={addingRisk}>
                {addingRisk ? "Saving…" : "Add Risk"}
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
            {(risks || []).length === 0 && <p className="text-sm text-muted-foreground">No risks recorded yet.</p>}
            {(risks || []).map((r: any) => (
              <RiskRow key={r.id} risk={r} onChanged={refetchRisks} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-md p-3 bg-muted/20">
            <div className="sm:col-span-2">
              <Label className="text-xs">Control Name *</Label>
              <Input value={ctrlName} onChange={(e) => setCtrlName(e.target.value)} placeholder="Control name" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea value={ctrlDesc} onChange={(e) => setCtrlDesc(e.target.value)} placeholder="Control description" rows={2} />
            </div>
            <div>
              <Label className="text-xs">Control Type</Label>
              <Input value={ctrlType} onChange={(e) => setCtrlType(e.target.value)} placeholder="e.g. process, technical" />
            </div>
            <div>
              <Label className="text-xs">Related Risk</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={ctrlRiskId} onChange={(e) => setCtrlRiskId(e.target.value)}>
                <option value="">— none —</option>
                {(risks || []).map((r: any) => <option key={r.id} value={r.id}>{r.risk_title}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">4P Dimension</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={ctrlFourP} onChange={(e) => setCtrlFourP(e.target.value)}>
                {FOUR_P_KEYS.map((k) => <option key={k} value={k}>{FOUR_P_LABELS[k]}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Owner</Label>
              <Input value={ctrlOwner} onChange={(e) => setCtrlOwner(e.target.value)} placeholder="Owner name" />
            </div>
            <div>
              <Label className="text-xs">Implementation Status</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={ctrlStatus} onChange={(e) => setCtrlStatus(e.target.value)}>
                {CONTROL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="evidence-required" checked={ctrlEvidenceRequired} onChange={(e) => setCtrlEvidenceRequired(e.target.checked)} className="h-4 w-4" />
              <Label htmlFor="evidence-required" className="text-xs">Evidence Required</Label>
            </div>
            <div className="sm:col-span-2">
              <Button size="sm" onClick={saveControl} disabled={addingCtrl}>
                {addingCtrl ? "Saving…" : "Add Control"}
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
            {(controls || []).length === 0 && <p className="text-sm text-muted-foreground">No controls recorded yet.</p>}
            {(controls || []).map((c: any) => (
              <ControlRow key={c.id} control={c} risks={risks || []} onChanged={refetchControls} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Framework Mappings Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Framework Mappings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Disclaimer banner */}
          <div className="flex items-start gap-2 rounded-md border border-muted bg-muted/20 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Readiness mapping and evidence preparation only — not certification. External legal/compliance/certification review required where applicable.
            </p>
          </div>

          {/* Add form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-md p-3 bg-muted/20">
            <div>
              <Label className="text-xs">Framework</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={fwName} onChange={(e) => setFwName(e.target.value)}>
                {FRAMEWORKS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Requirement Reference</Label>
              <Input value={fwRef} onChange={(e) => setFwRef(e.target.value)} placeholder="e.g. Article 9, Control 5.2" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Requirement Summary</Label>
              <Textarea value={fwSummary} onChange={(e) => setFwSummary(e.target.value)} placeholder="Summary of the requirement" rows={2} />
            </div>
            <div>
              <Label className="text-xs">4P Dimension</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={fwFourP} onChange={(e) => setFwFourP(e.target.value)}>
                {FOUR_P_KEYS.map((k) => <option key={k} value={k}>{FOUR_P_LABELS[k]}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Related Control</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={fwCtrlId} onChange={(e) => setFwCtrlId(e.target.value)}>
                <option value="">— none —</option>
                {(controls || []).map((c: any) => <option key={c.id} value={c.id}>{c.control_name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Input value={fwStatus} onChange={(e) => setFwStatus(e.target.value)} placeholder="e.g. In progress, Gap" />
            </div>
            <div className="sm:col-span-2">
              <Button size="sm" onClick={saveMapping} disabled={addingFw}>
                {addingFw ? "Saving…" : "Add Mapping"}
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
            {(mappings || []).length === 0 && <p className="text-sm text-muted-foreground">No framework mappings yet.</p>}
            {(mappings || []).map((m: any) => (
              <div key={m.id} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm">{m.framework_name}</span>
                    {m.requirement_reference && <span className="text-xs text-muted-foreground">{m.requirement_reference}</span>}
                    {m.status && <StatusPill status={m.status} />}
                  </div>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => deleteMapping(m.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {m.requirement_summary && <p className="text-xs text-muted-foreground mt-1">{m.requirement_summary}</p>}
                {m.related_four_p_dimension && <p className="text-xs text-muted-foreground">{FOUR_P_LABELS[m.related_four_p_dimension] || m.related_four_p_dimension}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Editable risk row ----
function RiskRow({ risk, onChanged }: { risk: any; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState<any>({});
  const startEdit = () => {
    setF({
      risk_title: risk.risk_title ?? "", risk_description: risk.risk_description ?? "",
      risk_domain: risk.risk_domain ?? RISK_DOMAINS[0], four_p_dimension: risk.four_p_dimension ?? FOUR_P_KEYS[0],
      likelihood: risk.likelihood ?? "", impact: risk.impact ?? "", mitigation: risk.mitigation ?? "",
      owner: risk.owner ?? "", due_date: risk.due_date ?? "",
    });
    setEditing(true);
  };
  const save = async () => {
    const l = f.likelihood !== "" ? Number(f.likelihood) : null;
    const i = f.impact !== "" ? Number(f.impact) : null;
    const { error } = await supabase.from("aaos_governance_risks").update({
      risk_title: f.risk_title || "Untitled risk", risk_description: f.risk_description || null,
      risk_domain: f.risk_domain || null, four_p_dimension: f.four_p_dimension || null,
      likelihood: l, impact: i, risk_score: (l != null && i != null) ? computeRiskScore(l, i) : null,
      mitigation: f.mitigation || null, owner: f.owner || null, due_date: f.due_date || null,
    }).eq("id", risk.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Risk updated"); setEditing(false); onChanged();
  };
  const updateStatus = async (status: string) => {
    if (status === "Closed" && risk.human_review_required && !window.confirm("Human review required before closing this risk. Confirm review has been completed?")) return;
    const { error } = await supabase.from("aaos_governance_risks").update({ status }).eq("id", risk.id);
    if (error) { toast.error(error.message); return; }
    onChanged();
  };
  const del = async () => {
    if (!window.confirm("Delete this risk?")) return;
    const { error } = await supabase.from("aaos_governance_risks").delete().eq("id", risk.id);
    if (error) { toast.error(error.message); return; }
    onChanged();
  };

  if (editing) {
    return (
      <div className="rounded-md border p-3 space-y-2 bg-muted/20">
        <Input value={f.risk_title} onChange={(e) => setF({ ...f, risk_title: e.target.value })} placeholder="Risk title" />
        <Textarea rows={2} value={f.risk_description} onChange={(e) => setF({ ...f, risk_description: e.target.value })} placeholder="Description" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select className="h-9 rounded-md border bg-background px-2 text-xs" value={f.risk_domain} onChange={(e) => setF({ ...f, risk_domain: e.target.value })}>
            {RISK_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="h-9 rounded-md border bg-background px-2 text-xs" value={f.four_p_dimension} onChange={(e) => setF({ ...f, four_p_dimension: e.target.value })}>
            {FOUR_P_KEYS.map((k) => <option key={k} value={k}>{FOUR_P_LABELS[k]}</option>)}
          </select>
          <Input type="number" min={1} max={5} value={f.likelihood} onChange={(e) => setF({ ...f, likelihood: e.target.value })} placeholder="Likelihood" />
          <Input type="number" min={1} max={5} value={f.impact} onChange={(e) => setF({ ...f, impact: e.target.value })} placeholder="Impact" />
        </div>
        <Textarea rows={2} value={f.mitigation} onChange={(e) => setF({ ...f, mitigation: e.target.value })} placeholder="Mitigation" />
        <div className="grid grid-cols-2 gap-2">
          <Input value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} placeholder="Owner" />
          <Input type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={save}>Save</Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-3 space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-sm">{risk.risk_title}</span>
          {risk.risk_domain && <span className="text-xs text-muted-foreground">{risk.risk_domain}</span>}
          {risk.four_p_dimension && <span className="text-xs text-muted-foreground">{FOUR_P_LABELS[risk.four_p_dimension] || risk.four_p_dimension}</span>}
          <RagBadge rag={riskRag(risk.risk_score ?? 0)} label={`risk ${risk.risk_score ?? 0}`} />
          {risk.human_review_required && <HumanReviewBadge />}
        </div>
        <div className="flex items-center gap-2">
          <select className="h-8 rounded-md border bg-background px-2 text-xs" value={risk.status || ""} onChange={(e) => updateStatus(e.target.value)}>
            {["Open", "Mitigating", "Monitoring", "Closed"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={startEdit}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={del}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      {risk.mitigation && <p className="text-xs text-muted-foreground">Mitigation: {risk.mitigation}</p>}
      {risk.owner && <p className="text-xs text-muted-foreground">Owner: {risk.owner}{risk.due_date ? ` · Due: ${risk.due_date}` : ""}</p>}
    </div>
  );
}

// ---- Editable control row ----
function ControlRow({ control, risks, onChanged }: { control: any; risks: any[]; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState<any>({});
  const linkedRisk = (risks || []).find((r: any) => r.id === control.related_risk_id);
  const startEdit = () => {
    setF({
      control_name: control.control_name ?? "", control_description: control.control_description ?? "",
      control_type: control.control_type ?? "", related_risk_id: control.related_risk_id ?? "",
      related_four_p_dimension: control.related_four_p_dimension ?? FOUR_P_KEYS[0],
      owner: control.owner ?? "", implementation_status: control.implementation_status ?? CONTROL_STATUSES[0],
      evidence_required: !!control.evidence_required,
    });
    setEditing(true);
  };
  const save = async () => {
    const { error } = await supabase.from("aaos_controls").update({
      control_name: f.control_name || "Untitled control", control_description: f.control_description || null,
      control_type: f.control_type || null, related_risk_id: f.related_risk_id || null,
      related_four_p_dimension: f.related_four_p_dimension || null, owner: f.owner || null,
      implementation_status: f.implementation_status || null, evidence_required: !!f.evidence_required,
    }).eq("id", control.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Control updated"); setEditing(false); onChanged();
  };
  const updateStatus = async (status: string) => {
    const { error } = await supabase.from("aaos_controls").update({ implementation_status: status }).eq("id", control.id);
    if (error) { toast.error(error.message); return; }
    onChanged();
  };
  const del = async () => {
    if (!window.confirm("Delete this control?")) return;
    const { error } = await supabase.from("aaos_controls").delete().eq("id", control.id);
    if (error) { toast.error(error.message); return; }
    onChanged();
  };

  if (editing) {
    return (
      <div className="rounded-md border p-3 space-y-2 bg-muted/20">
        <Input value={f.control_name} onChange={(e) => setF({ ...f, control_name: e.target.value })} placeholder="Control name" />
        <Textarea rows={2} value={f.control_description} onChange={(e) => setF({ ...f, control_description: e.target.value })} placeholder="Description" />
        <div className="grid grid-cols-2 gap-2">
          <Input value={f.control_type} onChange={(e) => setF({ ...f, control_type: e.target.value })} placeholder="Type (process/technical/policy)" />
          <Input value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} placeholder="Owner" />
          <select className="h-9 rounded-md border bg-background px-2 text-xs" value={f.related_four_p_dimension} onChange={(e) => setF({ ...f, related_four_p_dimension: e.target.value })}>
            {FOUR_P_KEYS.map((k) => <option key={k} value={k}>{FOUR_P_LABELS[k]}</option>)}
          </select>
          <select className="h-9 rounded-md border bg-background px-2 text-xs" value={f.implementation_status} onChange={(e) => setF({ ...f, implementation_status: e.target.value })}>
            {CONTROL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="h-9 rounded-md border bg-background px-2 text-xs col-span-2" value={f.related_risk_id} onChange={(e) => setF({ ...f, related_risk_id: e.target.value })}>
            <option value="">— no linked risk —</option>
            {(risks || []).map((r: any) => <option key={r.id} value={r.id}>{r.risk_title}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={f.evidence_required} onChange={(e) => setF({ ...f, evidence_required: e.target.checked })} className="h-4 w-4" /> Evidence required</label>
        <div className="flex gap-2">
          <Button size="sm" onClick={save}>Save</Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-sm">{control.control_name}</span>
          <StatusPill status={control.implementation_status} />
          {control.owner && <span className="text-xs text-muted-foreground">{control.owner}</span>}
          {linkedRisk && <span className="text-xs text-muted-foreground">→ {linkedRisk.risk_title}</span>}
        </div>
        <div className="flex items-center gap-2">
          <select className="h-8 rounded-md border bg-background px-2 text-xs" value={control.implementation_status || ""} onChange={(e) => updateStatus(e.target.value)}>
            {CONTROL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={startEdit}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={del}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      {control.control_description && <p className="text-xs text-muted-foreground mt-1">{control.control_description}</p>}
    </div>
  );
}
