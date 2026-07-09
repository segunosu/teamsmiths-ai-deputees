import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Pill-style switcher used to group sibling top-level pages
 * (Pipeline: Prospects/Companies · Playbooks: Artefact studio/Portfolio patterns)
 * without touching the underlying routes or Stage 0 logic.
 */
export function SectionSwitch({ items }: { items: { to: string; label: string; end?: boolean }[] }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end={i.end}
          className={({ isActive }) =>
            cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              isActive
                ? "border-primary bg-primary/10 font-semibold text-primary"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )
          }
        >
          {i.label}
        </NavLink>
      ))}
    </div>
  );
}

export const PIPELINE_TABS = [
  { to: "/agile-ai-alpha", label: "Prospects", end: true },
  { to: "/agile-ai-alpha/companies", label: "Companies" },
];

export const PLAYBOOK_TABS = [
  { to: "/agile-ai-alpha/governance", label: "Artefact studio" },
  { to: "/agile-ai-alpha/portfolio", label: "Portfolio patterns" },
];
