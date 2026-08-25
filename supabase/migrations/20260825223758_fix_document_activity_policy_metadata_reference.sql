begin;

-- Qualify the activity-event metadata explicitly. Without the outer-table
-- qualification PostgreSQL can resolve `metadata` against documents inside
-- the EXISTS subquery and reject otherwise-valid activity inserts.
drop policy if exists learning_activity_events_insert_document_opened on public.learning_activity_events;
create policy learning_activity_events_insert_document_opened
on public.learning_activity_events
for insert
to authenticated
with check (
  user_id = auth.uid()
  and event_type = 'document_opened'
  and course_id is not null
  and jsonb_typeof(learning_activity_events.metadata -> 'documentId') = 'string'
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
