# LOVABLE_RULES.md

- **Lovable hosts the application.** **Lovable Cloud Supabase** (project `iyqsbjawaampgcavsgcz`) is the
  managed backend. **GitHub** is the source-controlled implementation record; pushing to `main`
  auto-deploys via Lovable sync.
- **Claude Code makes repository changes first.** Schema is code-managed via `supabase/migrations/*`
  and applied through the Supabase MCP; the repo migration file is the durable record and Lovable
  re-applies it on sync (migrations are written idempotent for safety).
- **Involve Lovable only for platform-specific actions:** hosting, deployment, Lovable-managed
  environment variables/secrets, enabling Lovable AI, Lovable Cloud Supabase configuration that the
  MCP cannot perform, or sync issues.
- **Do not assume a separate Supabase dashboard.** The backend is Lovable-managed. If a schema or
  config change cannot be safely made from the repo/MCP, **stop and provide the exact Lovable
  instruction** the owner must run.
- **Never hard-code Lovable/Supabase secrets.** **Never use a service role key in frontend code**
  (service role only inside edge functions via `Deno.env`). The frontend uses only the publishable
  anon key already in `.env` / `src/integrations/supabase/client.ts`.
- **Edge functions** are deployed via the Supabase MCP and registered in `supabase/config.toml`; the
  function source also lives in `supabase/functions/*` for Lovable sync.

## Known Lovable action currently required
- **Enable Lovable AI** so `LOVABLE_API_KEY` is provisioned to edge functions. Until then,
  `aaos-generate` runs on the OpenAI GPT-5 fallback (functional, but not Lovable AI). No code change is
  needed once enabled — the function auto-detects the key.
