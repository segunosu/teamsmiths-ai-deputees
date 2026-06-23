import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const KINDS = [
  { v: "questionnaire_qa", label: "Security questionnaire answer (Q→A)" },
  { v: "risk", label: "Risk" },
  { v: "control", label: "Control" },
  { v: "policy", label: "Policy" },
  { v: "model_card_template", label: "Model card template" },
  { v: "incident_playbook", label: "Incident playbook" },
  { v: "attestation_template", label: "Attestation template" },
  { v: "playbook", label: "Playbook" },
  { v: "prompt", label: "Prompt" },
];

// Regulatory bodies / certification standards.
const FRAMEWORKS = ["SOC 2", "ISO/IEC 27001", "ISO/IEC 42001", "EU AI Act", "GDPR", "UK GDPR", "CCPA", "NIST AI RMF", "NYC LL144", "HIPAA", "PCI DSS", "Cyber Essentials", "UK AI principles", "OWASP LLM Top 10", "4Ps"];

const CATEGORIES = ["Access control", "Data privacy", "Data handling & retention", "Model governance", "Human oversight", "Bias & fairness", "Security", "Incident response", "Vendor & sub-processors", "Transparency", "Audit & logging", "Regulatory mapping"];

const FOUR_PS = [
  { v: "", label: "— none —" },
  { v: "primed", label: "Primed (readiness: literacy, data, infra, use-case)" },
  { v: "principled", label: "Principled (principles, decision rights, oversight, ethics)" },
  { v: "practised", label: "Practised (lifecycle, cadence, capability, vendor discipline)" },
  { v: "protected", label: "Protected (risk, regulatory, model cards, audit, incident)" },
];

const OTHER = "__other__";

// A select with a curated list + an "Other…" free-text fallback.
function SelectOrOther({ label, value, options, onChange, placeholder }: { label: string; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string }) {
  const isOther = !!value && !options.includes(value);
  const [mode, setMode] = useState(isOther ? OTHER : value || "");
  useEffect(() => { setMode(isOther ? OTHER : value || ""); }, [value, isOther]);
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <select
        className="w-full h-10 rounded-md border bg-background px-3 text-sm"
        value={mode}
        onChange={(e) => { const v = e.target.value; setMode(v); onChange(v === OTHER ? "" : v); }}
      >
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value={OTHER}>Other…</option>
      </select>
      {mode === OTHER && <Input className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "Type a value"} />}
    </div>
  );
}

export function LibraryDialog({
  open, onOpenChange, item, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item?: any | null;
  onSaved?: () => void;
}) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(item
        ? { kind: "questionnaire_qa", title: "", question: "", framework: "", category: "", four_p_dimension: "", body: "", ...item, tags: (item.tags || []).join(", ") }
        : { kind: "questionnaire_qa", title: "", question: "", framework: "", category: "", four_p_dimension: "", body: "", tags: "" });
    }
  }, [open, item]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title?.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        kind: form.kind || "questionnaire_qa",
        title: form.title.trim(),
        question: form.question || null,
        framework: form.framework || null,
        category: form.category || null,
        four_p_dimension: form.four_p_dimension || null,
        body: form.body || null,
        tags: form.tags ? String(form.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : null,
        source: form.source || "manual",
        source_client_id: form.source_client_id || null,
      };
      if (item?.id) {
        const { error } = await supabase.from("aaos_library").update(payload).eq("id", item.id);
        if (error) throw error;
        toast.success("Library item updated");
      } else {
        const { error } = await supabase.from("aaos_library").insert(payload as any);
        if (error) throw error;
        toast.success("Added to Library");
      }
      onSaved?.();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const isQA = form.kind === "questionnaire_qa";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item?.id ? "Edit library item" : "Add to Library"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.kind} onChange={(e) => set("kind", e.target.value)}>
                {KINDS.map((k) => <option key={k.v} value={k.v}>{k.label}</option>)}
              </select>
            </div>
            <SelectOrOther label="Regulatory body / certification standard" value={form.framework ?? ""} options={FRAMEWORKS} onChange={(v) => set("framework", v)} placeholder="e.g. ISO/IEC 27017" />
            <SelectOrOther label="Category" value={form.category ?? ""} options={CATEGORIES} onChange={(v) => set("category", v)} placeholder="e.g. Data residency" />
            <div>
              <Label className="text-xs">Pin to 4Ps</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.four_p_dimension ?? ""} onChange={(e) => set("four_p_dimension", e.target.value)}>
                {FOUR_PS.map((p) => <option key={p.v} value={p.v}>{p.label}</option>)}
              </select>
            </div>
          </div>
          {isQA && (
            <div>
              <Label className="text-xs">Buyer question</Label>
              <Input value={form.question ?? ""} onChange={(e) => set("question", e.target.value)} placeholder="e.g. Do you hold SOC 2 Type II certification?" />
            </div>
          )}
          <div>
            <Label className="text-xs">Title / short label</Label>
            <Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder={isQA ? "e.g. Security certification" : "Title"} />
          </div>
          <div>
            <Label className="text-xs">{isQA ? "Canonical answer (use [placeholders] for vendor-specific facts)" : "Body / content"}</Label>
            <Textarea rows={6} value={form.body ?? ""} onChange={(e) => set("body", e.target.value)} placeholder={isQA ? "The reusable, vendor-neutral answer." : "The reusable content."} />
          </div>
          <div>
            <Label className="text-xs">Tags (comma-separated; arch:agents/vision/genmedia/hiring/gtm/infra targets an archetype)</Label>
            <Input value={form.tags ?? ""} onChange={(e) => set("tags", e.target.value)} placeholder="e.g. security, arch:agents" />
          </div>
          {form.source && form.source !== "manual" && form.source !== "seed" && form.source !== "ai" && (
            <p className="text-xs text-muted-foreground">Provenance: {form.source}. Neutralise any vendor-specific detail before saving — the library is reusable across clients.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : item?.id ? "Save changes" : "Add to Library"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
