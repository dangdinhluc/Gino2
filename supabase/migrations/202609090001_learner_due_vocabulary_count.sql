create or replace function public.get_due_vocabulary_count(target_course_id text default null)
returns bigint
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select count(distinct vp.vocabulary_item_id)::bigint
  from public.vocabulary_progress vp
  join public.lesson_vocabulary lv
    on lv.vocabulary_item_id = vp.vocabulary_item_id
  join public.lessons l
    on l.id = lv.lesson_id
   and l.status = 'published'
  join public.courses c
    on c.id = l.course_id
   and c.status = 'published'
  where auth.uid() is not null
    and vp.user_id = auth.uid()
    and vp.status <> 'mastered'
    and vp.due_at is not null
    and vp.due_at <= now()
    and (target_course_id is null or l.course_id = target_course_id)
    and public.can_read_course(l.course_id);
$$;

revoke all on function public.get_due_vocabulary_count(text) from public, anon;
grant execute on function public.get_due_vocabulary_count(text) to authenticated;

comment on function public.get_due_vocabulary_count(text) is
  'Returns the authenticated learner due SRS vocabulary count, optionally scoped to one readable course.';
