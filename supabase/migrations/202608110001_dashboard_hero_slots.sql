-- Owner-controlled dashboard mascot schedule. Learners can only read active slots.
create table if not exists public.dashboard_hero_slots (
  id text primary key,
  label text not null check (length(trim(label)) between 1 and 120),
  start_time time not null,
  end_time time not null,
  asset_key text not null check (length(trim(asset_key)) between 1 and 120),
  alt_text text not null check (length(trim(alt_text)) between 1 and 240),
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists dashboard_hero_slots_set_updated_at on public.dashboard_hero_slots;
create trigger dashboard_hero_slots_set_updated_at
before update on public.dashboard_hero_slots
for each row execute function public.set_updated_at();

alter table public.dashboard_hero_slots enable row level security;

drop policy if exists dashboard_hero_slots_learner_read on public.dashboard_hero_slots;
create policy dashboard_hero_slots_learner_read
on public.dashboard_hero_slots for select to authenticated
using (is_active or public.staff_role() = 'owner');

drop policy if exists dashboard_hero_slots_owner_manage on public.dashboard_hero_slots;
create policy dashboard_hero_slots_owner_manage
on public.dashboard_hero_slots for all to authenticated
using (public.staff_role() = 'owner')
with check (public.staff_role() = 'owner');

grant select on public.dashboard_hero_slots to authenticated;
grant insert, update, delete on public.dashboard_hero_slots to authenticated;

insert into public.dashboard_hero_slots (id, label, start_time, end_time, asset_key, alt_text, sort_order)
values
  ('dashboard-hero-dawn', 'Bình minh', '05:00', '11:00', 'meow', 'Mèo trợ lý chào buổi sáng', 10),
  ('dashboard-hero-day', 'Ban ngày', '11:00', '17:00', 'ai_tutor_tanuki', 'Tanuki trợ giảng AI đồng hành', 20),
  ('dashboard-hero-evening', 'Buổi tối', '17:00', '22:00', 'brand', 'Mascot Tokutei Gino buổi tối', 30),
  ('dashboard-hero-night', 'Ban đêm', '22:00', '05:00', 'sleeping_meow', 'Mèo trợ lý đang nghỉ', 40)
on conflict (id) do nothing;
