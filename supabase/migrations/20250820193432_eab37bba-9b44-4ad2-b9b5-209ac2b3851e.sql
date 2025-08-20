-- Add meetings table for video/call management
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  provider text check (provider in ('manual','google_meet','zoom')) not null,
  title text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  join_url text not null,
  organizer_user_id uuid references public.profiles(user_id),
  external_event_id text,
  recording_consent boolean default false,
  created_at timestamptz default now()
);

alter table public.meetings enable row level security;

create policy "view meetings (participants/admin)" on public.meetings
for select using (
  public.is_admin(auth.uid()) or exists (
    select 1 from public.project_participants pp
    where pp.project_id = meetings.project_id and pp.user_id = auth.uid()
  )
);

create policy "insert meetings (participant/admin)" on public.meetings
for insert with check (
  public.is_admin(auth.uid()) or exists (
    select 1 from public.project_participants pp
    where pp.project_id = project_id and pp.user_id = auth.uid()
  )
);

create policy "update meetings (organizer/admin)" on public.meetings
for update using (public.is_admin(auth.uid()) or organizer_user_id = auth.uid());

-- Add Fireflies admin settings
insert into public.admin_settings (setting_key, setting_value) values
('fireflies_enabled','{"enabled": true}'),
('fireflies_bot_email','{"email": ""}'),
('fireflies_default_on','{"enabled": false}'),
('fireflies_privacy_note','{"text":"Recording requires consent. Participants are notified."}')
on conflict (setting_key) do nothing;

-- Enable realtime for project_messages if not already enabled
alter table public.project_messages replica identity full;