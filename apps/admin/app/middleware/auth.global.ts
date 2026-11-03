import type { Database } from '@delupa/database/types'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login' || to.path === '/auth/callback') return

  const supabase = useSupabaseClient<Database>()
  const { data, error } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub

  if (error || typeof userId !== 'string') {
    return navigateTo({ path: '/login', query: { next: to.fullPath } })
  }

  const { data: role, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (roleError || role?.role !== 'admin') {
    await supabase.auth.signOut()
    return navigateTo({ path: '/login', query: { erro: 'permissao' } })
  }
})
