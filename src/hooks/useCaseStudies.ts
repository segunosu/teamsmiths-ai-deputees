import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  client_profile: string | null;
  short_summary: string | null;
  challenge: string | null;
  solution: string | null;
  timeline_days: number | null;
  deliverables: string[] | null;
  results: Array<{ value: string; label: string }> | null;
  measurement: string | null;
  quote: string | null;
  assumptions: string[] | null;
  roi_example: string | null;
  cta_primary: string | null;
  cta_primary_url: string | null;
  cta_secondary: string | null;
  cta_secondary_url: string | null;
  category: string | null;
  created_at: string;
}

export const useCaseStudies = () => {
  return useQuery({
    queryKey: ["business-case-studies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_case_studies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CaseStudy[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCaseStudy = (slug: string) => {
  return useQuery({
    queryKey: ["business-case-study", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_case_studies")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as CaseStudy;
    },
    enabled: !!slug,
  });
};
