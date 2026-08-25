begin;

grant insert on table public.learning_activity_events to authenticated;

drop policy if exists learning_activity_events_insert_document_opened on public.learning_activity_events;
create policy learning_activity_events_insert_document_opened
on public.learning_activity_events
for insert
to authenticated
with check (
  user_id = auth.uid()
  and event_type = 'document_opened'
  and course_id is not null
  and jsonb_typeof(metadata -> 'documentId') = 'string'
  and exists (
    select 1
    from public.enrollments as e
    where e.user_id = auth.uid()
      and e.course_id = learning_activity_events.course_id
      and e.status in ('active', 'completed')
  )
  and exists (
    select 1
    from public.documents as d
    where d.id = learning_activity_events.metadata ->> 'documentId'
      and d.course_id = learning_activity_events.course_id
      and d.status = 'published'
  )
);

commit;
