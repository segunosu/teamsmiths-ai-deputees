# HOOKS_RECOMMENDATION.md

Claude Code hooks run shell commands the harness executes on tool events (configured in
`.claude/settings.json`). They are **not implemented yet** — proposed here for owner approval first, so
hook setup never blocks the build and never silently breaks the Lovable sync.

## Recommended (safe, high value)
1. **Block service-role key in frontend** — `PreToolUse` on Write/Edit: reject if the diff adds
   `SUPABASE_SERVICE_ROLE_KEY` or a service-role JWT under `src/`. Prevents the worst security mistake.
2. **Warn before schema/env edits** — `PreToolUse` on Edit/Write to `supabase/migrations/*`,
   `supabase/config.toml`, or any `.env*`: surface a confirmation reminder ("additive only; regenerate
   types; no secrets").
3. **Remind to build before "done"** — `Stop` hook: print a checklist (run `npm run build` +
   `npx tsc --noEmit`; confirm Stage 0 still works) per QUALITY_GATES.md.

## Consider later
4. Block destructive SQL (`drop table`/`rename`) appearing in a migration file without an approval
   token in the commit message.
5. Warn before deleting core files (`src/agile-ai-alpha/**`, `src/integrations/supabase/**`).

## Not recommended
- Auto-running migrations or pushes from hooks (too easy to fire against production).
- Anything that mutates files automatically on save.

## How to enable
Add to `.claude/settings.json` under `hooks` after the owner approves. Keep commands read-only/advisory
where possible (echo a warning) rather than hard-failing, to avoid blocking legitimate work.
