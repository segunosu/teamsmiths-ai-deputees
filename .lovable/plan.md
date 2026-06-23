## Goal
Enable the Lovable AI Gateway for this project and provision `LOVABLE_API_KEY` so the existing `aaos-generate` edge function can use it as the primary provider (OpenAI fallback untouched).

## Current state
- Edge function `aaos-generate` already reads `LOVABLE_API_KEY` via `Deno.env.get`.
- Project secrets currently contain: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `STRIPE_SECRET_KEY`.
- `LOVABLE_API_KEY` is **not** present — this is the only gap.

## Steps (build mode)
1. Call `ai_gateway--enable` to enable Lovable AI / Cloud AI Gateway for the project.
2. Call `ai_gateway--create` to provision `LOVABLE_API_KEY` as an edge-function secret (auto-injected into all Supabase edge functions as `Deno.env.get("LOVABLE_API_KEY")`, including `aaos-generate`).
3. Verify by re-running `secrets--fetch_secrets` and confirming `LOVABLE_API_KEY` appears in the list.

## Models
`google/gemini-2.5-pro` and `google/gemini-2.5-flash` are both supported by the Lovable AI Gateway (per the model catalog) and reachable at `https://ai.gateway.lovable.dev/v1/chat/completions` using the standard `Lovable-API-Key` header. No additional provisioning needed — once the gateway is enabled and the key exists, both model IDs are callable.

## Out of scope (explicitly not touched)
- `aaos-generate` source code — no edits, no redeploy.
- OpenAI fallback path and `OPENAI_API_KEY` — untouched.
- Any other edge functions, `aaos_*` tables, RLS policies, routes, or frontend code.

## Acceptance check
After step 3, `LOVABLE_API_KEY` should be listed alongside the existing 6 secrets, confirming edge functions can read it.
