begin;

drop policy if exists course_assets_read_enrolled on storage.objects;
create policy course_assets_read_enrolled on storage.objects
for select to authenticated using (
  bucket_id = 'course-assets'
  and public.can_read_course((storage.foldername(name))[2])
);

commit;
