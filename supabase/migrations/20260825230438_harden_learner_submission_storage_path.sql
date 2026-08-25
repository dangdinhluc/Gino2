begin;

-- A learner may upload only to the exact speaking-submission path issued by
-- start_speaking_submission(). This prevents arbitrary files from being
-- stored under an otherwise-valid user prefix.
drop policy if exists learner_submissions_insert_own on storage.objects;
create policy learner_submissions_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'learner-submissions'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.speaking_submissions as ss
    where ss.user_id = (select auth.uid())
      and ss.storage_path = storage.objects.name
  )
);

drop policy if exists learner_submissions_select_own on storage.objects;
create policy learner_submissions_select_own
on storage.objects
for select
to authenticated
using (
  bucket_id = 'learner-submissions'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists learner_submissions_delete_own on storage.objects;
create policy learner_submissions_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'learner-submissions'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

commit;
