import { strict as assert } from 'node:assert';
import { rebaseSupabaseUrlForBrowser, resolveSupabaseConfig } from './supabaseClient';

assert.deepEqual(
  resolveSupabaseConfig({}),
  { isConfigured: false, isLocal: false, url: null, anonKey: null },
  'missing Supabase env should be treated as unconfigured',
);

assert.deepEqual(
  resolveSupabaseConfig({ VITE_SUPABASE_URL: 'http://127.0.0.1:54321', VITE_SUPABASE_ANON_KEY: 'YOUR_LOCAL_SUPABASE_ANON_KEY' }),
  { isConfigured: false, isLocal: false, url: null, anonKey: null },
  'placeholder anon key should be treated as unconfigured',
);

const localConfig = resolveSupabaseConfig({ VITE_SUPABASE_URL: 'http://127.0.0.1:54321', VITE_SUPABASE_ANON_KEY: 'local-anon-key' });
assert.equal(localConfig.isConfigured, true, 'local Supabase env should be configured with a real anon key');
assert.equal(localConfig.isLocal, true, '127.0.0.1 Supabase URL should be marked local');

const hostedConfig = resolveSupabaseConfig({ VITE_SUPABASE_URL: 'https://project.supabase.co', VITE_SUPABASE_ANON_KEY: 'hosted-anon-key' });
assert.equal(hostedConfig.isConfigured, true, 'hosted Supabase env should be configured with a real anon key');
assert.equal(hostedConfig.isLocal, false, 'hosted Supabase URL should not be marked local');

// rebase logic
assert.equal(
  rebaseSupabaseUrlForBrowser('http://127.0.0.1:54331', '100.112.141.10'),
  'http://100.112.141.10:54331',
  'local env URL should be rebased to the browser host (Tailscale)',
);

assert.equal(
  rebaseSupabaseUrlForBrowser('http://localhost:54331', '192.168.1.20'),
  'http://192.168.1.20:54331',
  'localhost env URL should be rebased to LAN browser host',
);

assert.equal(
  rebaseSupabaseUrlForBrowser('http://127.0.0.1:54331', 'localhost'),
  'http://127.0.0.1:54331',
  'browser on localhost should keep the env URL as-is',
);

assert.equal(
  rebaseSupabaseUrlForBrowser('https://project.supabase.co', '100.112.141.10'),
  'https://project.supabase.co',
  'cloud Supabase URL must never be rebased',
);

assert.equal(
  rebaseSupabaseUrlForBrowser('http://127.0.0.1:54331', null),
  'http://127.0.0.1:54331',
  'no browser hostname (SSR) should fall through to env URL',
);

assert.equal(
  rebaseSupabaseUrlForBrowser('not a url', '100.112.141.10'),
  'not a url',
  'invalid URL should be returned unchanged',
);

const rebasedConfig = resolveSupabaseConfig(
  { VITE_SUPABASE_URL: 'http://127.0.0.1:54331', VITE_SUPABASE_ANON_KEY: 'local-anon-key' },
  '100.112.141.10',
);
assert.equal(rebasedConfig.isConfigured, true);
assert.equal(rebasedConfig.url, 'http://100.112.141.10:54331', 'resolveSupabaseConfig should produce the rebased URL');
assert.equal(rebasedConfig.isLocal, false, 'rebased URL on a real host should not be marked local');
