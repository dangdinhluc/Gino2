import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file: string) => readFileSync(path.resolve(process.cwd(), file), 'utf8').toLowerCase();

describe('security hardening contracts', () => {
  it('removes learner answer-key access and requires server attempt', () => {
    const migration = read('supabase/migrations/202608260001_harden_assessment_storage_and_ai_boundaries.sql');
    expect(migration).toContain('create policy assessment_questions_staff_read');
    expect(migration).toContain('start_assessment_attempt_v2');
    expect(migration).toContain('assessment_attempt_expired');
    expect(migration).toContain('target_attempt_id text');
  });

  it('binds course assets to content rows', () => {
    const migration = read('supabase/migrations/202608260001_harden_assessment_storage_and_ai_boundaries.sql');
    expect(migration).toContain('can_write_course_asset');
    expect(migration).toContain("(storage.foldername(target_name))[1] = 'content'");
    expect(migration).toContain('d.course_id = (storage.foldername(target_name))[2]');
  });

  it('does not send browser-controlled AI context and refunds failed speaking quota', () => {
    const repository = read('src/features/ai/repositories/aiRepository.ts');
    const chatFunction = read('supabase/functions/ai-chat/index.ts');
    const speakingFunction = read('supabase/functions/ai-speaking/index.ts');
    expect(repository).not.toContain('coursecontext: input.coursecontext');
    expect(chatFunction).not.toContain("optionalstring(body, 'coursecontext'");
    expect(chatFunction).toContain(".eq('status', 'published')");
    expect(speakingFunction).toContain("target_feature: 'speaking'");
    expect(speakingFunction).toContain("rpc('refund_ai_quota'");
  });

  it('never calls non-existent jsonb_object_length in answer validation', () => {
    const hotfix = read('supabase/migrations/202609120001_fix_validate_assessment_answers_jsonb_object_length.sql');
    expect(hotfix).toContain('jsonb_object_keys');
    // the invalid call must be gone from the executable body, not just mentioned in a comment
    expect(hotfix).not.toContain('or jsonb_object_length(');

    // every migration must stay free of the invalid call
    const hardened = read('supabase/migrations/202608260001_harden_assessment_storage_and_ai_boundaries.sql');
    expect(hardened).not.toContain('or jsonb_object_length(');
  });

  it('shuffles assessment options so the stored answer position never leaks', () => {
    const migration = read('supabase/migrations/202609120002_shuffle_assessment_options_in_paper.sql');
    expect(migration).toContain('create or replace function public.get_assessment_paper_v2');
    expect(migration).toContain('md5(q.id');
    expect(migration).toContain('order by shuffled.sort_key');
    // learner identity must be part of the sort key so two learners see different orders
    expect(migration).toContain('learner_key');
  });
});
