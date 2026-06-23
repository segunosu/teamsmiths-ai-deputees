import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Loader2 } from "lucide-react";
import type { TabProps } from "../../pages/AlphaCompanyDetail";
import {
  COMPANY_STATUSES,
  ACCEPTANCE_DECISIONS,
  ACCEPTED_OFFER_ROUTES,
} from "../../constants";
import { logActivity } from "../../lib/activity";
import { generateOnboardingPack } from "../../lib/generation";
import { HumanReviewBadge } from "../RagBadge";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{value || <span className="text-muted-foreground/60">—</span>}</span>
    </div>
  );
}

function LinkRow({ label, value, href }: { label: string; value?: string | null; href?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
          {value || href}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-sm">{value || <span className="text-muted-foreground/60">—</span>}</span>
      )}
    </div>
  );
}

export function OverviewTab({ companyId, company, refresh }: TabProps) {
  const qc = useQueryClient();

  // Status card state
  const [statusSaving, setStatusSaving] = useState(false);

  // Acceptance gate state
  const [decision, setDecision] = useState<string>(company.acceptance_decision ?? "");
  const [decisionReason, setDecisionReason] = useState<string>(company.decision_reason ?? "");
  const [rejectionReason, setRejectionReason] = useState<string>(company.rejection_reason ?? "");
  const [nextAction, setNextAction] = useState<string>(company.next_action ?? "");
  const [nextActionDue, setNextActionDue] = useState<string>(
    company.next_action_due_date ? company.next_action_due_date.slice(0, 10) : ""
  );
  const [acceptedRoute, setAcceptedRoute] = useState<string>(company.accepted_offer_route ?? "");
  const [humanReview, setHumanReview] = useState<boolean>(company.human_review_required ?? false);
  const [gateSaving, setGateSaving] = useState(false);
  const [packLoading, setPackLoading] = useState(false);

  async function handleStatusChange(newStatus: string) {
    setStatusSaving(true);
    try {
      const { error } = await supabase
        .from("aaos_companies")
        .update({ status: newStatus as typeof COMPANY_STATUSES[number] })
        .eq("id", companyId);
      if (error) throw error;
      await logActivity({
        action: "status changed",
        summary: `Status → ${newStatus}`,
        company_id: companyId,
        entity_type: "company",
        entity_id: companyId,
      });
      toast.success(`Status updated to "${newStatus}"`);
      qc.invalidateQueries({ queryKey: ["aaos_company", companyId] });
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleGateSave() {
    if (decision === "Reject" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason before saving.");
      return;
    }
    if (decision === "Accept" && !acceptedRoute) {
      toast.error("Please select an accepted offer route before saving.");
      return;
    }

    setGateSaving(true);
    try {
      const payload: Record<string, unknown> = {
        acceptance_decision: decision || null,
        decision_reason: decisionReason || null,
        next_action: nextAction || null,
        next_action_due_date: nextActionDue || null,
        human_review_required: humanReview,
        rejection_reason: decision === "Reject" ? rejectionReason || null : null,
        accepted_offer_route: decision === "Accept" ? acceptedRoute || null : null,
      };

      const { error } = await supabase
        .from("aaos_companies")
        .update(payload)
        .eq("id", companyId);
      if (error) throw error;

      const action =
        decision === "Accept"
          ? "accepted decision"
          : decision === "Reject"
          ? "rejected decision"
          : "status changed";

      await logActivity({
        action,
        summary: `Acceptance → ${decision || "cleared"}`,
        company_id: companyId,
        entity_type: "company",
        entity_id: companyId,
      });

      toast.success("Client acceptance gate saved.");
      qc.invalidateQueries({ queryKey: ["aaos_company", companyId] });
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to save acceptance gate");
    } finally {
      setGateSaving(false);
    }
  }

  async function handleGeneratePack() {
    setPackLoading(true);
    try {
      await generateOnboardingPack(companyId);
      toast.success("Onboarding pack generated.");
      qc.invalidateQueries({ queryKey: ["aaos_company", companyId] });
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to generate onboarding pack");
    } finally {
      setPackLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {company.human_review_required && (
        <div className="flex items-center gap-2">
          <HumanReviewBadge />
        </div>
      )}

      {/* Key Facts */}
      <Card>
        <CardHeader>
          <CardTitle>Company Facts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
            <InfoRow label="Sector" value={company.sector} />
            <InfoRow label="Sub-sector" value={company.subsector} />
            <InfoRow label="Country" value={company.country} />
            <InfoRow label="Region" value={company.region} />
            <InfoRow label="Size band" value={company.company_size_band} />
            <InfoRow label="Revenue band" value={company.estimated_revenue_band} />
            <InfoRow label="Ownership type" value={company.ownership_type} />
            <InfoRow label="Funding stage" value={company.funding_stage} />
            <InfoRow label="Owner / CEO" value={company.owner_or_ceo_name} />
            {company.owner_or_ceo_linkedin ? (
              <LinkRow label="CEO LinkedIn" value="LinkedIn" href={company.owner_or_ceo_linkedin} />
            ) : (
              <InfoRow label="CEO LinkedIn" value={null} />
            )}
            <InfoRow label="Key contact" value={company.key_contact_name} />
            <InfoRow label="Contact role" value={company.key_contact_role} />
            <InfoRow label="Contact email" value={company.key_contact_email} />
            <InfoRow label="Source" value={company.source} />
            {company.source_url ? (
              <LinkRow label="Source URL" value="Link" href={company.source_url} />
            ) : (
              <InfoRow label="Source URL" value={null} />
            )}
            {company.website ? (
              <LinkRow label="Website" value={company.website} href={company.website} />
            ) : (
              <InfoRow label="Website" value={null} />
            )}
          </div>
          {company.notes && (
            <div className="mt-4">
              <InfoRow label="Notes" value={company.notes} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="status-select">Status</Label>
            <select
              id="status-select"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={company.status ?? ""}
              disabled={statusSaving}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="">— select —</option>
              {COMPANY_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {statusSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </CardContent>
      </Card>

      {/* Client Acceptance Gate */}
      <Card>
        <CardHeader>
          <CardTitle>Client Acceptance Gate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="acceptance-decision">Acceptance decision</Label>
              <select
                id="acceptance-decision"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={decision}
                onChange={(e) => {
                  const val = e.target.value;
                  setDecision(val);
                  if (val === "Accept") setHumanReview(true);
                }}
              >
                <option value="">— none —</option>
                {ACCEPTANCE_DECISIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {decision === "Accept" && (
              <div className="space-y-1.5">
                <Label htmlFor="offer-route">Accepted offer route</Label>
                <select
                  id="offer-route"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={acceptedRoute}
                  onChange={(e) => setAcceptedRoute(e.target.value)}
                >
                  <option value="">— select route —</option>
                  {ACCEPTED_OFFER_ROUTES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {decision === "Accept" && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Human review required before a company is fully accepted into delivery.
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="decision-reason">Decision reason</Label>
            <Textarea
              id="decision-reason"
              rows={2}
              placeholder="Reason for this decision…"
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
            />
          </div>

          {decision === "Reject" && (
            <div className="space-y-1.5">
              <Label htmlFor="rejection-reason">
                Rejection reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                rows={2}
                placeholder="Required when rejecting…"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="next-action">Next action</Label>
              <Input
                id="next-action"
                placeholder="e.g. Send proposal"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next-action-due">Next action due date</Label>
              <Input
                id="next-action-due"
                type="date"
                value={nextActionDue}
                onChange={(e) => setNextActionDue(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="human-review"
              type="checkbox"
              className="h-4 w-4 rounded border"
              checked={humanReview}
              onChange={(e) => setHumanReview(e.target.checked)}
            />
            <Label htmlFor="human-review">Human review required</Label>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleGateSave} disabled={gateSaving}>
              {gateSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save acceptance gate
            </Button>
            {decision === "Accept" && (
              <Button variant="outline" onClick={handleGeneratePack} disabled={packLoading}>
                {packLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate onboarding pack
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
