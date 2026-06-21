import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  MONETISATION_MODELS,
  INVOICE_STATUSES,
  TRIGGER_STATUSES,
} from "../../spineConstants";
import { generateMonetisationReview } from "../../lib/alphaGen";
import { GenerateButton, StatusPill } from "../spineUi";
import { HumanReviewBadge } from "../RagBadge";
import { logActivity } from "../../lib/activity";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";

export function MonetisationSection({ client, refresh }: SectionProps) {
  const qc = useQueryClient();
  const engagementId = client.current_engagement_id;

  const { data: records, refetch } = useQuery({
    queryKey: ["aaos_monetisation_records", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_monetisation_records")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const onDone = () => {
    refetch();
    refresh();
    qc.invalidateQueries({ queryKey: ["aaos_monetisation_records", client.id] });
  };

  // ---- Add form state ----
  const [commModel, setCommModel] = useState<string>(MONETISATION_MODELS[0]);
  const [feeAmount, setFeeAmount] = useState("");
  const [subAmount, setSubAmount] = useState("");
  const [gainSharePct, setGainSharePct] = useState("");
  const [triggerCondition, setTriggerCondition] = useState("");
  const [triggerStatus, setTriggerStatus] = useState<string>(TRIGGER_STATUSES[0]);
  const [invoiceStatus, setInvoiceStatus] = useState<string>(INVOICE_STATUSES[0]);
  const [adding, setAdding] = useState(false);

  const saveRecord = async () => {
    setAdding(true);
    try {
      const { data, error } = await supabase.from("aaos_monetisation_records").insert({
        client_id: client.id,
        engagement_id: engagementId ?? null,
        commercial_model: commModel || null,
        fee_amount: feeAmount !== "" ? Number(feeAmount) : null,
        subscription_amount: subAmount !== "" ? Number(subAmount) : null,
        gain_share_percentage: gainSharePct !== "" ? Number(gainSharePct) : null,
        trigger_condition: triggerCondition || null,
        trigger_status: triggerStatus || null,
        invoice_status: invoiceStatus || null,
        human_review_required: true,
      }).select().single();
      if (error) throw error;
      await logActivity({ action: "monetisation record added", summary: `Monetisation record added for ${client.client_name}`, client_id: client.id, entity_type: "monetisation", entity_id: data?.id });
      toast.success("Monetisation record added");
      setCommModel(MONETISATION_MODELS[0]); setFeeAmount(""); setSubAmount(""); setGainSharePct("");
      setTriggerCondition(""); setTriggerStatus(TRIGGER_STATUSES[0]); setInvoiceStatus(INVOICE_STATUSES[0]);
      onDone();
    } catch (e: any) { toast.error(e.message || "Failed to add record"); }
    finally { setAdding(false); }
  };

  const TRIGGER_NEEDS_CONFIRM = new Set(["Approved", "Invoiced"]);
  const INVOICE_NEEDS_CONFIRM = new Set(["Sent", "Ready"]);

  const updateTriggerStatus = async (id: string, status: string) => {
    if (TRIGGER_NEEDS_CONFIRM.has(status)) {
      const ok = window.confirm("Commercial claim — confirm human review complete?");
      if (!ok) return;
    }
    const { error } = await supabase.from("aaos_monetisation_records").update({ trigger_status: status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    refetch();
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    if (INVOICE_NEEDS_CONFIRM.has(status)) {
      const ok = window.confirm("Commercial claim — confirm human review complete?");
      if (!ok) return;
    }
    const { error } = await supabase.from("aaos_monetisation_records").update({ invoice_status: status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    refetch();
  };

  const deleteRecord = async (id: string) => {
    if (!window.confirm("Delete this monetisation record?")) return;
    const { error } = await supabase.from("aaos_monetisation_records").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refetch();
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <GenerateButton
          label="Generate monetisation review"
          onRun={() => generateMonetisationReview(client, engagementId)}
          onDone={onDone}
        />
      </div>

      {/* Mandatory human review banner */}
      <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800 font-medium">
          Human review is mandatory before gain-share, equity/warrant, invoicing from uplift, or any client-facing commercial claim.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monetisation Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-md p-3 bg-muted/20">
            <div className="sm:col-span-2">
              <Label className="text-xs">Commercial Model</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={commModel} onChange={(e) => setCommModel(e.target.value)}>
                {MONETISATION_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Fee Amount (£)</Label>
              <Input type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">Subscription Amount (£)</Label>
              <Input type="number" value={subAmount} onChange={(e) => setSubAmount(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">Gain-Share %</Label>
              <Input type="number" value={gainSharePct} onChange={(e) => setGainSharePct(e.target.value)} placeholder="0" min={0} max={100} />
            </div>
            <div>
              <Label className="text-xs">Trigger Condition</Label>
              <Input value={triggerCondition} onChange={(e) => setTriggerCondition(e.target.value)} placeholder="e.g. KPI uplift agreed by client" />
            </div>
            <div>
              <Label className="text-xs">Trigger Status</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={triggerStatus} onChange={(e) => setTriggerStatus(e.target.value)}>
                {TRIGGER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Invoice Status</Label>
              <select className="h-10 rounded-md border bg-background px-3 text-sm w-full" value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value)}>
                {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button size="sm" onClick={saveRecord} disabled={adding}>
                {adding ? "Saving…" : "Add Monetisation Record"}
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {(records || []).length === 0 && <p className="text-sm text-muted-foreground">No monetisation records yet.</p>}
            {(records || []).map((m: any) => (
              <Card key={m.id} className="border">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">{m.commercial_model || "—"}</span>
                      <StatusPill status={m.trigger_status} />
                      <StatusPill status={m.invoice_status} />
                      {m.human_review_required && <HumanReviewBadge />}
                    </div>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => deleteRecord(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                    {m.fee_amount != null && <span>Fee: £{m.fee_amount.toLocaleString()}</span>}
                    {m.subscription_amount != null && <span>Sub: £{m.subscription_amount.toLocaleString()}</span>}
                    {m.gain_share_percentage != null && <span>Gain-share: {m.gain_share_percentage}%</span>}
                    {m.gain_share_amount_estimated != null && <span>Est.: £{m.gain_share_amount_estimated.toLocaleString()}</span>}
                    {m.gain_share_amount_agreed != null && <span>Agreed: £{m.gain_share_amount_agreed.toLocaleString()}</span>}
                  </div>

                  {m.trigger_condition && <p className="text-xs text-muted-foreground">Trigger: {m.trigger_condition}</p>}

                  <div className="flex flex-wrap gap-3 pt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Trigger:</span>
                      <select
                        className="h-7 rounded-md border bg-background px-2 text-xs"
                        value={m.trigger_status || ""}
                        onChange={(e) => updateTriggerStatus(m.id, e.target.value)}
                      >
                        {TRIGGER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Invoice:</span>
                      <select
                        className="h-7 rounded-md border bg-background px-2 text-xs"
                        value={m.invoice_status || ""}
                        onChange={(e) => updateInvoiceStatus(m.id, e.target.value)}
                      >
                        {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
