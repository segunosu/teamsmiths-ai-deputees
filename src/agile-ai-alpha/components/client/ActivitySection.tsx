import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import type { SectionProps } from "../../pages/AlphaClientWorkspace";

interface ActivityEntry {
  id: string;
  action: string;
  summary: string | null;
  created_at: string;
  client_id: string | null;
  company_id: string | null;
  engagement_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
}

export function ActivitySection({ client }: SectionProps) {
  const { data: activities, isLoading } = useQuery<ActivityEntry[]>({
    queryKey: ["aaos_activity_log", client.id, client.company_id],
    queryFn: async () => {
      let q = supabase
        .from("aaos_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (client.company_id) {
        q = q.or(`client_id.eq.${client.id},company_id.eq.${client.company_id}`);
      } else {
        q = q.eq("client_id", client.id);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as ActivityEntry[];
    },
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" /> Activity log ({activities?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading activity…</p>
        )}
        {!isLoading && (activities || []).length === 0 && (
          <p className="text-sm text-muted-foreground">No activity recorded yet for this client.</p>
        )}
        <div className="space-y-2">
          {(activities || []).map((entry) => (
            <div key={entry.id} className="flex gap-3 py-2 border-b last:border-b-0">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary/60 shrink-0 mt-1.5" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-medium text-sm">{entry.action}</span>
                  {entry.entity_type && (
                    <span className="text-xs text-muted-foreground rounded-full bg-muted px-2 py-0.5">
                      {entry.entity_type}
                    </span>
                  )}
                </div>
                {entry.summary && (
                  <p className="text-sm text-muted-foreground">{entry.summary}</p>
                )}
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
