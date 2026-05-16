import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_ANON_PLACEHOLDER = 'YOUR_LOCAL_SUPABASE_ANON_KEY';
const LOCAL_HOSTNAMES = new Set(['127.0.0.1', 'localhost']);

export interface SupabaseEnvSource {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

export type SupabaseConfig =
  | { isConfigured: false; isLocal: false; url: null; anonKey: null }
  | { isConfigured: true; isLocal: boolean; url: string; anonKey: string };

function isLocalHostname(hostname: string): boolean {
  return LOCAL_HOSTNAMES.has(hostname);
}

function isLocalUrl(url: string): boolean {
  try {
    return isLocalHostname(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * If `.env` points Supabase at a local hostname (127.0.0.1 / localhost) but the
 * app is actually being served over a Tailscale/LAN host, rewrite the Supabase
 * URL to use the same hostname the browser used. This keeps the same `.env`
 * working for local Mac dev, Tailscale-from-iPhone, and LAN access without
 * forcing the developer to edit env per device.
 *
 * - Cloud Supabase URLs (e.g. *.supabase.co) are never rewritten.
 * - SSR / non-browser callers fall through to the env URL as-is.
 */
export function rebaseSupabaseUrlForBrowser(rawUrl: string, browserHostname: string | null): string {
  if (!browserHostname) {
    return rawUrl;
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  if (!isLocalHostname(parsed.hostname)) {
    return rawUrl;
  }

  if (isLocalHostname(browserHostname)) {
    return rawUrl;
  }

  parsed.hostname = browserHostname;
  return parsed.toString().replace(/\/$/, '');
}

export function resolveSupabaseConfig(
  env: SupabaseEnvSource | undefined = {},
  browserHostname: string | null = null,
): SupabaseConfig {
  const rawUrl = env.VITE_SUPABASE_URL?.trim() ?? '';
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

  if (!rawUrl || !anonKey || anonKey === SUPABASE_ANON_PLACEHOLDER) {
    return { isConfigured: false, isLocal: false, url: null, anonKey: null };
  }

  const url = rebaseSupabaseUrlForBrowser(rawUrl, browserHostname);
  return { isConfigured: true, isLocal: isLocalUrl(url), url, anonKey };
}

const browserHostname = typeof window !== 'undefined' ? window.location.hostname : null;

export const supabaseConfig = resolveSupabaseConfig(import.meta.env as SupabaseEnvSource | undefined, browserHostname);

export const supabase: SupabaseClient | null = supabaseConfig.isConfigured
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;
