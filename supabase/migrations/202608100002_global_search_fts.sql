begin;

create index if not exists courses_search_vector_idx
  on public.courses using gin (
    to_tsvector('simple'::regconfig, coalesce(title, '') || ' ' || coalesce(description, ''))
  );
create index if not exists lessons_search_vector_idx
  on public.lessons using gin (
    to_tsvector('simple'::regconfig, coalesce(title, '') || ' ' || coalesce(description, ''))
  );
create index if not exists vocabulary_items_search_vector_idx
  on public.vocabulary_items using gin (
    to_tsvector('simple'::regconfig, coalesce(term, '') || ' ' || coalesce(translation, '') || ' ' || coalesce(example_sentence, ''))
  );
create index if not exists grammar_topics_search_vector_idx
  on public.grammar_topics using gin (
    to_tsvector('simple'::regconfig, coalesce(title, '') || ' ' || coalesce(summary, ''))
  );
create index if not exists documents_search_vector_idx
  on public.documents using gin (
    to_tsvector('simple'::regconfig, coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(content_markdown, ''))
  );

create or replace function public.claim_notification_email_deliveries(target_batch_size integer default 25)
returns table (
  delivery_id uuid,
  notification_id uuid,
  user_id uuid,
  title text,
  body text,
  action_url text,
  status text,
  attempts integer
)
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;
  if target_batch_size is null or target_batch_size not between 1 and 50 then
    raise exception 'INVALID_BATCH_SIZE' using errcode = '22023';
  end if;

  return query
  with candidates as (
    select nd.id, nd.notification_id
    from public.notification_deliveries as nd
    where nd.channel = 'email'
      and (
        nd.status = 'pending'
        or (
          nd.status = 'failed'
          and nd.attempts < 5
          and (
            nd.last_attempt_at is null
            or nd.last_attempt_at <= now() - (interval '5 minutes' * power(2, least(nd.attempts, 4)))
          )
        )
        or (
          nd.status = 'processing'
          and nd.locked_at is not null
          and nd.locked_at <= now() - interval '15 minutes'
        )
      )
    order by nd.created_at
    limit target_batch_size
    for update skip locked
  ), marked as (
    update public.notification_deliveries as nd
    set
      status = case when coalesce(ls.email_notifications, false) then 'processing' else 'skipped' end,
      attempts = case when coalesce(ls.email_notifications, false) then least(nd.attempts + 1, 5) else nd.attempts end,
      locked_at = case when coalesce(ls.email_notifications, false) then now() else null end,
      last_attempt_at = case when coalesce(ls.email_notifications, false) then now() else nd.last_attempt_at end,
      last_error = case when coalesce(ls.email_notifications, false) then null else 'EMAIL_NOT_ENABLED' end
    from candidates as c
    join public.notifications as n on n.id = c.notification_id
    left join public.learner_settings as ls on ls.user_id = n.user_id
    where nd.id = c.id
    returning nd.id, nd.notification_id, nd.status, nd.attempts
  )
  select
    m.id,
    m.notification_id,
    n.user_id,
    n.title,
    n.body,
    n.action_url,
    m.status,
    m.attempts
  from marked as m
  join public.notifications as n on n.id = m.notification_id;
end;
$$;

create or replace function public.get_global_search_results(target_query text, target_limit integer default 30)
returns table (result_type text, id text, title text, subtitle text, route text)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  with needle as (
    select
      nullif(trim(target_query), '') as value,
      websearch_to_tsquery('simple'::regconfig, coalesce(nullif(trim(target_query), ''), '')) as search_query
  )
  select * from (
    select 'course'::text, c.id, c.title, c.description, '/app/courses/' || c.id || '/learn'
    from public.courses as c, needle
    where c.status = 'published' and public.can_read_course(c.id) and needle.value is not null
      and (
        to_tsvector('simple'::regconfig, coalesce(c.title, '') || ' ' || coalesce(c.description, '')) @@ needle.search_query
        or c.title ilike '%' || needle.value || '%' or c.description ilike '%' || needle.value || '%'
      )
    union all
    select 'lesson', l.id, l.title, l.description, '/app/courses/' || l.course_id || '/learn'
    from public.lessons as l, needle
    where l.status = 'published' and public.can_read_course(l.course_id) and needle.value is not null
      and (
        to_tsvector('simple'::regconfig, coalesce(l.title, '') || ' ' || coalesce(l.description, '')) @@ needle.search_query
        or l.title ilike '%' || needle.value || '%' or l.description ilike '%' || needle.value || '%'
      )
    union all
    select 'vocabulary', v.id, v.term, v.translation, '/app/vocabulary/' || v.id
    from public.vocabulary_items as v, needle
    where needle.value is not null
      and (
        to_tsvector('simple'::regconfig, coalesce(v.term, '') || ' ' || coalesce(v.translation, '') || ' ' || coalesce(v.example_sentence, '')) @@ needle.search_query
        or v.term ilike '%' || needle.value || '%' or v.translation ilike '%' || needle.value || '%'
      )
      and exists (
        select 1
        from public.lesson_vocabulary as lv
        join public.lessons as l on l.id = lv.lesson_id
        where lv.vocabulary_item_id = v.id and l.status = 'published' and public.can_read_course(l.course_id)
      )
    union all
    select 'grammar', gt.id, gt.title, gt.summary, '/app/grammar/' || gt.id
    from public.grammar_topics as gt, needle
    where gt.status = 'published' and needle.value is not null
      and (
        to_tsvector('simple'::regconfig, coalesce(gt.title, '') || ' ' || coalesce(gt.summary, '')) @@ needle.search_query
        or gt.title ilike '%' || needle.value || '%' or gt.summary ilike '%' || needle.value || '%'
      )
      and exists (
        select 1 from public.grammar_topic_courses as gc
        where gc.topic_id = gt.id and public.can_read_course(gc.course_id)
      )
    union all
    select 'document', d.id, d.title, d.summary, '/app/courses/' || d.course_id || '/learn'
    from public.documents as d, needle
    where d.status = 'published' and public.can_read_course(d.course_id) and needle.value is not null
      and (
        to_tsvector('simple'::regconfig, coalesce(d.title, '') || ' ' || coalesce(d.summary, '') || ' ' || coalesce(d.content_markdown, '')) @@ needle.search_query
        or d.title ilike '%' || needle.value || '%' or d.summary ilike '%' || needle.value || '%' or d.content_markdown ilike '%' || needle.value || '%'
      )
  ) as results
  limit greatest(1, least(target_limit, 50));
$$;

commit;
