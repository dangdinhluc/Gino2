begin;

-- Preserve write authorization while avoiding a second permissive SELECT
-- policy caused by broad FOR ALL management policies.
drop policy if exists achievement_definitions_owner_manage on public.achievement_definitions;
create policy achievement_definitions_owner_insert on public.achievement_definitions for insert to authenticated with check (staff_role() = 'owner');
create policy achievement_definitions_owner_update on public.achievement_definitions for update to authenticated using (staff_role() = 'owner') with check (staff_role() = 'owner');
create policy achievement_definitions_owner_delete on public.achievement_definitions for delete to authenticated using (staff_role() = 'owner');

drop policy if exists admin_alerts_owner_manage on public.admin_alerts;
create policy admin_alerts_owner_insert on public.admin_alerts for insert to authenticated with check (staff_role() = 'owner');
create policy admin_alerts_owner_update on public.admin_alerts for update to authenticated using (staff_role() = 'owner') with check (staff_role() = 'owner');
create policy admin_alerts_owner_delete on public.admin_alerts for delete to authenticated using (staff_role() = 'owner');

drop policy if exists admin_roles_owner_manage on public.admin_roles;
create policy admin_roles_owner_insert on public.admin_roles for insert to authenticated with check (staff_role() = 'owner');
create policy admin_roles_owner_update on public.admin_roles for update to authenticated using (staff_role() = 'owner') with check (staff_role() = 'owner');
create policy admin_roles_owner_delete on public.admin_roles for delete to authenticated using (staff_role() = 'owner');

drop policy if exists assessment_questions_content_write on public.assessment_questions;
create policy assessment_questions_content_insert on public.assessment_questions for insert to authenticated with check (has_staff_permission('content.write'));
create policy assessment_questions_content_update on public.assessment_questions for update to authenticated using (has_staff_permission('content.write')) with check (has_staff_permission('content.write'));
create policy assessment_questions_content_delete on public.assessment_questions for delete to authenticated using (has_staff_permission('content.write'));

drop policy if exists community_groups_manage_owner on public.community_groups;
create policy community_groups_owner_insert on public.community_groups for insert to authenticated with check (created_by = (select auth.uid()));
create policy community_groups_owner_update on public.community_groups for update to authenticated using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));
create policy community_groups_owner_delete on public.community_groups for delete to authenticated using (created_by = (select auth.uid()));

drop policy if exists dashboard_hero_slots_owner_manage on public.dashboard_hero_slots;
create policy dashboard_hero_slots_owner_insert on public.dashboard_hero_slots for insert to authenticated with check (staff_role() = 'owner');
create policy dashboard_hero_slots_owner_update on public.dashboard_hero_slots for update to authenticated using (staff_role() = 'owner') with check (staff_role() = 'owner');
create policy dashboard_hero_slots_owner_delete on public.dashboard_hero_slots for delete to authenticated using (staff_role() = 'owner');

drop policy if exists enrollments_staff_manage on public.enrollments;
create policy enrollments_staff_insert on public.enrollments for insert to authenticated with check (has_staff_permission('learner.manage'));
create policy enrollments_staff_update on public.enrollments for update to authenticated using (has_staff_permission('learner.manage')) with check (has_staff_permission('learner.manage'));
create policy enrollments_staff_delete on public.enrollments for delete to authenticated using (has_staff_permission('learner.manage'));

drop policy if exists grammar_examples_content_write on public.grammar_examples;
create policy grammar_examples_content_insert on public.grammar_examples for insert to authenticated with check (has_staff_permission('content.write'));
create policy grammar_examples_content_update on public.grammar_examples for update to authenticated using (has_staff_permission('content.write')) with check (has_staff_permission('content.write'));
create policy grammar_examples_content_delete on public.grammar_examples for delete to authenticated using (has_staff_permission('content.write'));

drop policy if exists grammar_rules_content_write on public.grammar_rules;
create policy grammar_rules_content_insert on public.grammar_rules for insert to authenticated with check (has_staff_permission('content.write'));
create policy grammar_rules_content_update on public.grammar_rules for update to authenticated using (has_staff_permission('content.write')) with check (has_staff_permission('content.write'));
create policy grammar_rules_content_delete on public.grammar_rules for delete to authenticated using (has_staff_permission('content.write'));

drop policy if exists lesson_assets_content_write on public.lesson_assets;
create policy lesson_assets_content_insert on public.lesson_assets for insert to authenticated with check (has_staff_permission('content.write'));
create policy lesson_assets_content_update on public.lesson_assets for update to authenticated using (has_staff_permission('content.write')) with check (has_staff_permission('content.write'));
create policy lesson_assets_content_delete on public.lesson_assets for delete to authenticated using (has_staff_permission('content.write'));

drop policy if exists lesson_exercises_content_write on public.lesson_exercises;
create policy lesson_exercises_content_insert on public.lesson_exercises for insert to authenticated with check (has_staff_permission('content.write'));
create policy lesson_exercises_content_update on public.lesson_exercises for update to authenticated using (has_staff_permission('content.write')) with check (has_staff_permission('content.write'));
create policy lesson_exercises_content_delete on public.lesson_exercises for delete to authenticated using (has_staff_permission('content.write'));

drop policy if exists lesson_vocabulary_content_write on public.lesson_vocabulary;
create policy lesson_vocabulary_content_insert on public.lesson_vocabulary for insert to authenticated with check (has_staff_permission('content.write'));
create policy lesson_vocabulary_content_update on public.lesson_vocabulary for update to authenticated using (has_staff_permission('content.write')) with check (has_staff_permission('content.write'));
create policy lesson_vocabulary_content_delete on public.lesson_vocabulary for delete to authenticated using (has_staff_permission('content.write'));

drop policy if exists package_courses_owner_manage on public.package_courses;
create policy package_courses_owner_insert on public.package_courses for insert to authenticated with check (staff_role() = 'owner');
create policy package_courses_owner_update on public.package_courses for update to authenticated using (staff_role() = 'owner') with check (staff_role() = 'owner');
create policy package_courses_owner_delete on public.package_courses for delete to authenticated using (staff_role() = 'owner');

drop policy if exists packages_owner_manage on public.packages;
create policy packages_owner_insert on public.packages for insert to authenticated with check (staff_role() = 'owner');
create policy packages_owner_update on public.packages for update to authenticated using (staff_role() = 'owner') with check (staff_role() = 'owner');
create policy packages_owner_delete on public.packages for delete to authenticated using (staff_role() = 'owner');

drop policy if exists site_pages_owner_manage on public.site_pages;
create policy site_pages_owner_insert on public.site_pages for insert to authenticated with check (staff_role() = 'owner');
create policy site_pages_owner_update on public.site_pages for update to authenticated using (staff_role() = 'owner') with check (staff_role() = 'owner');
create policy site_pages_owner_delete on public.site_pages for delete to authenticated using (staff_role() = 'owner');

drop policy if exists vocabulary_items_content_write on public.vocabulary_items;
create policy vocabulary_items_content_insert on public.vocabulary_items for insert to authenticated with check (has_staff_permission('content.write'));
create policy vocabulary_items_content_update on public.vocabulary_items for update to authenticated using (has_staff_permission('content.write')) with check (has_staff_permission('content.write'));
create policy vocabulary_items_content_delete on public.vocabulary_items for delete to authenticated using (has_staff_permission('content.write'));

commit;
