import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { StatusPill, Field } from "../spineUi";
import { NarrativeNotes } from "../NarrativeNotes";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";

export function OverviewSection({ client, refresh }: SectionProps) {
  const { data: company } = useQuery({
    queryKey: ["aaos_company_overview", client.company_id],
    queryFn: async () => {
      if (!client.company_id) return null;
      const { data } = await supabase
        .from("aaos_companies")
        .select("*")
        .eq("id", client.company_id)
        .maybeSingle();
      return data;
    },
    enabled: !!client.company_id,
  });

  const { data: latestScore } = useQuery({
    queryKey: ["aaos_company_score_overview", client.company_id],
    queryFn: async () => {
      if (!client.company_id) return null;
      const { data } = await supabase
        .from("aaos_company_scores")
        .select("ai_alpha_fit_score, score_band")
        .eq("company_id", client.company_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!client.company_id,
  });

  const { data: engagementCount } = useQuery({
    queryKey: ["aaos_engagement_count", client.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("aaos_engagements")
        .select("*", { count: "exact", head: true })
        .eq("client_id", client.id);
      return count ?? 0;
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Name">{client.client_name}</Field>
            <Field label="Sector">{client.sector}</Field>
            <Field label="Region">{client.region}</Field>
            <Field label="Status">
              <StatusPill status={client.status} />
            </Field>
            <Field label="Primary contact">{client.primary_contact_name}</Field>
            <Field label="Contact email">{client.primary_contact_email}</Field>
            <Field label="Onboarding status">{client.onboarding_status}</Field>
            <Field label="Engagements">{engagementCount}</Field>
          </CardContent>
        </Card>

        {client.company_id && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Source prospect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {company ? (
                <>
                  <Field label="Company">{company.company_name}</Field>
                  <Field label="Sector">{company.sector}</Field>
                  <Field label="Region">{company.region}</Field>
                  {latestScore && (
                    <>
                      <Field label="AI Alpha fit score">
                        {latestScore.ai_alpha_fit_score != null
                          ? String(latestScore.ai_alpha_fit_score)
                          : "—"}
                      </Field>
                      <Field label="Score band">{latestScore.score_band}</Field>
                    </>
                  )}
                  <Link
                    to={`/agile-ai-alpha/companies/${client.company_id}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Building2 className="h-3.5 w-3.5" /> View prospect record
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Loading company…</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right column */}
      <div>
        <NarrativeNotes
          companyId={client.company_id}
          clientId={client.id}
          entityType="client"
          entityId={client.id}
          title="Client narrative & observations"
        />
      </div>
    </div>
  );
}
