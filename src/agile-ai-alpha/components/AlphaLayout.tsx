import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LayoutDashboard, Building2, LineChart, Settings as SettingsIcon, Sparkles, Gauge, Users, Library } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/agile-ai-alpha/command-centre", label: "Command Centre", icon: Gauge, end: false },
  { to: "/agile-ai-alpha", label: "Prospects", icon: LayoutDashboard, end: true },
  { to: "/agile-ai-alpha/companies", label: "Companies", icon: Building2, end: false },
  { to: "/agile-ai-alpha/clients", label: "Clients", icon: Users, end: false },
  { to: "/agile-ai-alpha/portfolio", label: "Portfolio", icon: Library, end: false },
  { to: "/agile-ai-alpha/value-ledger", label: "Value Ledger", icon: LineChart, end: false },
  { to: "/agile-ai-alpha/settings", label: "Settings", icon: SettingsIcon, end: false },
];

export function AlphaLayout({ title, children }: { title?: string; children: React.ReactNode }) {
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
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6">{children}</div>
    </div>
  );
}
