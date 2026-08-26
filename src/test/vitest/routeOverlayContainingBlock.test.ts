import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/shared/styles/lightweight-transitions.css'), 'utf8');

describe('route transition fixed-overlay safety', () => {
  it('does not leave transform or transform will-change on the route wrapper', () => {
    const routeRule = css.match(/\.gino-route-enter\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(routeRule).not.toContain('transform');
    expect(routeRule).not.toContain('will-change');
    expect(routeRule).not.toContain('both');
  });

  it('keeps the route animation opacity-only', () => {
    const keyframes = css.match(/@keyframes gino-route-enter\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

    expect(keyframes).toContain('opacity');
    expect(keyframes).not.toContain('transform');
  });
});
