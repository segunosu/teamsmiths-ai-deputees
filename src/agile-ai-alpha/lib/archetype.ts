// AI Alpha OS — governance archetype classifier (frontend mirror of the
// edge-function rule). Transparent keyword rule, not AI: classify a vendor from
// what they do, then surface the "most likely useful base" (universal core +
// archetype pack). Keep in sync with archetypeTags() in supabase/functions/aaos-generate.

export interface Archetype { key: string; label: string; re: RegExp; }

export const ARCHETYPES: Archetype[] = [
  { key: "arch:agents", label: "Autonomous agents / outbound", re: /agent|autonomous|outbound|\bsdr\b|sales automation/ },
  { key: "arch:vision", label: "Computer vision / surveillance", re: /vision|cctv|camera|video analytic|surveillance|biometric/ },
  { key: "arch:genmedia", label: "Generative media / avatars / voice", re: /avatar|twin|generative video|voice clone|deepfake|synthetic media|video creation|video editing/ },
  { key: "arch:hiring", label: "Automated hiring / high-stakes decisions", re: /hiring|recruit|candidate|screening|talent|credit scoring/ },
  { key: "arch:gtm", label: "GTM / customer-data SaaS", re: /value selling|value-selling|business case|\bcrm\b|pipeline|\bgtm\b|revenue team/ },
  { key: "arch:infra", label: "Data / infrastructure tooling", re: /block explorer|infrastructure|provenance|lineage|marketplace|training data|data assurance/ },
];

export const ARCHETYPE_LABEL: Record<string, string> = Object.fromEntries(ARCHETYPES.map((a) => [a.key, a.label]));

export function archetypeTags(text: string): string[] {
  const t = (text || "").toLowerCase();
  return ARCHETYPES.filter((a) => a.re.test(t)).map((a) => a.key);
}
