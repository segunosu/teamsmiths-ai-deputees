import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Trash2, Plus } from "lucide-react";
import { TASK_STATUSES, TASK_PRIORITIES } from "../../constants";
import { generateOnboardingPack } from "../../lib/generation";
import { logActivity } from "../../lib/activity";
import type { TabProps } from "../../pages/AlphaCompanyDetail";
import type { OnboardingTask } from "../../types";

const PRIORITY_CLASSES: Record<string, string> = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-muted text-muted-foreground border-border",
};

function PriorityBadge({ priority }: { priority: string | null }) {
  const p = priority ?? "low";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${PRIORITY_CLASSES[p] ?? PRIORITY_CLASSES.low}`}
    >
      {p}
    </span>
  );
}

function TaskRow({
  task,
  companyId,
  refetch,
}: {
  task: OnboardingTask;
  companyId: string;
  refetch: () => void;
}) {
  const [status, setStatus] = useState(task.status ?? "todo");
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setSaving(true);
    try {
      const completedAt = newStatus === "done" ? new Date().toISOString() : null;
      const { error } = await supabase
        .from("aaos_onboarding_tasks")
        .update({ status: newStatus, completed_at: completedAt })
        .eq("id", task.id);
      if (error) throw error;
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDueDateChange = async (newDate: string) => {
    setDueDate(newDate);
    setSaving(true);
    try {
      const { error } = await supabase
        .from("aaos_onboarding_tasks")
        .update({ due_date: newDate || null })
        .eq("id", task.id);
      if (error) throw error;
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("aaos_onboarding_tasks")
        .delete()
        .eq("id", task.id);
      if (error) throw error;
      toast.success("Task deleted");
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium ${status === "done" ? "line-through text-muted-foreground" : ""}`}
          >
            {task.task_title}
          </span>
          <PriorityBadge priority={task.priority} />
          {task.owner && (
            <span className="text-xs text-muted-foreground">@{task.owner}</span>
          )}
        </div>
        {task.task_description && (
          <p className="text-xs text-muted-foreground">{task.task_description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => handleDueDateChange(e.target.value)}
          className="h-8 rounded-md border bg-background px-2 text-xs w-32"
        />
        <select
          className="h-8 rounded-md border bg-background px-2 text-xs"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={saving}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function OnboardingTab({ companyId, company, refresh }: TabProps) {
  const [generating, setGenerating] = useState(false);
  const [adding, setAdding] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newPriority, setNewPriority] = useState<string>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: tasks = [], refetch } = useQuery({
    queryKey: ["aaos_onboarding_tasks", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_onboarding_tasks")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as OnboardingTask[];
    },
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateOnboardingPack(companyId);
      toast.success("Onboarding pack generated");
      refetch();
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTitle.trim()) {
      toast.error("Task title is required");
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase.from("aaos_onboarding_tasks").insert({
        company_id: companyId,
        task_title: newTitle.trim(),
        task_description: newDesc.trim() || null,
        owner: newOwner.trim() || null,
        priority: newPriority,
        due_date: newDueDate || null,
        status: "todo",
      });
      if (error) throw error;
      await logActivity({
        action: "onboarding task added",
        summary: newTitle.trim(),
        company_id: companyId,
        entity_type: "onboarding",
      });
      toast.success("Task added");
      setNewTitle("");
      setNewDesc("");
      setNewOwner("");
      setNewPriority("medium");
      setNewDueDate("");
      setShowForm(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Add failed");
    } finally {
      setAdding(false);
    }
  };

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const notAccepted = company.acceptance_decision !== "Accept";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Onboarding Tasks</h3>
          {notAccepted && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Tip: accept this company first (Overview tab) — the pack is intended for accepted companies.
            </p>
          )}
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="shrink-0">
          <Sparkles className="h-4 w-4 mr-1.5" />
          {generating ? "Generating…" : "Generate onboarding pack"}
        </Button>
      </div>

      {tasks.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {doneTasks} of {tasks.length} done
        </p>
      )}

      <Card>
        <CardContent className="pt-4 pb-2">
          {tasks.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">
              No tasks yet. Generate an onboarding pack or add a custom task.
            </p>
          ) : (
            <div>
              {tasks.map((t) => (
                <TaskRow key={t.id} task={t} companyId={companyId} refetch={refetch} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add custom task */}
      {!showForm ? (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add custom task
        </Button>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Add custom task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Task title *</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Owner</Label>
                <Input
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  placeholder="Owner name"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Due date</Label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTask} disabled={adding}>
                {adding ? "Adding…" : "Add task"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
