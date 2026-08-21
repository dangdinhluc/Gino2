begin;

create table if not exists public.document_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id text not null references public.documents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, document_id)
);

create index if not exists document_bookmarks_user_idx
  on public.document_bookmarks(user_id, created_at desc);

alter table public.document_bookmarks enable row level security;

drop policy if exists document_bookmarks_select_own on public.document_bookmarks;
create policy document_bookmarks_select_own
on public.document_bookmarks for select to authenticated
using (user_id = auth.uid());

drop policy if exists document_bookmarks_insert_own on public.document_bookmarks;
create policy document_bookmarks_insert_own
on public.document_bookmarks for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists document_bookmarks_delete_own on public.document_bookmarks;
create policy document_bookmarks_delete_own
on public.document_bookmarks for delete to authenticated
using (user_id = auth.uid());

grant select, insert, delete on public.document_bookmarks to authenticated;
revoke update on public.document_bookmarks from authenticated;

commit;
