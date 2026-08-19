import { corsHeaders, errorResponse, handleError, isAllowedOrigin, json, parseJsonBody, serviceClient } from '../_shared/http.ts';

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

function resendConfig(): ResendConfig {
  const apiKey = Deno.env.get('RESEND_API_KEY')?.trim();
  const from = Deno.env.get('RESEND_FROM_EMAIL')?.trim();
  if (!apiKey || !from) throw new Error('EMAIL_SERVICE_CONFIG_MISSING');
  return { apiKey, from };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function actionLink(actionUrl: string | null): string | null {
  if (!actionUrl) return null;
  const appUrl = (Deno.env.get('PUBLIC_APP_URL') ?? Deno.env.get('APP_ORIGIN') ?? '').trim().replace(/\/$/, '');
  if (!appUrl || !actionUrl.startsWith('/') || actionUrl.startsWith('//')) return null;
  try {
    return new URL(actionUrl, `${appUrl}/`).toString();
  } catch {
    return null;
  }
}

async function sendEmail(config: ResendConfig, delivery: ClaimedDelivery, recipient: string): Promise<void> {
  const link = actionLink(delivery.action_url);
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

async function completeDelivery(admin: ReturnType<typeof serviceClient>, deliveryId: string, status: 'sent' | 'failed', error?: string): Promise<void> {
  const { error: completionError } = await admin.rpc('complete_notification_email_delivery', {
    target_delivery_id: deliveryId,
    target_status: status,
    target_error: error?.slice(0, 2000) ?? null,
  });
  if (completionError) throw new Error(completionError.message);
}

function batchSize(body: Record<string, unknown>): number {
  const value = body.batchSize ?? 25;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 50) throw new Error('INVALID_BATCH_SIZE');
  return value;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return isAllowedOrigin(request) ? new Response('ok', { headers: corsHeaders(request) }) : errorResponse('Origin không được phép.', 403, request);
  if (request.method !== 'POST') return errorResponse('Chỉ hỗ trợ POST.', 405, request);

  try {
    assertDispatchSecret(request);
    const body = parseJsonBody(await request.json());
    const admin = serviceClient();
    const { data: queuedReminders, error: reminderError } = await admin.rpc('queue_due_reminders');
    if (reminderError) throw new Error(reminderError.message);
    const config = resendConfig();
    const { data: claimedData, error: claimError } = await admin.rpc('claim_notification_email_deliveries', { target_batch_size: batchSize(body) });
    if (claimError) throw new Error(claimError.message);

    const claimed = (claimedData ?? []) as ClaimedDelivery[];
    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const delivery of claimed) {
      if (delivery.status === 'skipped') {
        skipped += 1;
        continue;
      }

      const { data: userData, error: userError } = await admin.auth.admin.getUserById(delivery.user_id);
      const recipient = userData.user?.email?.trim();
      if (userError || !recipient) {
        failed += 1;
        try { await completeDelivery(admin, delivery.delivery_id, 'failed', userError?.message ?? 'RECIPIENT_EMAIL_MISSING'); } catch { /* retry is safer than reporting success */ }
        continue;
      }

      try {
        await sendEmail(config, delivery, recipient);
        await completeDelivery(admin, delivery.delivery_id, 'sent');
        sent += 1;
      } catch (error) {
        failed += 1;
        try { await completeDelivery(admin, delivery.delivery_id, 'failed', error instanceof Error ? error.message : 'EMAIL_PROVIDER_FAILED'); } catch { /* keep the claim recoverable by the stale-lock retry */ }
      }
    }

    return json({ queuedReminders: Number(queuedReminders ?? 0), claimed: claimed.length, sent, failed, skipped }, 200, request);
  } catch (error) {
    return handleError(error, request);
  }
});
