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
});
