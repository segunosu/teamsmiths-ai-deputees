import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlphaLayout } from "../components/AlphaLayout";
import { StatusPill } from "../components/spineUi";
import { CLIENT_STATUSES } from "../spineConstants";

export default function AlphaClients() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["aaos_clients_list"],
    queryFn: async () => {
      const [clients, engagements] = await Promise.all([
        supabase.from("aaos_clients").select("*").order("created_at", { ascending: false }),
        supabase.from("aaos_engagements").select("client_id, status"),
      ]);
      return {
        clients: clients.data || [],
        engagements: engagements.data || [],
      };
    },
  });

  if (isLoading || !data) {
    return (
      <AlphaLayout title="Clients">
        <div className="text-muted-foreground">Loading…</div>
      </AlphaLayout>
    );
  }

  const { clients, engagements } = data;

  const engagementCountByClient = new Map<string, number>();
  engagements.forEach((e) => {
    if (e.client_id) {
      engagementCountByClient.set(e.client_id, (engagementCountByClient.get(e.client_id) || 0) + 1);
    }
  });

  const filtered = clients.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSearch = !search || c.client_name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AlphaLayout title="Clients">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Clients ({filtered.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-48"
          />
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {CLIENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            {clients.length === 0
              ? "No clients yet. Convert an accepted prospect from a company's detail page."
              : "No clients match the current filters."}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Sector</th>
                    <th className="px-4 py-3">Region</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Engagements</th>
                    <th className="px-4 py-3">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <Link
                          to={`/agile-ai-alpha/clients/${c.id}`}
                          className="text-primary hover:underline"
                        >
                          {c.client_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.sector || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.region || "—"}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {engagementCountByClient.get(c.id) || 0}
                      </td>
                      <td className="px-4 py-3">
                        {c.company_id ? (
                          <Link
                            to={`/agile-ai-alpha/companies/${c.company_id}`}
                            className="text-xs text-primary hover:underline"
                          >
                            source
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </AlphaLayout>
  );
}
