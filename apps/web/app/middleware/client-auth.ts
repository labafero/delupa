import type { Database } from '@delupa/database/types'

import { resolveAppReturnPath } from '@delupa/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient<Database>()
  const { data, error } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub

  if (error || typeof userId !== 'string') {
    return navigateTo({
      path: '/login',
      query: { next: resolveAppReturnPath(to.fullPath, '/minha-conta') }
    })
  }

  const { data: roleRecord, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (roleError || roleRecord?.role !== 'client') return navigateTo('/')
})
