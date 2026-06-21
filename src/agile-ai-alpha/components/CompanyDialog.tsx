import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { COMPANY_STATUSES, COMPANY_SIZE_BANDS, REVENUE_BANDS } from "../constants";
import type { Company } from "../types";
import { logActivity } from "../lib/activity";

const FIELDS: { key: keyof Company; label: string; full?: boolean }[] = [
  { key: "company_name", label: "Company name *" },
  { key: "website", label: "Website" },
  { key: "sector", label: "Sector" },
  { key: "subsector", label: "Subsector" },
  { key: "country", label: "Country" },
  { key: "region", label: "Region" },
  { key: "ownership_type", label: "Ownership type" },
  { key: "funding_stage", label: "Funding stage" },
  { key: "owner_or_ceo_name", label: "Owner / CEO name" },
  { key: "owner_or_ceo_linkedin", label: "Owner / CEO LinkedIn" },
  { key: "key_contact_name", label: "Key contact name" },
  { key: "key_contact_role", label: "Key contact role" },
  { key: "key_contact_email", label: "Key contact email" },
  { key: "source", label: "Source" },
  { key: "source_url", label: "Source URL" },
];

export function CompanyDialog({
  open, onOpenChange, company, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  company?: Company | null;
  onSaved?: (c: Company) => void;
}) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(company ? { ...company } : { status: "New" });
  }, [open, company]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.company_name?.trim()) {
      toast.error("Company name is required");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      for (const f of FIELDS) payload[f.key] = form[f.key] ?? null;
      payload.status = form.status ?? "New";
      payload.company_size_band = form.company_size_band ?? null;
      payload.estimated_revenue_band = form.estimated_revenue_band ?? null;
      payload.notes = form.notes ?? null;

      if (company?.id) {
        const { data, error } = await supabase
          .from("aaos_companies").update(payload).eq("id", company.id).select().single();
        if (error) throw error;
        await logActivity({ action: "company updated", summary: `Updated ${payload.company_name}`, company_id: company.id, entity_type: "company", entity_id: company.id });
        toast.success("Company updated");
        onSaved?.(data);
      } else {
        const { data, error } = await supabase
          .from("aaos_companies").insert(payload).select().single();
        if (error) throw error;
        await logActivity({ action: "company created", summary: `Created ${payload.company_name}`, company_id: data.id, entity_type: "company", entity_id: data.id });
        toast.success("Company added");
        onSaved?.(data);
      }
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{company ? "Edit company" : "Add company"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <div key={String(f.key)} className={f.key === "company_name" ? "sm:col-span-2" : ""}>
              <Label className="text-xs">{f.label}</Label>
              <Input value={form[f.key] ?? ""} onChange={(e) => set(String(f.key), e.target.value)} />
            </div>
          ))}
          <div>
            <Label className="text-xs">Status</Label>
            <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.status ?? "New"} onChange={(e) => set("status", e.target.value)}>
              {COMPANY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Company size band</Label>
            <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.company_size_band ?? ""} onChange={(e) => set("company_size_band", e.target.value)}>
              <option value="">—</option>
              {COMPANY_SIZE_BANDS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Estimated revenue band</Label>
            <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.estimated_revenue_band ?? ""} onChange={(e) => set("estimated_revenue_band", e.target.value)}>
              <option value="">—</option>
              {REVENUE_BANDS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Notes</Label>
            <Textarea rows={3} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : company ? "Save changes" : "Add company"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
