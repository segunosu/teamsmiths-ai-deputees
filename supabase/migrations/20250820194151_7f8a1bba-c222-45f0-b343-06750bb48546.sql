-- Enable RLS and add admin-only write policies for admin_settings
alter table public.admin_settings enable row level security;

-- Admin SELECT policy (kept separate; public SELECT may also exist)
drop policy if exists admin_settings_select on public.admin_settings;
create policy admin_settings_select
on public.admin_settings
for select
using (public.is_admin(auth.uid()));

-- Admin INSERT policy
drop policy if exists admin_settings_insert on public.admin_settings;
create policy admin_settings_insert
on public.admin_settings
for insert
with check (public.is_admin(auth.uid()));

-- Admin UPDATE policy
drop policy if exists admin_settings_update on public.admin_settings;
create policy admin_settings_update
on public.admin_settings
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- RPC to atomically upsert admin setting as admin
create or replace function public.update_admin_setting(
  p_key text,
  p_value jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not_authorized';
  end if;

  insert into public.admin_settings (setting_key, setting_value, updated_at, updated_by)
  values (p_key, p_value, now(), auth.uid())
  on conflict (setting_key)
  do update set setting_value = excluded.setting_value,
               updated_at = now(),
               updated_by = auth.uid();
end;
$$;