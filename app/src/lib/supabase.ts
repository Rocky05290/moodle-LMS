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

export const supabase = hasSupabase
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
