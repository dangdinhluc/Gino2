import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2';

const BASE_CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function allowedOrigins(): string[] {
  return (Deno.env.get('APP_ORIGIN') ?? Deno.env.get('PUBLIC_APP_URL') ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin')?.replace(/\/$/, '');
  return Boolean(origin && allowedOrigins().includes(origin));
}

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin')?.replace(/\/$/, '');
  return isAllowedOrigin(request) && origin
    ? { ...BASE_CORS_HEADERS, 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
    : BASE_CORS_HEADERS;
}

export function assertAllowedOrigin(request: Request): void {
  if (!isAllowedOrigin(request)) throw new Error('ORIGIN_NOT_ALLOWED');
}

export function json(data: unknown, status: number, request: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status: number, request: Request): Response {
  return json({ error: message }, status, request);
}

export async function authenticate(request: Request): Promise<{ client: SupabaseClient; user: User }> {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) throw new Error('AUTH_REQUIRED');
  const client = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authorization } } },
  );
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error('AUTH_REQUIRED');
  return { client, user: data.user };
}

export function serviceClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('SERVICE_CONFIG_MISSING');
  return createClient(url, key);
}

export async function assertEnrollment(client: SupabaseClient, userId: string, courseId?: string): Promise<void> {
  let query = client.from('enrollments').select('id').eq('user_id', userId).in('status', ['active', 'completed']).limit(1);
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('ENROLLMENT_REQUIRED');
}

export function parseJsonBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_PAYLOAD');
  return value as Record<string, unknown>;
}

export function stringField(body: Record<string, unknown>, field: string, min: number, max: number): string {
  const value = body[field];
  if (typeof value !== 'string') throw new Error(`INVALID_${field.toUpperCase()}`);
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) throw new Error(`INVALID_${field.toUpperCase()}`);
  return trimmed;
}

export function optionalString(body: Record<string, unknown>, field: string, max: number): string | undefined {
  const value = body[field];
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || value.trim().length > max) throw new Error(`INVALID_${field.toUpperCase()}`);
  return value.trim();
}

export function handleError(error: unknown, request: Request): Response {
  const message = error instanceof Error ? error.message : 'REQUEST_FAILED';
  if (message === 'AUTH_REQUIRED') return errorResponse('Đăng nhập là bắt buộc.', 401, request);
  if (message === 'NOTIFICATION_DISPATCH_UNAUTHORIZED') return errorResponse('Yêu cầu dispatcher không hợp lệ.', 401, request);
  if (message === 'NOTIFICATION_DISPATCH_CONFIG_MISSING') return errorResponse('Notification dispatcher chưa được cấu hình.', 503, request);
  if (message === 'ORIGIN_NOT_ALLOWED') return errorResponse('Origin không được phép.', 403, request);
  if (message === 'OWNER_PERMISSION_REQUIRED') return errorResponse('Chỉ Owner có thể thực hiện thao tác này.', 403, request);
  if (message === 'ENROLLMENT_REQUIRED') return errorResponse('Tài khoản chưa được cấp quyền vào khóa học.', 403, request);
  if (message === 'AI_QUOTA_EXCEEDED') return errorResponse('Đã hết quota AI trong tháng.', 429, request);
  if (message === 'AI_RATE_LIMITED') return errorResponse('Thao tác quá nhanh. Vui lòng thử lại sau một phút.', 429, request);
  if (message === 'SERVICE_CONFIG_MISSING') return errorResponse('AI service chưa được cấu hình.', 503, request);
  if (message === 'EMAIL_SERVICE_CONFIG_MISSING') return errorResponse('Email service chưa được cấu hình.', 503, request);
  if (message === 'INVALID_BATCH_SIZE') return errorResponse('Số lượng email mỗi lượt không hợp lệ.', 400, request);
  if (message === 'APP_ORIGIN_REQUIRED') return errorResponse('Chưa cấu hình URL ứng dụng cho lời mời.', 503, request);
  if (message === 'INVALID_EMAIL') return errorResponse('Email nhân sự không hợp lệ.', 400, request);
  if (message === 'INVALID_STAFF_ROLE') return errorResponse('Vai trò nhân sự không hợp lệ.', 400, request);
  if (message.startsWith('STAFF_INVITE_FAILED')) return errorResponse('Không thể gửi lời mời. Email có thể đã có tài khoản hoặc email Auth chưa được cấu hình.', 400, request);
  if (message === 'STAFF_INVITE_ROLE_GRANT_FAILED') return errorResponse('Không thể gán quyền cho nhân sự vừa mời.', 500, request);
  if (message.startsWith('EMAIL_PROVIDER_')) return errorResponse('Nhà cung cấp email tạm thời không phản hồi. Hệ thống sẽ thử lại.', 502, request);
  if (message.startsWith('GEMINI_') || message.startsWith('SPEECH_')) return errorResponse('Dịch vụ AI tạm thời không phản hồi. Vui lòng thử lại.', 502, request);
  return errorResponse(message, 400, request);
}
