import { useState } from "react";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react";
import {
  OPPORTUNITY_STATUSES,
  OPPORTUNITY_VALUE_TYPES,
} from "../../spineConstants";
import { generateOpportunityMap } from "../../lib/alphaGen";
import {
  computePriorityScore,
  priorityExplain,
  priorityRag,
} from "../../lib/spineScoring";
import { RagBadge } from "../RagBadge";
import { GenerateButton, StatusPill, Field } from "../spineUi";
import { logActivity } from "../../lib/activity";
import type { Opportunity } from "../../spineTypes";

export function OpportunitiesSection({ client, refresh }: SectionProps) {
  const qc = useQueryClient();
  const engagementId = client.current_engagement_id;

  const { data: opportunities, refetch } = useQuery({
    queryKey: ["aaos_ai_opportunities", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_ai_opportunities")
        .select("*")
        .eq("client_id", client.id)
        .order("priority_score", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data || []) as Opportunity[];
    },
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    opportunity_title: "",
    opportunity_description: "",
    business_area: "",
    value_type: "",
    estimated_monthly_value_low: "",
    estimated_monthly_value_high: "",
  });

  const handleAdd = async () => {
    if (!addForm.opportunity_title.trim()) {
      toast.error("Opportunity title is required");
      return;
    }
    const { error, data } = await supabase
      .from("aaos_ai_opportunities")
      .insert({
        client_id: client.id,
        engagement_id: engagementId ?? null,
        opportunity_title: addForm.opportunity_title.trim(),
        opportunity_description: addForm.opportunity_description || null,
        business_area: addForm.business_area || null,
        value_type: addForm.value_type || null,
        estimated_monthly_value_low: addForm.estimated_monthly_value_low !== "" ? Number(addForm.estimated_monthly_value_low) : null,
        estimated_monthly_value_high: addForm.estimated_monthly_value_high !== "" ? Number(addForm.estimated_monthly_value_high) : null,
        status: "New",
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "opportunity added",
      summary: `Opportunity "${addForm.opportunity_title}" added for ${client.client_name}`,
      client_id: client.id,
      engagement_id: engagementId,
      entity_type: "opportunity",
      entity_id: data?.id,
    });
    toast.success("Opportunity added");
    setAddForm({ opportunity_title: "", opportunity_description: "", business_area: "", value_type: "", estimated_monthly_value_low: "", estimated_monthly_value_high: "" });
    setShowAddForm(false);
    refetch();
    refresh();
    qc.invalidateQueries({ queryKey: ["aaos_ai_opportunities"] });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <GenerateButton
          label="Generate opportunity map"
          onRun={() => generateOpportunityMap(client, engagementId)}
          onDone={() => { refetch(); refresh(); qc.invalidateQueries({ queryKey: ["aaos_ai_opportunities"] }); }}
        />
        <Button variant="outline" size="sm" onClick={() => setShowAddForm((v) => !v)}>
          <Plus className="h-4 w-4 mr-1" />
          {showAddForm ? "Cancel" : "Add opportunity"}
        </Button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">New opportunity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Title *</Label>
              <Input
                value={addForm.opportunity_title}
                onChange={(e) => setAddForm((f) => ({ ...f, opportunity_title: e.target.value }))}
                placeholder="Opportunity title"
              />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Input
                value={addForm.opportunity_description}
                onChange={(e) => setAddForm((f) => ({ ...f, opportunity_description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[160px]">
                <Label className="text-xs">Business area</Label>
                <Input
                  value={addForm.business_area}
                  onChange={(e) => setAddForm((f) => ({ ...f, business_area: e.target.value }))}
                  placeholder="e.g. Operations"
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <Label className="text-xs">Value type</Label>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                  value={addForm.value_type}
                  onChange={(e) => setAddForm((f) => ({ ...f, value_type: e.target.value }))}
                >
                  <option value="">— select —</option>
                  {OPPORTUNITY_VALUE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[120px]">
                <Label className="text-xs">Est. monthly value low (£)</Label>
                <Input
                  type="number"
                  value={addForm.estimated_monthly_value_low}
                  onChange={(e) => setAddForm((f) => ({ ...f, estimated_monthly_value_low: e.target.value }))}
                  placeholder="e.g. 2000"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <Label className="text-xs">Est. monthly value high (£)</Label>
                <Input
                  type="number"
                  value={addForm.estimated_monthly_value_high}
                  onChange={(e) => setAddForm((f) => ({ ...f, estimated_monthly_value_high: e.target.value }))}
                  placeholder="e.g. 8000"
                />
              </div>
            </div>
            <Button size="sm" onClick={handleAdd}>Add opportunity</Button>
          </CardContent>
        </Card>
      )}

      {/* Opportunity list */}
      {(opportunities || []).length === 0 && (
        <p className="text-sm text-muted-foreground">No opportunities yet. Generate an opportunity map or add one manually.</p>
      )}
      <div className="space-y-3">
        {(opportunities || []).map((opp) => (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            clientId={client.id}
            clientName={client.client_name}
            engagementId={engagementId}
            onDone={() => { refetch(); refresh(); qc.invalidateQueries({ queryKey: ["aaos_ai_opportunities"] }); }}
          />
        ))}
      </div>
    </div>
  );
}

function OpportunityCard({
  opportunity: opp,
  clientId,
  clientName,
  engagementId,
  onDone,
}: {
  opportunity: Opportunity;
  clientId: string;
  clientName: string;
  engagementId: string | null | undefined;
  onDone: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [scores, setScores] = useState({
    value_potential_score: opp.value_potential_score ?? 0,
    urgency_score: opp.urgency_score ?? 0,
    confidence_score: opp.confidence_score ?? 0,
    strategic_fit_score: opp.strategic_fit_score ?? 0,
    effort_score: opp.effort_score ?? 0,
    risk_score: opp.risk_score ?? 0,
  });

  const livePriority = computePriorityScore(scores);
  const liveExplain = priorityExplain(scores);
  const liveRag = priorityRag(livePriority);

  const handleStatusChange = async (status: string) => {
    const { error } = await supabase
      .from("aaos_ai_opportunities")
      .update({ status })
      .eq("id", opp.id);
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "opportunity status updated",
      summary: `Opportunity "${opp.opportunity_title}" → ${status}`,
      client_id: clientId,
      engagement_id: engagementId,
      entity_type: "opportunity",
      entity_id: opp.id,
    });
    toast.success("Status updated");
    onDone();
  };

  const handleSelectForSprint = async () => {
    await handleStatusChange("Selected for Sprint");
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this opportunity?")) return;
    const { error } = await supabase
      .from("aaos_ai_opportunities")
      .delete()
      .eq("id", opp.id);
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "opportunity deleted",
      summary: `Opportunity "${opp.opportunity_title}" deleted`,
      client_id: clientId,
      engagement_id: engagementId,
      entity_type: "opportunity",
      entity_id: opp.id,
    });
    toast.success("Deleted");
    onDone();
  };

  const handleSaveScores = async () => {
    const priority_score = computePriorityScore(scores);
    const { error } = await supabase
      .from("aaos_ai_opportunities")
      .update({
        value_potential_score: scores.value_potential_score || null,
        urgency_score: scores.urgency_score || null,
        confidence_score: scores.confidence_score || null,
        strategic_fit_score: scores.strategic_fit_score || null,
        effort_score: scores.effort_score || null,
        risk_score: scores.risk_score || null,
        priority_score,
      })
      .eq("id", opp.id);
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "opportunity scores saved",
      summary: `Scores updated for "${opp.opportunity_title}" → priority ${priority_score}`,
      client_id: clientId,
      engagement_id: engagementId,
      entity_type: "opportunity",
      entity_id: opp.id,
    });
    toast.success("Scores saved");
    onDone();
  };

  const scoreField = (key: keyof typeof scores, label: string) => (
    <div className="flex-1 min-w-[90px]">
      <Label className="text-xs">{label} (1–5)</Label>
      <Input
        type="number"
        min={1}
        max={5}
        value={scores[key] || ""}
        onChange={(e) => {
          const v = e.target.value === "" ? 0 : Math.min(5, Math.max(1, Number(e.target.value)));
          setScores((s) => ({ ...s, [key]: v }));
        }}
        className="h-8 text-sm"
      />
    </div>
  );

  const valueRange =
    opp.estimated_monthly_value_low != null && opp.estimated_monthly_value_high != null
      ? `£${opp.estimated_monthly_value_low.toLocaleString()}–£${opp.estimated_monthly_value_high.toLocaleString()}/mo`
      : opp.estimated_monthly_value_low != null
      ? `£${opp.estimated_monthly_value_low.toLocaleString()}+/mo`
      : null;

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm">{opp.opportunity_title}</span>
              <StatusPill status={opp.status} />
              {opp.business_area && (
                <span className="text-xs text-muted-foreground">{opp.business_area}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {valueRange && <span className="text-xs text-muted-foreground">{valueRange}</span>}
              <RagBadge
                rag={priorityRag(opp.priority_score || 0)}
                label={`priority ${opp.priority_score ?? "?"}`}
              />
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" variant="outline" onClick={handleSelectForSprint}>
              Select for sprint
            </Button>
            <Button size="sm" variant="outline" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Inline status select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <select
            className="h-8 rounded-md border bg-background px-2 text-xs"
            value={opp.status || "New"}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {OPPORTUNITY_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Expanded section */}
        {expanded && (
          <div className="border-t pt-3 space-y-4">
            {/* Fields */}
            <div className="grid gap-3 sm:grid-cols-2">
              {opp.suggested_solution && (
                <Field label="Suggested solution">{opp.suggested_solution}</Field>
              )}
              {opp.acceptance_criteria && (
                <Field label="Acceptance criteria">{opp.acceptance_criteria}</Field>
              )}
              {opp.recommended_next_action && (
                <Field label="Recommended next action">{opp.recommended_next_action}</Field>
              )}
            </div>

            {/* Scoring editor */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase text-muted-foreground">Priority scoring (1–5 each)</div>
              <div className="flex flex-wrap gap-2">
                {scoreField("value_potential_score", "Value")}
                {scoreField("urgency_score", "Urgency")}
                {scoreField("confidence_score", "Confidence")}
                {scoreField("strategic_fit_score", "Strategic fit")}
                {scoreField("effort_score", "Effort")}
                {scoreField("risk_score", "Risk")}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono">{liveExplain}</span>
                <RagBadge rag={liveRag} label={`priority ${livePriority}`} />
              </div>
              <Button size="sm" onClick={handleSaveScores}>Save scores</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
