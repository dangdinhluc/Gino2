begin;

-- These legacy RPCs accepted a client-provided correctness boolean. All learner
-- flows now use submit_review_answer and submit_vocabulary_rating instead.
revoke execute on function public.record_review_attempt(text, boolean) from authenticated;
revoke execute on function public.record_vocabulary_review(text, boolean) from authenticated;

commit;
