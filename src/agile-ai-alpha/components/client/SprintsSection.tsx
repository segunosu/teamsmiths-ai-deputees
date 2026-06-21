import { useState } from "react";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import {
  SPRINT_TYPES,
  SPRINT_STATUSES,
  STORY_STATUSES,
  OWNER_TYPES,
  STORY_REVIEW_STATUSES,
} from "../../spineConstants";
import { generateSprintStories } from "../../lib/alphaGen";
import { GenerateButton, StatusPill } from "../spineUi";
import { HumanReviewBadge } from "../RagBadge";
import { logActivity } from "../../lib/activity";
import type { Sprint, Story, Opportunity } from "../../spineTypes";

const BOARD_COLUMNS: Array<{ status: string; label: string }> = [
  { status: "Inbox", label: "Inbox" },
  { status: "Ready", label: "Ready" },
  { status: "In Progress", label: "In Progress" },
  { status: "Needs Review", label: "Needs Review" },
  { status: "Done", label: "Done" },
  { status: "Blocked", label: "Blocked" },
];

const EXTRA_COLUMNS: Array<{ status: string; label: string }> = [
  { status: "Rejected", label: "Rejected" },
  { status: "Deferred", label: "Deferred" },
];

export function SprintsSection({ client, refresh }: SectionProps) {
  const qc = useQueryClient();
  const engagementId = client.current_engagement_id;

  const { data: sprints, refetch: refetchSprints } = useQuery({
    queryKey: ["aaos_sprints", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_sprints")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Sprint[];
    },
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    sprint_name: "",
    sprint_goal: "",
    sprint_type: "",
    start_date: "",
    end_date: "",
  });

  const [selectedSprintId, setSelectedSprintId] = useState<string>("");
  const selectedSprint = (sprints || []).find((s) => s.id === selectedSprintId) ?? null;

  const handleCreateSprint = async () => {
    if (!createForm.sprint_name.trim()) {
      toast.error("Sprint name is required");
      return;
    }
    const { error, data } = await supabase
      .from("aaos_sprints")
      .insert({
        client_id: client.id,
        engagement_id: engagementId ?? null,
        sprint_name: createForm.sprint_name.trim(),
        sprint_goal: createForm.sprint_goal || null,
        sprint_type: createForm.sprint_type || null,
        start_date: createForm.start_date || null,
        end_date: createForm.end_date || null,
        status: "Planned",
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "sprint created",
      summary: `Sprint "${createForm.sprint_name}" created`,
      client_id: client.id,
      engagement_id: engagementId,
      entity_type: "sprint",
      entity_id: data?.id,
    });
    toast.success("Sprint created");
    setCreateForm({ sprint_name: "", sprint_goal: "", sprint_type: "", start_date: "", end_date: "" });
    setShowCreateForm(false);
    refetchSprints();
    refresh();
    qc.invalidateQueries({ queryKey: ["aaos_sprints"] });
    if (data?.id) setSelectedSprintId(data.id);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowCreateForm((v) => !v)}>
          <Plus className="h-4 w-4 mr-1" />
          {showCreateForm ? "Cancel" : "Create sprint"}
        </Button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">New sprint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Sprint name *</Label>
              <Input
                value={createForm.sprint_name}
                onChange={(e) => setCreateForm((f) => ({ ...f, sprint_name: e.target.value }))}
                placeholder="e.g. Sprint 1 — Workflow automation"
              />
            </div>
            <div>
              <Label className="text-xs">Sprint goal</Label>
              <Input
                value={createForm.sprint_goal}
                onChange={(e) => setCreateForm((f) => ({ ...f, sprint_goal: e.target.value }))}
                placeholder="What should be achieved?"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[160px]">
                <Label className="text-xs">Sprint type</Label>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                  value={createForm.sprint_type}
                  onChange={(e) => setCreateForm((f) => ({ ...f, sprint_type: e.target.value }))}
                >
                  <option value="">— select —</option>
                  {SPRINT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <Label className="text-xs">Start date</Label>
                <Input
                  type="date"
                  value={createForm.start_date}
                  onChange={(e) => setCreateForm((f) => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <Label className="text-xs">End date</Label>
                <Input
                  type="date"
                  value={createForm.end_date}
                  onChange={(e) => setCreateForm((f) => ({ ...f, end_date: e.target.value }))}
                />
              </div>
            </div>
            <Button size="sm" onClick={handleCreateSprint}>Create sprint</Button>
          </CardContent>
        </Card>
      )}

      {/* Sprint selector */}
      {(sprints || []).length > 0 && (
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Active sprint:</Label>
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
          >
            <option value="">— select sprint —</option>
            {(sprints || []).map((s) => (
              <option key={s.id} value={s.id}>{s.sprint_name} ({s.status})</option>
            ))}
          </select>
        </div>
      )}

      {(sprints || []).length === 0 && (
        <p className="text-sm text-muted-foreground">No sprints yet. Create the first sprint above.</p>
      )}

      {/* Sprint board */}
      {selectedSprint && (
        <SprintBoard
          sprint={selectedSprint}
          client={client}
          engagementId={engagementId}
          onDone={() => {
            refetchSprints();
            refresh();
            qc.invalidateQueries({ queryKey: ["aaos_sprints"] });
          }}
        />
      )}
    </div>
  );
}

function SprintBoard({
  sprint,
  client,
  engagementId,
  onDone,
}: {
  sprint: Sprint;
  client: SectionProps["client"];
  engagementId: string | null | undefined;
  onDone: () => void;
}) {
  const qc = useQueryClient();

  const { data: opportunities } = useQuery({
    queryKey: ["aaos_ai_opportunities", client.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("aaos_ai_opportunities")
        .select("*")
        .eq("client_id", client.id);
      return (data || []) as Opportunity[];
    },
  });

  const { data: stories, refetch: refetchStories } = useQuery({
    queryKey: ["aaos_stories", sprint.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_stories")
        .select("*")
        .eq("sprint_id", sprint.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Story[];
    },
  });

  const [selectedOppId, setSelectedOppId] = useState<string>("");
  const selectedOpp = (opportunities || []).find((o) => o.id === selectedOppId) ?? null;

  // Sprint footer state
  const [footerEdit, setFooterEdit] = useState(false);
  const [footerForm, setFooterForm] = useState({
    sprint_review_notes: sprint.sprint_review_notes ?? "",
    retrospective_notes: sprint.retrospective_notes ?? "",
    ai_points_completed: sprint.ai_points_completed?.toString() ?? "",
    human_points_completed: sprint.human_points_completed?.toString() ?? "",
  });

  const handleSaveFooter = async () => {
    const { error } = await supabase
      .from("aaos_sprints")
      .update({
        sprint_review_notes: footerForm.sprint_review_notes || null,
        retrospective_notes: footerForm.retrospective_notes || null,
        ai_points_completed: footerForm.ai_points_completed !== "" ? Number(footerForm.ai_points_completed) : null,
        human_points_completed: footerForm.human_points_completed !== "" ? Number(footerForm.human_points_completed) : null,
      })
      .eq("id", sprint.id);
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "sprint updated",
      summary: `Sprint "${sprint.sprint_name}" review/retro notes updated`,
      client_id: client.id,
      engagement_id: engagementId,
      entity_type: "sprint",
      entity_id: sprint.id,
    });
    toast.success("Sprint saved");
    setFooterEdit(false);
    onDone();
  };

  const aiPts = sprint.ai_points_completed ?? 0;
  const humanPts = sprint.human_points_completed ?? 0;
  const leverage = humanPts > 0 ? (aiPts / humanPts).toFixed(1) : "—";

  return (
    <div className="space-y-4">
      {/* Sprint meta */}
      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{sprint.sprint_name}</span>
            <StatusPill status={sprint.status} />
            {sprint.sprint_type && <span className="text-xs text-muted-foreground">{sprint.sprint_type}</span>}
          </div>
          {sprint.sprint_goal && <p className="text-sm text-muted-foreground">{sprint.sprint_goal}</p>}
          {(sprint.start_date || sprint.end_date) && (
            <p className="text-xs text-muted-foreground">
              {sprint.start_date ?? "?"} → {sprint.end_date ?? "?"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Generate stories from opportunity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Generate stories from opportunity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-center">
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(e.target.value)}
          >
            <option value="">— select opportunity —</option>
            {(opportunities || []).map((o) => (
              <option key={o.id} value={o.id}>{o.opportunity_title}</option>
            ))}
          </select>
          <GenerateButton
            label="Generate stories"
            onRun={async () => {
              if (!selectedOpp) throw new Error("Select an opportunity first");
              return generateSprintStories(selectedOpp, sprint.id);
            }}
            onDone={() => {
              refetchStories();
              qc.invalidateQueries({ queryKey: ["aaos_stories", sprint.id] });
            }}
          />
        </CardContent>
      </Card>

      {/* Kanban board */}
      <div>
        <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Board</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {BOARD_COLUMNS.map((col) => {
            const colStories = (stories || []).filter((s) => s.status === col.status);
            return (
              <div key={col.status} className="min-h-[120px]">
                <div className="text-xs font-semibold text-muted-foreground mb-1 px-1">{col.label} ({colStories.length})</div>
                <div className="space-y-1">
                  {colStories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      clientId={client.id}
                      engagementId={engagementId}
                      onDone={() => {
                        refetchStories();
                        qc.invalidateQueries({ queryKey: ["aaos_stories", sprint.id] });
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Extra columns (Rejected, Deferred) */}
        {EXTRA_COLUMNS.some((col) => (stories || []).some((s) => s.status === col.status)) && (
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Other</div>
            <div className="grid grid-cols-2 gap-2">
              {EXTRA_COLUMNS.map((col) => {
                const colStories = (stories || []).filter((s) => s.status === col.status);
                if (colStories.length === 0) return null;
                return (
                  <div key={col.status}>
                    <div className="text-xs font-semibold text-muted-foreground mb-1 px-1">{col.label} ({colStories.length})</div>
                    <div className="space-y-1">
                      {colStories.map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          clientId={client.id}
                          engagementId={engagementId}
                          onDone={() => {
                            refetchStories();
                            qc.invalidateQueries({ queryKey: ["aaos_stories", sprint.id] });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sprint footer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Sprint review &amp; retro</span>
            <Button size="sm" variant="outline" onClick={() => setFooterEdit((v) => !v)}>
              {footerEdit ? "Cancel" : "Edit"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {footerEdit ? (
            <>
              <div>
                <Label className="text-xs">Sprint review notes</Label>
                <Textarea
                  rows={3}
                  value={footerForm.sprint_review_notes}
                  onChange={(e) => setFooterForm((f) => ({ ...f, sprint_review_notes: e.target.value }))}
                  placeholder="What was delivered?"
                />
              </div>
              <div>
                <Label className="text-xs">Retrospective notes</Label>
                <Textarea
                  rows={3}
                  value={footerForm.retrospective_notes}
                  onChange={(e) => setFooterForm((f) => ({ ...f, retrospective_notes: e.target.value }))}
                  placeholder="What should we improve?"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[120px]">
                  <Label className="text-xs">AI points completed</Label>
                  <Input
                    type="number"
                    value={footerForm.ai_points_completed}
                    onChange={(e) => setFooterForm((f) => ({ ...f, ai_points_completed: e.target.value }))}
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <Label className="text-xs">Human points completed</Label>
                  <Input
                    type="number"
                    value={footerForm.human_points_completed}
                    onChange={(e) => setFooterForm((f) => ({ ...f, human_points_completed: e.target.value }))}
                  />
                </div>
              </div>
              <Button size="sm" onClick={handleSaveFooter}>Save</Button>
            </>
          ) : (
            <div className="space-y-2 text-sm">
              {sprint.sprint_review_notes && (
                <div>
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Review: </span>
                  {sprint.sprint_review_notes}
                </div>
              )}
              {sprint.retrospective_notes && (
                <div>
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Retro: </span>
                  {sprint.retrospective_notes}
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>AI pts: <strong>{aiPts}</strong></span>
                <span>Human pts: <strong>{humanPts}</strong></span>
                <span>AI leverage: <strong>{leverage}x</strong></span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StoryCard({
  story,
  clientId,
  engagementId,
  onDone,
}: {
  story: Story;
  clientId: string;
  engagementId: string | null | undefined;
  onDone: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editForm, setEditForm] = useState({
    acceptance_criteria: story.acceptance_criteria ?? "",
    definition_of_done: story.definition_of_done ?? "",
    golden_test: story.golden_test ?? "",
    owner_type: story.owner_type ?? "",
    points: story.points?.toString() ?? "",
    blocker_notes: story.blocker_notes ?? "",
    human_review_required: story.human_review_required ?? false,
    review_status: story.review_status ?? "Not Required",
  });

  const handleStatusChange = async (status: string) => {
    if (
      status === "Done" &&
      story.human_review_required &&
      story.review_status !== "Approved"
    ) {
      toast.error("Requires human review before Done");
      return;
    }
    const { error } = await supabase
      .from("aaos_stories")
      .update({ status })
      .eq("id", story.id);
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "story status updated",
      summary: `Story "${story.story_title}" → ${status}`,
      client_id: clientId,
      engagement_id: engagementId,
      entity_type: "story",
      entity_id: story.id,
    });
    onDone();
  };

  const handleSaveEdit = async () => {
    const { error } = await supabase
      .from("aaos_stories")
      .update({
        acceptance_criteria: editForm.acceptance_criteria || null,
        definition_of_done: editForm.definition_of_done || null,
        golden_test: editForm.golden_test || null,
        owner_type: editForm.owner_type || null,
        points: editForm.points !== "" ? Number(editForm.points) : null,
        blocker_notes: editForm.blocker_notes || null,
        human_review_required: editForm.human_review_required,
        review_status: editForm.review_status || null,
      })
      .eq("id", story.id);
    if (error) { toast.error(error.message); return; }
    await logActivity({
      action: "story updated",
      summary: `Story "${story.story_title}" details updated`,
      client_id: clientId,
      engagement_id: engagementId,
      entity_type: "story",
      entity_id: story.id,
    });
    toast.success("Story saved");
    onDone();
  };

  const needsReview = story.human_review_required && story.review_status !== "Approved";

  return (
    <div className="rounded-md border bg-card p-2 text-xs space-y-1">
      <div className="flex items-start justify-between gap-1">
        <span className="font-medium leading-tight line-clamp-2">{story.story_title}</span>
        <button onClick={() => setExpanded((v) => !v)} className="shrink-0 text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {story.owner_type && <span className="text-muted-foreground">{story.owner_type}</span>}
        {story.points != null && <span className="text-muted-foreground">· {story.points}pt</span>}
      </div>

      {needsReview && <HumanReviewBadge />}

      {/* Status select */}
      <select
        className="h-7 rounded-md border bg-background px-1.5 text-xs w-full"
        value={story.status || "Inbox"}
        onChange={(e) => handleStatusChange(e.target.value)}
      >
        {STORY_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Expanded editor */}
      {expanded && (
        <div className="pt-2 border-t space-y-2">
          {/* review_status */}
          <div>
            <Label className="text-xs">Review status</Label>
            <select
              className="h-8 rounded-md border bg-background px-2 text-xs w-full"
              value={editForm.review_status}
              onChange={(e) => setEditForm((f) => ({ ...f, review_status: e.target.value }))}
            >
              {STORY_REVIEW_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs">Owner type</Label>
            <select
              className="h-8 rounded-md border bg-background px-2 text-xs w-full"
              value={editForm.owner_type}
              onChange={(e) => setEditForm((f) => ({ ...f, owner_type: e.target.value }))}
            >
              <option value="">— select —</option>
              {OWNER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs">Points</Label>
            <Input
              type="number"
              className="h-7 text-xs"
              value={editForm.points}
              onChange={(e) => setEditForm((f) => ({ ...f, points: e.target.value }))}
            />
          </div>

          <div>
            <Label className="text-xs">Acceptance criteria</Label>
            <Textarea
              rows={2}
              className="text-xs"
              value={editForm.acceptance_criteria}
              onChange={(e) => setEditForm((f) => ({ ...f, acceptance_criteria: e.target.value }))}
            />
          </div>

          <div>
            <Label className="text-xs">Definition of done</Label>
            <Textarea
              rows={2}
              className="text-xs"
              value={editForm.definition_of_done}
              onChange={(e) => setEditForm((f) => ({ ...f, definition_of_done: e.target.value }))}
            />
          </div>

          <div>
            <Label className="text-xs">Golden test</Label>
            <Textarea
              rows={2}
              className="text-xs"
              value={editForm.golden_test}
              onChange={(e) => setEditForm((f) => ({ ...f, golden_test: e.target.value }))}
            />
          </div>

          <div>
            <Label className="text-xs">Blocker notes</Label>
            <Textarea
              rows={2}
              className="text-xs"
              value={editForm.blocker_notes}
              onChange={(e) => setEditForm((f) => ({ ...f, blocker_notes: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id={`hr-${story.id}`}
              type="checkbox"
              checked={editForm.human_review_required}
              onChange={(e) => setEditForm((f) => ({ ...f, human_review_required: e.target.checked }))}
            />
            <Label htmlFor={`hr-${story.id}`} className="text-xs">Human review required</Label>
          </div>

          <Button size="sm" onClick={handleSaveEdit} className="h-7 text-xs">Save</Button>
        </div>
      )}
    </div>
  );
}
