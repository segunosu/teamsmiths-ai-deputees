import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import { REPORT_TYPES, REPORT_STATUSES } from "../../spineConstants";
import { generateReport } from "../../lib/alphaGen";
import { GenerateButton, StatusPill } from "../spineUi";
import { logActivity } from "../../lib/activity";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";

export function ReportsSection({ client, refresh }: SectionProps) {
  const qc = useQueryClient();
  const engagementId = client.current_engagement_id;

  const [selectedReportType, setSelectedReportType] = useState<string>(REPORT_TYPES[0]);

  const { data: reports, refetch } = useQuery({
    queryKey: ["aaos_reports", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_reports")
        .select("*")
        .eq("client_id", client.id)
        .order("generated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const onDone = () => {
    refetch();
    refresh();
    qc.invalidateQueries({ queryKey: ["aaos_reports", client.id] });
  };

  const updateReportField = async (id: string, fields: Record<string, unknown>) => {
    const { error } = await supabase.from("aaos_reports").update(fields).eq("id", id);
    if (error) { toast.error(error.message); return false; }
    refetch();
    return true;
  };

  const handleReviewStatusChange = async (report: any, status: string) => {
    const ok = await updateReportField(report.id, { review_status: status });
    if (ok) {
      await logActivity({ action: "report review status updated", summary: `Report "${report.title}" set to ${status}`, client_id: client.id, entity_type: "report", entity_id: report.id });
    }
  };

  const handleApprovedForClient = async (report: any, approved: boolean) => {
    if (approved && report.review_status !== "Approved") {
      toast.error("Report must be in 'Approved' review status before approving for client sharing.");
      return;
    }
    const ok = await updateReportField(report.id, { approved_for_client: approved });
    if (ok) {
      await logActivity({ action: "report approval updated", summary: `Report "${report.title}" client approval: ${approved}`, client_id: client.id, entity_type: "report", entity_id: report.id });
      toast.success(approved ? "Approved for client" : "Approval removed");
    }
  };

  const deleteReport = async (id: string, title: string) => {
    if (!window.confirm("Delete this report?")) return;
    const { error } = await supabase.from("aaos_reports").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refetch();
    toast.success("Deleted");
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={selectedReportType}
          onChange={(e) => setSelectedReportType(e.target.value)}
        >
          {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <GenerateButton
          label="Generate report"
          onRun={() => generateReport(client, engagementId ?? null, selectedReportType)}
          onDone={onDone}
        />
      </div>

      {/* Muted note */}
      <p className="text-xs text-muted-foreground">
        Human review required before client sharing.
      </p>

      {/* List */}
      <div className="space-y-4">
        {(reports || []).length === 0 && <p className="text-sm text-muted-foreground">No reports generated yet.</p>}
        {(reports || []).map((r: any) => (
          <Card key={r.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-sm font-medium">{r.title}</CardTitle>
                  <span className="text-xs text-muted-foreground">{r.report_type}</span>
                  <StatusPill status={r.review_status} />
                  {r.approved_for_client && (
                    <span className="inline-flex items-center rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Approved for client
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {r.generated_content && (
                    <Button size="sm" variant="outline" className="h-8" onClick={() => copyToClipboard(r.generated_content)}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => deleteReport(r.id, r.title)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {r.generated_at && (
                <p className="text-xs text-muted-foreground">Generated: {new Date(r.generated_at).toLocaleString()}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {r.generated_content && (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md border bg-muted/10 p-3 text-sm font-mono leading-relaxed max-h-72 overflow-y-auto">
                  {r.generated_content}
                </div>
              )}

              {/* Review controls */}
              <div className="flex flex-wrap items-center gap-4 border-t pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Review status:</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                    value={r.review_status || ""}
                    onChange={(e) => handleReviewStatusChange(r, e.target.value)}
                  >
                    {REPORT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`approved-${r.id}`}
                    checked={!!r.approved_for_client}
                    onChange={(e) => handleApprovedForClient(r, e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`approved-${r.id}`} className="text-xs text-muted-foreground cursor-pointer">
                    Approved for client
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
