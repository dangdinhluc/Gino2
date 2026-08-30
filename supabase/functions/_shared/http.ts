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
  const code = error instanceof Error ? error.message : 'REQUEST_FAILED';
  const mapped: Record<string, [string, number]> = {
    AUTH_REQUIRED: ['Đăng nhập là bắt buộc.', 401],
    NOTIFICATION_DISPATCH_UNAUTHORIZED: ['Yêu cầu dispatcher không hợp lệ.', 401],
    NOTIFICATION_DISPATCH_CONFIG_MISSING: ['Notification dispatcher chưa được cấu hình.', 503],
    ORIGIN_NOT_ALLOWED: ['Origin không được phép.', 403],
    OWNER_PERMISSION_REQUIRED: ['Chỉ Owner có thể thực hiện thao tác này.', 403],
    STAFF_PERMISSION_REQUIRED: ['Tài khoản không có quyền thực hiện thao tác này.', 403],
    ENROLLMENT_REQUIRED: ['Tài khoản chưa được cấp quyền vào khóa học.', 403],
    ASSESSMENT_NOT_AVAILABLE: ['Đề thi không khả dụng.', 403],
    ASSESSMENT_ATTEMPT_REQUIRED: ['Phiên làm bài không hợp lệ.', 403],
    ASSESSMENT_ATTEMPT_NOT_AVAILABLE: ['Phiên làm bài không còn khả dụng.', 403],
    ASSESSMENT_ATTEMPT_EXPIRED: ['Thời gian làm bài đã hết.', 403],
    ASSESSMENT_LOCKED: ['Hãy hoàn thành đề thi trước để mở đề này.', 403],
    ASSESSMENT_EMPTY: ['Đề thi chưa có câu hỏi.', 422],
    INVALID_ASSESSMENT_ANSWERS: ['Đáp án gửi lên không hợp lệ.', 400],
    AI_QUOTA_EXCEEDED: ['Đã hết quota AI trong tháng.', 429],
    AI_RATE_LIMITED: ['Thao tác quá nhanh. Vui lòng thử lại sau một phút.', 429],
    SERVICE_CONFIG_MISSING: ['AI service chưa được cấu hình.', 503],
    EMAIL_SERVICE_CONFIG_MISSING: ['Email service chưa được cấu hình.', 503],
    INVALID_PAYLOAD: ['Dữ liệu yêu cầu không hợp lệ.', 400],
    INVALID_BATCH_SIZE: ['Số lượng email mỗi lượt không hợp lệ.', 400],
    APP_ORIGIN_REQUIRED: ['Chưa cấu hình URL ứng dụng cho lời mời.', 503],
    INVALID_EMAIL: ['Email nhân sự không hợp lệ.', 400],
    INVALID_STAFF_ROLE: ['Vai trò nhân sự không hợp lệ.', 400],
    STAFF_INVITE_ROLE_GRANT_FAILED: ['Không thể gán quyền cho nhân sự vừa mời.', 500],
  };
  const known = mapped[code];
  if (known) return errorResponse(known[0], known[1], request);
  if (code.startsWith('INVALID_')) return errorResponse('Dữ liệu yêu cầu không hợp lệ.', 400, request);
  if (code.startsWith('STAFF_INVITE_FAILED')) return errorResponse('Không thể gửi lời mời. Email có thể đã có tài khoản hoặc email Auth chưa được cấu hình.', 400, request);
  if (code.startsWith('EMAIL_PROVIDER_') || code.startsWith('GEMINI_') || code.startsWith('SPEECH_')) return errorResponse('Dịch vụ tạm thời không phản hồi. Vui lòng thử lại.', 502, request);
  console.error('[edge-function]', { code, name: error instanceof Error ? error.name : 'UnknownError' });
  return errorResponse('Không thể xử lý yêu cầu.', 500, request);
}
