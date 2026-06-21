import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { findClientForCompany, createClientWorkspace } from "../lib/conversion";

// Shown on a company detail page; lets the operator convert an accepted/onboarded
// prospect into a client workspace (idempotent) or open the existing one.
export function ConvertClientBanner({ company, onConverted }: { company: any; onConverted?: () => void }) {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const eligible = company?.status === "Accepted" || company?.status === "Onboarded";

  useEffect(() => {
    let active = true;
    if (company?.id) {
      findClientForCompany(company.id).then((c) => { if (active) setClientId(c?.id ?? null); });
    }
    return () => { active = false; };
  }, [company?.id]);

  if (!eligible && !clientId) return null;

  const create = async () => {
    setBusy(true);
    try {
      const { client, created } = await createClientWorkspace(company);
      setClientId(client.id);
      toast.success(created ? "Client workspace created" : "Client workspace already exists");
      onConverted?.();
      navigate(`/agile-ai-alpha/clients/${client.id}`);
    } catch (e: any) {
      toast.error(e.message || "Conversion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mb-4 border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">{clientId ? "Client workspace active" : "This prospect is accepted"}</div>
            <div className="text-sm text-muted-foreground">
              {clientId
                ? "Continue into delivery — diagnostic, opportunities, sprints, governance, KPIs and value."
                : "Convert it into a client workspace to begin engagement, diagnostic and delivery."}
            </div>
          </div>
        </div>
        {clientId ? (
          <Button onClick={() => navigate(`/agile-ai-alpha/clients/${clientId}`)}>
            Open Client Workspace <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={create} disabled={busy}>
            {busy ? "Creating…" : "Create Client Workspace"} <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </Card>
  );
}
