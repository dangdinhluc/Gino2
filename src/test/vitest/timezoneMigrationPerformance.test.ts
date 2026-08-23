import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20260823051556_optimize_learner_stats_timezone.sql');
const migration = readFileSync(migrationPath, 'utf8');
const statsFunction = migration.match(/create or replace function public\.get_learner_stats[\s\S]*?\$\$;/i)?.[0] ?? '';
const normalizedStatsFunction = statsFunction.toLowerCase();

describe('learner stats timezone migration contract', () => {
  it('resolves timezone context once and converts event timestamps directly', () => {
    expect(normalizedStatsFunction).toContain('with identity as materialized');
    expect(normalizedStatsFunction).toContain('at time zone today.timezone');
    expect(normalizedStatsFunction).not.toContain('learner_local_date(auth.uid(), occurred_at)');
    expect(normalizedStatsFunction).not.toContain('pg_timezone_names');
  });

  it('keeps pg_timezone_names validation at the settings write boundary', () => {
    expect(migration).toContain('validate_learner_settings_timezone');
    expect(migration).toContain('pg_catalog.pg_timezone_names');
  });
});
