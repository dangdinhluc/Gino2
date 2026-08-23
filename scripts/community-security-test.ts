import { strict as assert } from 'node:assert';
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
const users = [
  { email: required('COMMUNITY_TEST_USER_A_EMAIL'), password: required('COMMUNITY_TEST_USER_A_PASSWORD') },
  { email: required('COMMUNITY_TEST_USER_B_EMAIL'), password: required('COMMUNITY_TEST_USER_B_PASSWORD') },
];

async function signedInClient(credentials: typeof users[number]): Promise<{ client: Client; userId: string }> {
  const client = createClient<Database>(url, anonKey);
  const { data, error } = await client.auth.signInWithPassword(credentials);
  if (error || !data.user) throw new Error(error?.message ?? 'Test user did not sign in.');
  return { client, userId: data.user.id };
}

async function expectDenied(label: string, operation: PromiseLike<{ error: { message: string } | null }>): Promise<void> {
  const { error } = await operation;
  assert.ok(error, `${label} should be denied`);
}

const [{ client: userA, userId: userAId }, { client: userB, userId: userBId }] = await Promise.all(users.map(signedInClient));
assert.notEqual(userAId, userBId, 'Test users A and B must be different accounts.');

await expectDenied('direct INSERT', userA.from('community_messages').insert({ sender_id: userAId, recipient_id: userBId, body: 'security test' }));

const { data: sentByA, error: sendError } = await userA.rpc('send_community_message', { target_user_id: userBId, target_body: `security test ${Date.now()}` });
if (sendError || !sentByA?.[0]?.message_id) throw new Error(sendError?.message ?? 'send_community_message failed.');
const messageId = sentByA[0].message_id;

await expectDenied('direct UPDATE', userA.from('community_messages').update({ body: 'tampered' }).eq('id', messageId));
await expectDenied('direct DELETE', userA.from('community_messages').delete().eq('id', messageId));

const { data: outgoingForA, error: outgoingError } = await userA.rpc('get_community_messages', { target_user_id: userBId, target_limit: 100 });
if (outgoingError) throw new Error(outgoingError.message);
assert.equal(outgoingForA?.find((message) => message.id === messageId)?.read_at, null, 'A cannot mark A\'s outgoing message read.');

const { data: incomingForA, error: reverseSendError } = await userB.rpc('send_community_message', { target_user_id: userAId, target_body: `security test reverse ${Date.now()}` });
if (reverseSendError || !incomingForA?.[0]?.message_id) throw new Error(reverseSendError?.message ?? 'reverse send failed.');

const { error: markReadError } = await userA.rpc('mark_community_messages_read', { target_user_id: userBId });
if (markReadError) throw new Error(markReadError.message);
const { data: readMessages, error: readError } = await userA.rpc('get_community_messages', { target_user_id: userBId, target_limit: 100 });
if (readError) throw new Error(readError.message);
assert.ok(readMessages?.some((message) => message.sender_id === userBId && message.recipient_id === userAId && message.read_at), 'mark_community_messages_read should mark only incoming messages.');

console.log('community security integration passed');
