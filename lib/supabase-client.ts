'use client'

import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | undefined

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          if (typeof document !== 'undefined') {
            const value = document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${name}=`))
              ?.split('=')[1]
            return value ? decodeURIComponent(value) : undefined
          }
          return undefined
        },
        set: (name: string, value: string, options: any = {}) => {
          if (typeof document !== 'undefined') {
            const cookieValue = encodeURIComponent(value)
            const expires = options.expires ? `;expires=${options.expires.toUTCString()}` : ''
            const maxAge = options.maxAge ? `;max-age=${options.maxAge}` : ''
            const path = options.path || ';path=/'
            const secure = options.secure ? ';secure' : ''
            const sameSite = options.sameSite ? `;samesite=${options.sameSite}` : ';samesite=lax'
            
            document.cookie = `${name}=${cookieValue}${expires}${maxAge}${path}${secure}${sameSite}`
          }
        },
        remove: (name: string, options: any = {}) => {
          if (typeof document !== 'undefined') {
            const path = options.path || ';path=/'
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${path}`
          }
        },
      },
    }
  )

  return supabaseClient
}