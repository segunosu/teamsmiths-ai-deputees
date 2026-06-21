// AI Alpha OS — activity log helper.
import { supabase } from "@/integrations/supabase/client";

export async function logActivity(params: {
  action: string;
  summary: string;
  company_id?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  metadata_json?: Record<string, unknown> | null;
}) {
  try {
    await supabase.from("aaos_activity_log").insert({
      action: params.action,
      summary: params.summary,
      company_id: params.company_id ?? null,
      entity_type: params.entity_type ?? null,
      entity_id: params.entity_id ?? null,
      metadata_json: (params.metadata_json ?? null) as never,
    });
  } catch (e) {
    // Activity logging must never block the primary action.
    console.error("logActivity failed", e);
  }
}
