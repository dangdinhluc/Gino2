import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const seedSource = readFileSync(
  path.resolve(process.cwd(), 'scripts/seed-gaishoku.ts'),
  'utf8',
);

describe('gaishoku official mock exam seed', () => {
  it('writes the 70-minute / 250-point / 163-pass V2 config', () => {
    expect(seedSource).toContain('durationMinutes: 70');
    expect(seedSource).toContain('totalPoints: 250');
    expect(seedSource).toContain('passingPoints: 163');
    expect(seedSource).toContain("scoringMode: 'weighted_questions'");
    expect(seedSource).toContain('feature_config:');
  });
});
