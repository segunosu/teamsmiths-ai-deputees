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

const FRAMEWORKS = ["EU AI Act", "NIST AI RMF", "ISO/IEC 42001", "ISO/IEC 27001", "GDPR", "SOC 2", "UK AI principles", "NYC LL144", "OWASP LLM", "4Ps"];

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
        ? { ...item, tags: (item.tags || []).join(", ") }
        : { kind: "questionnaire_qa", title: "", question: "", framework: "", four_p_dimension: "", body: "", tags: "" });
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
        four_p_dimension: form.four_p_dimension || null,
        body: form.body || null,
        tags: form.tags ? String(form.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : null,
        source: item?.source || "manual",
      };
      if (item?.id) {
        const { error } = await supabase.from("aaos_library").update(payload).eq("id", item.id);
        if (error) throw error;
        toast.success("Library item updated");
      } else {
        const { error } = await supabase.from("aaos_library").insert(payload);
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
        <DialogHeader><DialogTitle>{item ? "Edit library item" : "Add library item"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.kind} onChange={(e) => set("kind", e.target.value)}>
                {KINDS.map((k) => <option key={k.v} value={k.v}>{k.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Framework / standard</Label>
              <Input list="aaos-frameworks" value={form.framework ?? ""} onChange={(e) => set("framework", e.target.value)} placeholder="e.g. SOC 2, EU AI Act" />
              <datalist id="aaos-frameworks">{FRAMEWORKS.map((f) => <option key={f} value={f} />)}</datalist>
            </div>
          </div>
          {isQA && (
            <div>
              <Label className="text-xs">Buyer question (for questionnaire answers)</Label>
              <Input value={form.question ?? ""} onChange={(e) => set("question", e.target.value)} placeholder="e.g. Do you hold SOC 2 Type II certification?" />
            </div>
          )}
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder={isQA ? "Short label, e.g. Security certification" : "Title"} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">4Ps dimension (optional)</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.four_p_dimension ?? ""} onChange={(e) => set("four_p_dimension", e.target.value)}>
                <option value="">—</option>
                <option value="primed">Primed</option>
                <option value="principled">Principled</option>
                <option value="practised">Practised</option>
                <option value="protected">Protected</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Tags (comma-separated; use arch:agents/vision/genmedia/hiring/gtm/infra to target an archetype)</Label>
              <Input value={form.tags ?? ""} onChange={(e) => set("tags", e.target.value)} placeholder="e.g. security, arch:agents" />
            </div>
          </div>
          <div>
            <Label className="text-xs">{isQA ? "Canonical answer" : "Body / content"}</Label>
            <Textarea rows={5} value={form.body ?? ""} onChange={(e) => set("body", e.target.value)} placeholder={isQA ? "The reusable answer. Use [placeholders] for vendor-specific facts." : "The reusable content."} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : item ? "Save changes" : "Add to Library"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
