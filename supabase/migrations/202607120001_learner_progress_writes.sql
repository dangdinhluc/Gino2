create policy lesson_progress_insert_own on public.lesson_progress
for insert to authenticated
with check (user_id = auth.uid());

create policy lesson_progress_update_own on public.lesson_progress
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy vocabulary_progress_insert_own on public.vocabulary_progress
for insert to authenticated
with check (user_id = auth.uid());

create policy vocabulary_progress_update_own on public.vocabulary_progress
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy review_attempts_insert_own on public.review_attempts
for insert to authenticated
with check (user_id = auth.uid());

create policy assessment_attempts_insert_own on public.assessment_attempts
for insert to authenticated
with check (user_id = auth.uid());

create policy learning_activity_events_insert_own on public.learning_activity_events
for insert to authenticated
with check (user_id = auth.uid());
