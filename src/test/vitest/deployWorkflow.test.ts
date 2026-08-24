import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync(
  path.resolve(process.cwd(), '.github/workflows/deploy.yml'),
  'utf8',
);

describe('GitHub Pages deploy workflow', () => {
  it('deploys only main and does not build a UX preview branch', () => {
    expect(workflow).toContain('branches:\n      - main');
    expect(workflow).not.toContain('ux/mock-navigation-refactor');
    expect(workflow).not.toContain('preview-src');
    expect(workflow).not.toContain('VITE_BASE_PATH: /Gino2/preview/');
  });
});
