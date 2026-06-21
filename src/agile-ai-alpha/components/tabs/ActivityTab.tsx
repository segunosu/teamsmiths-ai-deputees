import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { TabProps } from "../../pages/AlphaCompanyDetail";

export function ActivityTab({ companyId, company, refresh }: TabProps) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["aaos_activity_log", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aaos_activity_log")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading activity…
            </div>
          )}
          {!isLoading && logs.length === 0 && (
            <p className="text-sm text-muted-foreground">No activity recorded yet for this company.</p>
          )}
          {!isLoading && logs.length > 0 && (
            <ol className="relative border-l border-border pl-6 space-y-5">
              {logs.map((log) => (
                <li key={log.id} className="relative">
                  {/* Timeline dot */}
                  <span className="absolute -left-[25px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  </span>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold leading-snug">{log.action}</span>
                    {log.summary && (
                      <span className="text-sm text-muted-foreground">{log.summary}</span>
                    )}
                    <span className="text-xs text-muted-foreground/70">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
