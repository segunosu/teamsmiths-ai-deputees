// AI Alpha OS — generation service abstraction.
// Calls the `aaos-generate` edge function which uses AI (OpenAI) for
// snapshot / outreach / proposal, and deterministic logic for onboarding.
import { supabase } from "@/integrations/supabase/client";

export type GenerationType = "snapshot" | "outreach" | "proposal" | "onboarding";

async function invoke(type: GenerationType, companyId: string, routeType?: string) {
  const { data, error } = await supabase.functions.invoke("aaos-generate", {
    body: { type, company_id: companyId, route_type: routeType },
  });
  if (error) {
    // Surface the function's JSON error body when present.
    const msg = (data as any)?.error || error.message || "Generation failed";
    throw new Error(msg);
  }
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as any;
}

export const generateSnapshot = (companyId: string) => invoke("snapshot", companyId);
export const generateOutreach = (companyId: string) => invoke("outreach", companyId);
export const generateProposalRoute = (companyId: string, routeType?: string) =>
  invoke("proposal", companyId, routeType);
export const generateOnboardingPack = (companyId: string) => invoke("onboarding", companyId);
