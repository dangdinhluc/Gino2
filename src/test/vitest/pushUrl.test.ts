import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

interface PushUrlHelpers {
  appRelativeRoute(value: unknown): string | null;
  resolvePushDestination(value: unknown, scope: string): string;
}

function loadPushUrlHelpers(): PushUrlHelpers {
  const source = readFileSync(path.resolve(process.cwd(), 'public/push-url.js'), 'utf8');
  const context = { URL } as { URL: typeof URL; TokuteiPushUrl?: PushUrlHelpers };
  vm.runInNewContext(source, context);
  if (!context.TokuteiPushUrl) throw new Error('Push URL helpers did not load.');
  return context.TokuteiPushUrl;
}

describe('push URL contract', () => {
  it('keeps app-relative routes and rejects external URLs', () => {
    const helpers = loadPushUrlHelpers();
    expect(helpers.appRelativeRoute('/app/dashboard')).toBe('/app/dashboard');
    expect(helpers.appRelativeRoute('https://evil.example/steal')).toBeNull();
    expect(helpers.appRelativeRoute('//evil.example/steal')).toBeNull();
  });

  it('resolves a notification under the GitHub Pages base path', () => {
    const helpers = loadPushUrlHelpers();
    expect(helpers.resolvePushDestination('/app/review/flashcards?mode=due', 'https://dangdinhluc.github.io/Gino2/'))
      .toBe('https://dangdinhluc.github.io/Gino2/app/review/flashcards?mode=due');
  });
});
