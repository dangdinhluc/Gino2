begin;

revoke all on function public.get_assessment_paper_v2(text) from anon;
revoke all on function public.submit_assessment_v2(text, jsonb) from anon;
revoke all on function public.get_latest_assessment_result_v2(text) from anon;
revoke all on function public.get_assessment_result_detail_v2(text) from anon;

-- Keep explicit learner/server access only.
grant execute on function public.get_assessment_paper_v2(text) to authenticated, service_role;
grant execute on function public.submit_assessment_v2(text, jsonb) to authenticated, service_role;
grant execute on function public.get_latest_assessment_result_v2(text) to authenticated, service_role;
grant execute on function public.get_assessment_result_detail_v2(text) to authenticated, service_role;

commit;
