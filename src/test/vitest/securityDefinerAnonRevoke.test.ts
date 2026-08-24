import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  path.resolve(process.cwd(), 'supabase/migrations/20260824090000_revoke_anon_security_definer_execute.sql'),
  'utf8',
).toLowerCase();

describe('anon SECURITY DEFINER revoke migration', () => {
  it('revokes public/anon and restores authenticated plus service_role only', () => {
    expect(migration).toContain('p.prosecdef');
    expect(migration).toContain('revoke all on function');
    expect(migration).toContain('from public, anon');
    expect(migration).toContain('grant execute on function');
    expect(migration).toContain('authenticated, service_role');
    expect(migration).not.toContain('grant execute on function %s to anon');
    expect(migration).not.toContain('revoke all on function %s from authenticated');
  });
});
