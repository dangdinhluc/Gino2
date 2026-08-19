import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import type { Database } from './database.types';

export type AppSupabaseClient = SupabaseClient<Database>;

export function requireSupabase(): AppSupabaseClient {
  if (!supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }
  return supabase;
}

export async function requireUserId(client: AppSupabaseClient = requireSupabase()): Promise<string> {
  const { data, error } = await client.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Cần đăng nhập để thực hiện thao tác này.');
  return data.user.id;
}
