import { assertAllowedOrigin, authenticate, corsHeaders, errorResponse, handleError, isAllowedOrigin, parseJsonBody, serviceClient, stringField } from '../_shared/http.ts';

const INVITABLE_ROLES = new Set(['content_editor', 'instructor_support', 'analyst']);

function appRedirectUrl(): string {
  const value = (Deno.env.get('PUBLIC_APP_URL') ?? '').trim().replace(/\/$/, '');
  if (!value) throw new Error('APP_ORIGIN_REQUIRED');
  return `${value}/onboarding`;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return isAllowedOrigin(request) ? new Response('ok', { headers: corsHeaders(request) }) : errorResponse('Origin không được phép.', 403, request);
  if (request.method !== 'POST') return errorResponse('Chỉ hỗ trợ POST.', 405, request);

  try {
    assertAllowedOrigin(request);
    const { client, user } = await authenticate(request);
    const { data: currentRole, error: roleError } = await client.rpc('staff_role');
    if (roleError) throw new Error(roleError.message);
    if (currentRole !== 'owner') throw new Error('OWNER_PERMISSION_REQUIRED');

    const body = parseJsonBody(await request.json());
    const email = stringField(body, 'email', 3, 254).toLowerCase();
    const role = stringField(body, 'role', 3, 40);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('INVALID_EMAIL');
    if (!INVITABLE_ROLES.has(role)) throw new Error('INVALID_STAFF_ROLE');

    const admin = serviceClient();
    const { data: invitation, error: invitationError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: appRedirectUrl(),
      data: { invited_by: user.id, invited_staff_role: role },
    });
    if (invitationError || !invitation.user) throw new Error(`STAFF_INVITE_FAILED${invitationError ? `: ${invitationError.message}` : ''}`);

    const { error: grantError } = await client.rpc('admin_set_staff_role', {
      target_user_id: invitation.user.id,
      target_role: role,
    });
    if (grantError) {
      await admin.auth.admin.deleteUser(invitation.user.id);
      throw new Error('STAFF_INVITE_ROLE_GRANT_FAILED');
    }

    return new Response(JSON.stringify({ userId: invitation.user.id, email, role }), {
      headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleError(error, request);
  }
});
