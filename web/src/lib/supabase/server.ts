// Design Ref: §2.3 — Server-side Supabase client
// NextAuth + Supabase 분리 구조에서 auth.uid()가 null이 되므로
// 서버 전용 client는 service role key 사용 (RLS 우회)
// 인가는 모든 쿼리에서 .eq('user_id', session.user.id)로 직접 처리
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// createAdminClient = createClient (service role 통일)
export const createAdminClient = createClient
