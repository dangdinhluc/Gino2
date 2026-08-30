import { supabase } from '@/src/features/supabase/lib/supabaseClient';

// VAPID public key — KHÔNG phải bí mật, được gửi tới browser để đăng ký push.
// Private key nằm ở Supabase Edge Function secret VAPID_PRIVATE_KEY.
export const VAPID_PUBLIC_KEY = 'BLRy2PubtW8uDaDcloPdFPX89NKGxUKrl4kh3wGtDM7ZofdHdUNNyg4cgd27WcjZo3dSdfoANjG7jALqxWetXZg';

export type PushSupport = 'unsupported' | 'denied' | 'granted' | 'enabled';

function base64UrlToUint8Array(value: string): Uint8Array {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) output[index] = raw.charCodeAt(index);
  return output;
}

async function currentSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function pushSupport(): Promise<PushSupport> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  const existing = await currentSubscription();
  if (existing) return 'enabled';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.permission === 'granted' ? 'granted' : 'unsupported';
}

export async function registerPush(): Promise<PushSupport> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';

  const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'unsupported';

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToUint8Array(VAPID_PUBLIC_KEY),
  });

  const json = subscription.toJSON();
  const endpoint = json.endpoint ?? '';
  const p256dh = json.keys?.p256dh ?? '';
  const auth = json.keys?.auth ?? '';
  if (!endpoint || !p256dh || !auth) throw new Error('Push subscription không hợp lệ.');

  if (!supabase) {
    await subscription.unsubscribe().catch(() => undefined);
    throw new Error('Supabase chưa được cấu hình.');
  }
  const { error } = await supabase.rpc('register_push_subscription', {
    target_endpoint: endpoint,
    target_p256dh: p256dh,
    target_auth: auth,
    target_user_agent: navigator.userAgent.slice(0, 512),
  });
  if (error) {
    await subscription.unsubscribe().catch(() => undefined);
    throw new Error(error.message);
  }
  return 'enabled';
}

export async function unregisterPush(): Promise<void> {
  const subscription = await currentSubscription();
  const endpoint = subscription?.toJSON().endpoint ?? '';
  if (subscription) {
    await subscription.unsubscribe().catch(() => undefined);
  }
  if (!supabase) return;
  if (endpoint) {
    await supabase.rpc('unregister_push_subscription', { target_endpoint: endpoint });
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  const scope = import.meta.env.BASE_URL || '/';
  try {
    return await navigator.serviceWorker.register(`${scope}sw.js`, { scope });
  } catch {
    return null;
  }
}
