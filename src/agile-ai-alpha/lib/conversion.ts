// AI Alpha OS — Workflow 1: Accepted Prospect -> Client conversion (idempotent).
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "./activity";
import { OFFER_ROUTE_TO_ENGAGEMENT } from "../spineConstants";
import type { Client } from "../spineTypes";

export async function findClientForCompany(companyId: string): Promise<Client | null> {
  const { data } = await supabase
    .from("aaos_clients")
    .select("*")
    .eq("company_id", companyId)
    .limit(1)
    .maybeSingle();
  return (data as Client) ?? null;
}

export interface ConversionResult { client: Client; created: boolean; }

/**
 * Create (or return existing) client workspace from an accepted/onboarded company.
 * Creates: client + default engagement + diagnostic shell. Never duplicates.
 */
export async function createClientWorkspace(company: any): Promise<ConversionResult> {
  const existing = await findClientForCompany(company.id);
  if (existing) return { client: existing, created: false };

  // 1. Client
  const { data: client, error: cErr } = await supabase
    .from("aaos_clients")
    .insert({
      company_id: company.id,
      created_from_company_id: company.id,
      client_name: company.company_name,
      primary_contact_name: company.key_contact_name ?? company.owner_or_ceo_name ?? null,
      primary_contact_email: company.key_contact_email ?? null,
      sector: company.sector ?? null,
      region: company.region ?? null,
      status: "Active",
      source_company_status: company.status ?? null,
      onboarding_status: "Workspace created",
    })
    .select()
    .single();
  if (cErr) throw cErr;

  // 2. Default engagement (type from accepted offer route)
  const engType = OFFER_ROUTE_TO_ENGAGEMENT[company.accepted_offer_route] || "AI Alpha Diagnostic";
  const { data: engagement } = await supabase
    .from("aaos_engagements")
    .insert({
      client_id: client.id,
      company_id: company.id,
      engagement_name: `${company.company_name} — ${engType}`,
      engagement_type: engType,
      status: "Draft",
      commercial_model: "Internal Demo",
      owner: "Owner",
    })
    .select()
    .single();

  if (engagement) {
    await supabase.from("aaos_clients").update({ current_engagement_id: engagement.id }).eq("id", client.id);

    // 3. Diagnostic shell
    await supabase.from("aaos_diagnostics").insert({
      client_id: client.id,
      engagement_id: engagement.id,
      diagnostic_name: "AI Alpha Diagnostic",
      status: "Draft",
      human_review_required: true,
      review_status: "draft",
    });
  }

  await logActivity({
    action: "client created",
    summary: `Client workspace created for ${company.company_name}`,
    company_id: company.id,
    entity_type: "client",
    entity_id: client.id,
  });

  return { client: client as Client, created: true };
}
