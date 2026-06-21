import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, MessageSquarePlus, Check, X } from "lucide-react";
import { OBSERVATION_TYPES } from "../spineConstants";
import { analyseNarrativeObservation } from "../lib/narrative";
import { logActivity } from "../lib/activity";
import type { NarrativeNote, NarrativeSuggestion } from "../spineTypes";

export function NarrativeNotes(props: {
  companyId?: string | null;
  clientId?: string | null;
  engagementId?: string | null;
  entityType?: string;
  entityId?: string | null;
  title?: string;
}) {
  const qc = useQueryClient();
  const key = ["aaos_narrative", props.entityType, props.entityId, props.companyId, props.clientId];
  const [text, setText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [obsType, setObsType] = useState<string>("general observation");
  const [busy, setBusy] = useState<string | null>(null);

  const { data: notes } = useQuery({
    queryKey: key,
    queryFn: async () => {
      let q = supabase.from("aaos_narrative_notes").select("*").order("created_at", { ascending: false });
      if (props.entityId) q = q.eq("entity_id", props.entityId);
      else if (props.clientId) q = q.eq("client_id", props.clientId);
      else if (props.companyId) q = q.eq("company_id", props.companyId);
      const { data } = await q;
      return (data || []) as NarrativeNote[];
    },
  });

  const add = async () => {
    if (!text.trim()) { toast.error("Write an observation first"); return; }
    setBusy("add");
    try {
      const { error } = await supabase.from("aaos_narrative_notes").insert({
        entity_type: props.entityType ?? null, entity_id: props.entityId ?? null,
        company_id: props.companyId ?? null, client_id: props.clientId ?? null, engagement_id: props.engagementId ?? null,
        observation_title: noteTitle || null, observation_text: text, observation_type: obsType,
        ai_extraction_status: "not_analysed", human_review_status: "pending",
      });
      if (error) throw error;
      await logActivity({ action: "observation added", summary: noteTitle || obsType, company_id: props.companyId, client_id: props.clientId, entity_type: "narrative" });
      setText(""); setNoteTitle("");
      qc.invalidateQueries({ queryKey: key });
      toast.success("Observation saved");
    } catch (e: any) { toast.error(e.message || "Failed"); } finally { setBusy(null); }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><MessageSquarePlus className="h-4 w-4" /> {props.title || "Narrative & observations"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="Title (optional)" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="sm:max-w-xs" />
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={obsType} onChange={(e) => setObsType(e.target.value)}>
              {OBSERVATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Textarea rows={3} placeholder="Describe the situation, concern, opportunity, dynamic… in your own words." value={text} onChange={(e) => setText(e.target.value)} />
          <Button size="sm" onClick={add} disabled={busy === "add"}>{busy === "add" ? "Saving…" : "Add observation"}</Button>
        </div>

        <div className="space-y-3">
          {(notes || []).length === 0 && <p className="text-sm text-muted-foreground">No observations yet. Senior judgement often starts as a sentence before it becomes a score, risk, or opportunity.</p>}
          {(notes || []).map((n) => (
            <NoteCard key={n.id} note={n} busy={busy} setBusy={setBusy} onChange={() => qc.invalidateQueries({ queryKey: key })} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NoteCard({ note, busy, setBusy, onChange }: { note: NarrativeNote; busy: string | null; setBusy: (s: string | null) => void; onChange: () => void }) {
  const qc = useQueryClient();
  const sKey = ["aaos_narrative_sugg", note.id];
  const { data: suggestions } = useQuery({
    queryKey: sKey,
    queryFn: async () => {
      const { data } = await supabase.from("aaos_narrative_suggestions").select("*").eq("narrative_note_id", note.id).order("created_at", { ascending: true });
      return (data || []) as NarrativeSuggestion[];
    },
  });

  const analyse = async () => {
    setBusy(note.id);
    try { await analyseNarrativeObservation(note); qc.invalidateQueries({ queryKey: sKey }); onChange(); toast.success("Analysed — review the suggestions"); }
    catch (e: any) { toast.error(e.message || "Failed"); } finally { setBusy(null); }
  };

  // Apply a suggestion into a structured record where straightforward; always traceable.
  const accept = async (s: NarrativeSuggestion) => {
    setBusy(s.id);
    try {
      let appliedType: string | null = null; let appliedId: string | null = null;
      const t = s.suggested_item_type;
      if (t === "signal" && note.company_id) {
        const { data } = await supabase.from("aaos_company_signals").insert({ company_id: note.company_id, signal_type: "other", signal_summary: s.suggested_title, signal_strength: "medium", evidence_notes: `From narrative note ${note.id}` }).select().single();
        appliedType = "signal"; appliedId = data?.id ?? null;
      } else if (t === "risk" && note.client_id) {
        const { data } = await supabase.from("aaos_governance_risks").insert({ client_id: note.client_id, engagement_id: note.engagement_id, risk_title: s.suggested_title, risk_description: `From narrative note ${note.id}`, four_p_dimension: s.related_four_p_dimension as any, likelihood: 3, impact: 3, risk_score: 9, status: "Open", human_review_required: true }).select().single();
        appliedType = "risk"; appliedId = data?.id ?? null;
      } else if (t === "ai opportunity" && note.client_id) {
        const { data } = await supabase.from("aaos_ai_opportunities").insert({ client_id: note.client_id, engagement_id: note.engagement_id, opportunity_title: s.suggested_title, opportunity_description: `From narrative note ${note.id}`, status: "New" }).select().single();
        appliedType = "opportunity"; appliedId = data?.id ?? null;
      } else if (t === "KPI hypothesis" && note.client_id) {
        const { data } = await supabase.from("aaos_kpis").insert({ client_id: note.client_id, engagement_id: note.engagement_id, company_id: note.company_id, kpi_name: s.suggested_title, kpi_category: "quality", confidence_level: "low", notes: `From narrative note ${note.id}` }).select().single();
        appliedType = "kpi"; appliedId = data?.id ?? null;
      }
      await supabase.from("aaos_narrative_suggestions").update({ review_status: "accepted", applied_entity_type: appliedType, applied_entity_id: appliedId }).eq("id", s.id);
      qc.invalidateQueries({ queryKey: sKey });
      toast.success(appliedType ? `Accepted — created ${appliedType}` : "Accepted");
    } catch (e: any) { toast.error(e.message || "Failed"); } finally { setBusy(null); }
  };

  const reject = async (s: NarrativeSuggestion) => {
    setBusy(s.id);
    try { await supabase.from("aaos_narrative_suggestions").update({ review_status: "rejected" }).eq("id", s.id); qc.invalidateQueries({ queryKey: sKey }); }
    finally { setBusy(null); }
  };

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          {note.observation_title && <div className="font-medium text-sm">{note.observation_title}</div>}
          <div className="text-xs text-muted-foreground">{note.observation_type} · {new Date(note.created_at).toLocaleString()}</div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{note.observation_text}</p>
        </div>
        <Button size="sm" variant="outline" onClick={analyse} disabled={busy === note.id}>
          <Sparkles className="h-3.5 w-3.5 mr-1" /> {note.ai_extraction_status === "analysed" ? "Re-analyse" : "Analyse"}
        </Button>
      </div>

      {(suggestions || []).length > 0 && (
        <div className="mt-3 space-y-2 border-t pt-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Suggested structured items (review)</div>
          {(suggestions || []).map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-2 rounded bg-muted/40 p-2">
              <div className="text-sm">
                <span className="font-medium">{s.suggested_item_type}</span>: {s.suggested_title}
                <div className="text-xs text-muted-foreground">{s.reasoning} · confidence {s.confidence_level}{s.related_four_p_dimension ? ` · ${s.related_four_p_dimension}` : ""}</div>
              </div>
              {s.review_status === "pending" ? (
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => accept(s)} disabled={busy === s.id}><Check className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => reject(s)} disabled={busy === s.id}><X className="h-3.5 w-3.5" /></Button>
                </div>
              ) : (
                <span className={`text-xs shrink-0 ${s.review_status === "accepted" ? "text-green-700" : "text-muted-foreground"}`}>{s.review_status}{s.applied_entity_type ? ` → ${s.applied_entity_type}` : ""}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
