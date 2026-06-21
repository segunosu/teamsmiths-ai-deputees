import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { StatusPill, Field } from "../spineUi";
import { logActivity } from "../../lib/activity";
import {
  ENGAGEMENT_TYPES,
  ENGAGEMENT_STATUSES,
  COMMERCIAL_MODELS,
} from "../../spineConstants";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";
import type { Engagement } from "../../spineTypes";

export function EngagementsSection({ client, refresh }: SectionProps) {
  const qc = useQueryClient();
  const engagementId = client.current_engagement_id;

  const { data: engagements, refetch } = useQuery<Engagement[]>({
    queryKey: ["aaos_engagements", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_engagements")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Engagement[];
    },
  });

  // Form state
  const [name, setName] = useState("");
  const [engType, setEngType] = useState<string>(ENGAGEMENT_TYPES[0]);
  const [commModel, setCommModel] = useState<string>(COMMERCIAL_MODELS[0]);
  const [status, setStatus] = useState<string>("Draft");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [owner, setOwner] = useState("");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) { toast.error("Engagement name is required"); return; }
    setAdding(true);
    try {
      const { data, error } = await supabase
        .from("aaos_engagements")
        .insert({
          client_id: client.id,
          company_id: client.company_id ?? null,
          engagement_name: name.trim(),
          engagement_type: engType,
          commercial_model: commModel,
          status,
          start_date: startDate || null,
          target_end_date: endDate || null,
          agreed_price: agreedPrice !== "" ? Number(agreedPrice) : null,
          owner: owner.trim() || null,
        })
        .select()
        .single();
      if (error) throw error;
      await logActivity({
        action: "engagement created",
        summary: `Engagement "${name.trim()}" created for ${client.client_name}`,
        client_id: client.id,
        company_id: client.company_id ?? null,
        entity_type: "engagement",
        entity_id: data?.id ?? null,
      });
      toast.success("Engagement created");
      setName(""); setEngType(ENGAGEMENT_TYPES[0]); setCommModel(COMMERCIAL_MODELS[0]);
      setStatus("Draft"); setStartDate(""); setEndDate(""); setAgreedPrice(""); setOwner("");
      setShowForm(false);
      refetch();
      refresh();
      qc.invalidateQueries({ queryKey: ["aaos_engagements", client.id] });
    } catch (e: any) {
      toast.error(e?.message || "Failed to create engagement");
    } finally {
      setAdding(false);
    }
  };

  const handleStatusChange = async (e: Engagement, newStatus: string) => {
    const { error } = await supabase
      .from("aaos_engagements")
      .update({ status: newStatus })
      .eq("id", e.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated");
    refetch();
    refresh();
    qc.invalidateQueries({ queryKey: ["aaos_engagements", client.id] });
  };

  const handleDelete = async (e: Engagement) => {
    if (!window.confirm(`Delete engagement "${e.engagement_name}"?`)) return;
    const { error } = await supabase.from("aaos_engagements").delete().eq("id", e.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Engagement deleted");
    refetch();
    refresh();
    qc.invalidateQueries({ queryKey: ["aaos_engagements", client.id] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Engagements ({engagements?.length ?? 0})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4 mr-1" /> Add engagement
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">New engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Engagement name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AI Alpha Diagnostic Q3 2026" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                  value={engType}
                  onChange={(e) => setEngType(e.target.value)}
                >
                  {ENGAGEMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Commercial model</Label>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                  value={commModel}
                  onChange={(e) => setCommModel(e.target.value)}
                >
                  {COMMERCIAL_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {ENGAGEMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label>Owner</Label>
                <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Consultant name" />
              </div>
              <div>
                <Label>Start date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>Target end date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div>
                <Label>Agreed price (£)</Label>
                <Input
                  type="number"
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(e.target.value)}
                  placeholder="e.g. 5000"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={adding}>
                {adding ? "Creating…" : "Create engagement"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(engagements || []).length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">No engagements yet. Click "Add engagement" to create one.</p>
      )}

      <div className="space-y-3">
        {(engagements || []).map((e) => (
          <Card key={e.id} className={e.id === engagementId ? "border-primary" : ""}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{e.engagement_name}</span>
                  <StatusPill status={e.status} />
                  {e.id === engagementId && (
                    <span className="text-xs text-primary font-medium">current</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/agile-ai-alpha/engagements/${e.id}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(e)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                <Field label="Type">{e.engagement_type}</Field>
                <Field label="Commercial model">{e.commercial_model}</Field>
                <Field label="Owner">{e.owner}</Field>
                <Field label="Start">{e.start_date}</Field>
                <Field label="Target end">{e.target_end_date}</Field>
                <Field label="Agreed price">
                  {e.agreed_price != null ? `£${e.agreed_price.toLocaleString()}` : "—"}
                </Field>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Update status:</span>
                <select
                  className="h-8 rounded-md border bg-background px-2 text-xs"
                  value={e.status ?? ""}
                  onChange={(ev) => handleStatusChange(e, ev.target.value)}
                >
                  {ENGAGEMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
