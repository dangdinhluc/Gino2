import webpush from 'npm:web-push@3.6.7';
import { corsHeaders, errorResponse, handleError, isAllowedOrigin, json, parseJsonBody, serviceClient } from '../_shared/http.ts';
import { actionLink, appRelativeRoute } from './url.ts';

interface ClaimedDelivery {
  delivery_id: string;
  notification_id: string;
  user_id: string;
  title: string;
  body: string;
  action_url: string | null;
  status: 'processing' | 'skipped';
  attempts: number;
}

interface ResendConfig {
  apiKey: string;
  from: string;
}

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

function assertDispatchSecret(request: Request): void {
  const expected = Deno.env.get('NOTIFICATION_DISPATCH_SECRET')?.trim();
  if (!expected) throw new Error('NOTIFICATION_DISPATCH_CONFIG_MISSING');
  const provided = request.headers.get('x-notification-dispatch-secret') ?? request.headers.get('apikey') ?? '';
  if (!constantTimeEqual(provided, expected)) throw new Error('NOTIFICATION_DISPATCH_UNAUTHORIZED');
  const origin = request.headers.get('Origin');
  if (origin && !isAllowedOrigin(request)) throw new Error('ORIGIN_NOT_ALLOWED');
}

function resendConfig(): ResendConfig | null {
  const apiKey = Deno.env.get('RESEND_API_KEY')?.trim();
  const from = Deno.env.get('RESEND_FROM_EMAIL')?.trim();
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

function pushConfig(): { publicKey: string; privateKey: string; subject: string } | null {
  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY')?.trim();
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY')?.trim();
  const subject = (Deno.env.get('VAPID_SUBJECT')?.trim() || 'mailto:support@tokutei-gino.app');
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function absoluteActionLink(actionUrl: string | null): string | null {
  return actionLink(actionUrl, Deno.env.get('PUBLIC_APP_URL') ?? Deno.env.get('APP_ORIGIN') ?? 'https://dangdinhluc.github.io/Gino2');
}

async function sendEmail(config: ResendConfig, delivery: ClaimedDelivery, recipient: string): Promise<void> {
  const link = absoluteActionLink(delivery.action_url);
  const safeTitle = escapeHtml(delivery.title);
  const safeBody = escapeHtml(delivery.body).replace(/\n/g, '<br />');
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033"><h2>${safeTitle}</h2><p>${safeBody}</p>${link ? `<p><a href="${escapeHtml(link)}">Mở trong TOKUTEI GINO</a></p>` : ''}</div>`;
  const text = `${delivery.title}\n\n${delivery.body}${link ? `\n\nMở trong TOKUTEI GINO: ${link}` : ''}`;
  let lastError = 'EMAIL_PROVIDER_FAILED';

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `notification-delivery/${delivery.delivery_id}`,
      },
      body: JSON.stringify({ from: config.from, to: [recipient], subject: `[TOKUTEI GINO] ${delivery.title}`, html, text }),
    });
    if (response.ok) return;
    const detail = (await response.text()).slice(0, 500);
    lastError = `EMAIL_PROVIDER_${response.status}:${detail}`;
    if (attempt === 1 || (response.status < 500 && response.status !== 429)) throw new Error(lastError);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(lastError);
}

async function sendPush(config: { publicKey: string; privateKey: string; subject: string }, subscription: PushSubscription, delivery: ClaimedDelivery): Promise<void> {
  const url = appRelativeRoute(delivery.action_url);
  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  await webpush.sendNotification(
    { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
    JSON.stringify({ title: delivery.title, body: delivery.body, url: url ?? undefined }),
    { TTL: 60 * 60 * 24, urgency: 'normal' },
  );
}

async function completeEmailDelivery(admin: ReturnType<typeof serviceClient>, deliveryId: string, status: 'sent' | 'failed' | 'skipped', error?: string): Promise<void> {
  const { error: completionError } = await admin.rpc('complete_notification_email_delivery', { target_delivery_id: deliveryId, target_status: status, target_error: error?.slice(0, 2000) ?? null });
  if (completionError) throw new Error(completionError.message);
}

async function completePushDelivery(admin: ReturnType<typeof serviceClient>, deliveryId: string, status: 'sent' | 'failed' | 'skipped', error?: string): Promise<void> {
  const { error: completionError } = await admin.rpc('complete_notification_push_delivery', { target_delivery_id: deliveryId, target_status: status, target_error: error?.slice(0, 2000) ?? null });
  if (completionError) throw new Error(completionError.message);
}

function batchSize(body: Record<string, unknown>): number {
  const value = body.batchSize ?? 25;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 50) throw new Error('INVALID_BATCH_SIZE');
  return value;
}

async function dispatchEmail(admin: ReturnType<typeof serviceClient>, size: number): Promise<{ sent: number; failed: number; skipped: number; configured: boolean }> {
  const config = resendConfig();
  if (!config) return { sent: 0, failed: 0, skipped: 0, configured: false };

  const { data: claimedData, error: claimError } = await admin.rpc('claim_notification_email_deliveries', { target_batch_size: size });
  if (claimError) throw new Error(claimError.message);
  const claimed = (claimedData ?? []) as ClaimedDelivery[];
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const delivery of claimed) {
    if (delivery.status === 'skipped') { skipped += 1; continue; }
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(delivery.user_id);
    const recipient = userData.user?.email?.trim();
    if (userError || !recipient) {
      failed += 1;
      try { await completeEmailDelivery(admin, delivery.delivery_id, 'failed', userError?.message ?? 'RECIPIENT_EMAIL_MISSING'); } catch { /* retry */ }
      continue;
    }
    try {
      await sendEmail(config, delivery, recipient);
      await completeEmailDelivery(admin, delivery.delivery_id, 'sent');
      sent += 1;
    } catch (error) {
      failed += 1;
      try { await completeEmailDelivery(admin, delivery.delivery_id, 'failed', error instanceof Error ? error.message : 'EMAIL_PROVIDER_FAILED'); } catch { /* retry */ }
    }
  }
  return { sent, failed, skipped, configured: true };
}

async function dispatchPush(admin: ReturnType<typeof serviceClient>, size: number): Promise<{ sent: number; failed: number; skipped: number; configured: boolean }> {
  const config = pushConfig();
  if (!config) return { sent: 0, failed: 0, skipped: 0, configured: false };

  const { data: claimedData, error: claimError } = await admin.rpc('claim_notification_push_deliveries', { target_batch_size: size });
  if (claimError) throw new Error(claimError.message);
  const claimed = (claimedData ?? []) as ClaimedDelivery[];
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const delivery of claimed) {
    if (delivery.status === 'skipped') { skipped += 1; continue; }
    const { data: subs, error: subsError } = await admin.from('push_subscriptions').select('endpoint, p256dh, auth').eq('user_id', delivery.user_id);
    if (subsError) throw new Error(subsError.message);
    if (!subs?.length) {
      skipped += 1;
      try { await completePushDelivery(admin, delivery.delivery_id, 'skipped', 'NO_SUBSCRIPTION'); } catch { /* retry */ }
      continue;
    }
    let delivered = 0;
    for (const sub of subs) {
      try {
        await sendPush(config, sub as PushSubscription, delivery);
        delivered += 1;
      } catch {
        // Per-device failure (expired/revoked endpoint) — do not fail the whole delivery.
      }
    }
    if (delivered > 0) {
      sent += 1;
      await completePushDelivery(admin, delivery.delivery_id, 'sent');
    } else {
      failed += 1;
      await completePushDelivery(admin, delivery.delivery_id, 'failed', 'PUSH_SEND_FAILED');
    }
  }
  return { sent, failed, skipped, configured: true };
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return isAllowedOrigin(request) ? new Response('ok', { headers: corsHeaders(request) }) : errorResponse('Origin không được phép.', 403, request);
  if (request.method !== 'POST') return errorResponse('Chỉ hỗ trợ POST.', 405, request);

  try {
    assertDispatchSecret(request);
    const body = parseJsonBody(await request.json());
    const admin = serviceClient();
    const size = batchSize(body);

    const { data: queuedReminders, error: reminderError } = await admin.rpc('queue_due_reminders');
    if (reminderError) throw new Error(reminderError.message);

    const email = await dispatchEmail(admin, size);
    const push = await dispatchPush(admin, size);

    return json({
      queuedReminders: Number(queuedReminders ?? 0),
      email: { ...email, configured: email.configured },
      push: { sent: push.sent, failed: push.failed, skipped: push.skipped, configured: push.configured },
    }, 200, request);
  } catch (error) {
    return handleError(error, request);
  }
});
