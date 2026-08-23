import { strict as assert } from 'node:assert';
import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/features/supabase/lib/database.types';

type Client = SupabaseClient<Database>;
const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}. See docs/SECURITY_MODEL.md for the integration test setup.`);
  return value;
};

const url = required('SUPABASE_URL');
const anonKey = required('SUPABASE_ANON_KEY');
const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');
const email = required('LEARNER_TIMEZONE_TEST_EMAIL');
const password = required('LEARNER_TIMEZONE_TEST_PASSWORD');
const userClient = createClient<Database>(url, anonKey);
const adminClient = createClient<Database>(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: authData, error: authError } = await userClient.auth.signInWithPassword({ email, password });
if (authError || !authData.user) throw new Error(authError?.message ?? 'Timezone test user did not sign in.');
const userId = authData.user.id;

const { data: settings, error: settingsError } = await adminClient
  .from('learner_settings')
  .select('timezone')
  .eq('user_id', userId)
  .single();
if (settingsError) throw new Error(settingsError.message);

const eventId = randomUUID();
try {
  const { error: timezoneError } = await adminClient.from('learner_settings').update({ timezone: 'Asia/Tokyo' }).eq('user_id', userId);
  if (timezoneError) throw new Error(timezoneError.message);

  const boundaryBefore = await userClient.rpc('learner_local_date', { target_at: '2026-08-23T14:59:00Z', target_user_id: userId });
  const boundaryAfter = await userClient.rpc('learner_local_date', { target_at: '2026-08-23T15:01:00Z', target_user_id: userId });
  if (boundaryBefore.error) throw new Error(boundaryBefore.error.message);
  if (boundaryAfter.error) throw new Error(boundaryAfter.error.message);
  assert.equal(boundaryBefore.data, '2026-08-23', '23:59 JST must stay on Aug 23.');
  assert.equal(boundaryAfter.data, '2026-08-24', '00:01 JST must be Aug 24.');

  const { error: invalidTimezoneError } = await adminClient.from('learner_settings').update({ timezone: 'Invalid/Timezone' }).eq('user_id', userId);
  if (invalidTimezoneError) throw new Error(invalidTimezoneError.message);
  const fallback = await userClient.rpc('learner_local_date', { target_at: '2026-08-23T15:01:00Z', target_user_id: userId });
  if (fallback.error) throw new Error(fallback.error.message);
  assert.equal(fallback.data, '2026-08-24', 'Invalid timezone must fall back to Asia/Tokyo.');

  const before = await userClient.rpc('get_learner_stats');
  if (before.error || !before.data?.[0]) throw new Error(before.error?.message ?? 'Could not read baseline learner stats.');
  const { error: eventError } = await adminClient.from('learning_activity_events').insert({
    id: eventId,
    user_id: userId,
    course_id: null,
    event_type: 'vocabulary_reviewed',
    event_label: 'Timezone boundary test',
    metadata: { test: 'timezone-boundary' },
    occurred_at: new Date().toISOString(),
  });
  if (eventError) throw new Error(eventError.message);
  const after = await userClient.rpc('get_learner_stats');
  if (after.error || !after.data?.[0]) throw new Error(after.error?.message ?? 'Could not read learner stats after test event.');
  assert.equal(Number(after.data[0].daily_xp), Number(before.data[0].daily_xp) + 10, 'Daily XP must use the learner-local day.');
  assert.ok(Number(after.data[0].current_streak) >= 1, 'A local-day activity must contribute to streak.');

  console.log('learner timezone boundary integration passed');
} finally {
  await adminClient.from('learning_activity_events').delete().eq('id', eventId);
  await adminClient.from('learner_settings').update({ timezone: settings.timezone }).eq('user_id', userId);
}
