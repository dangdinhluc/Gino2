import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const source = readFileSync(fileURLToPath(new URL('../../../../public/push-url.js', import.meta.url)), 'utf8');
const sandbox: { globalThis?: Record<string, unknown>; URL: typeof URL; TokuteiPushUrl?: { resolvePushDestination: (value: unknown, scope: string) => string } } = { URL };
sandbox.globalThis = sandbox;
vm.runInNewContext(source, sandbox);
const resolvePushDestination = sandbox.TokuteiPushUrl?.resolvePushDestination;
if (!resolvePushDestination) throw new Error('Push URL helper did not load.');

const scope = 'https://dangdinhluc.github.io/Gino2/';
assert.equal(resolvePushDestination('/app/dashboard', scope), `${scope}app/dashboard`);
assert.equal(resolvePushDestination('/app/review/flashcards?mode=due', scope), `${scope}app/review/flashcards?mode=due`);
assert.equal(resolvePushDestination('//evil.com', scope), scope);
assert.equal(resolvePushDestination('https://evil.com', scope), scope);
assert.equal(resolvePushDestination(null, scope), scope);

// eslint-disable-next-line no-console
console.log('✓ pushUrl.test passed');
