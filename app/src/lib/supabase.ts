import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client.
 *
 * Reads credentials from environment variables (Vite):
 *   VITE_SUPABASE_URL       — your project URL
 *   VITE_SUPABASE_ANON_KEY  — the public "anon" key
 *
 * Until those are set, `hasSupabase` is false and the app keeps
 * running on the local mock data (see src/data/mock.ts), so nothing
 * breaks before the backend is connected.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const hasSupabase = Boolean(url && anonKey)
export const SUPABASE_URL = url ?? ''
export const SUPABASE_ANON_KEY = anonKey ?? ''

export const supabase = hasSupabase
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

/**
 * Create a user account WITHOUT touching the current admin's session.
 * Uses a throwaway client that never persists its own session, so signing
 * a new person up here does not sign the admin out. Name + role travel in
 * user metadata, which the `handle_new_user` DB trigger reads to fill the
 * profile row correctly.
 */
export async function createAccount(input: {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (!hasSupabase) return { ok: false, error: 'Backend not connected' }
  const temp = createClient(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false, storageKey: 'cordoba-temp-signup' },
  })
  const { data, error } = await temp.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        first_name: input.firstName,
        last_name: input.lastName,
        role: input.role,
      },
    },
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true, id: data.user?.id }
}
