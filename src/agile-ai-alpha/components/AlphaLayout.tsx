import { NavLink, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Building2, LineChart, Settings as SettingsIcon, Sparkles, Gauge, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Journey-first navigation: 6 destinations, each a job — not a database table.
// Pipeline groups Prospects + Companies; Playbooks groups Artefact studio + Portfolio patterns.
const NAV = [
  { to: "/agile-ai-alpha/command-centre", label: "Today", icon: Gauge, match: ["/agile-ai-alpha/command-centre"] },
  { to: "/agile-ai-alpha", label: "Pipeline", icon: Building2, match: ["/agile-ai-alpha", "/agile-ai-alpha/companies"], exactRoot: true },
  { to: "/agile-ai-alpha/clients", label: "Clients", icon: Users, match: ["/agile-ai-alpha/clients", "/agile-ai-alpha/engagements"] },
  { to: "/agile-ai-alpha/governance", label: "Playbooks", icon: ShieldCheck, match: ["/agile-ai-alpha/governance", "/agile-ai-alpha/portfolio"] },
  { to: "/agile-ai-alpha/value-ledger", label: "Value", icon: LineChart, match: ["/agile-ai-alpha/value-ledger"] },
  { to: "/agile-ai-alpha/settings", label: "Settings", icon: SettingsIcon, match: ["/agile-ai-alpha/settings"] },
];

function navIsActive(item: (typeof NAV)[number], pathname: string) {
  return item.match.some((m) =>
    m === "/agile-ai-alpha"
      ? pathname === m || pathname.startsWith("/agile-ai-alpha/companies")
      : pathname === m || pathname.startsWith(m + "/"),
  );
}

export function AlphaLayout({ title, children }: { title?: string; children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-muted/20">
      <Helmet>
        <title>{title ? `${title} · Agile AI Alpha` : "Agile AI Alpha"}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="border-b bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-lg font-semibold leading-none">Agile AI Alpha</h1>
              <p className="text-xs text-muted-foreground">AI Alpha OS · Client Search &amp; Acceptance Engine</p>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = navIsActive(item, pathname);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6">{children}</div>
    </div>
  );
}
