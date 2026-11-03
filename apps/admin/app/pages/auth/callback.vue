<script setup lang="ts">
import type { Database } from '@delupa/database/types'

import { resolveAppReturnPath } from '@delupa/auth'

const route = useRoute()
const supabase = useSupabaseClient<Database>()
const message = ref('Confirmando acesso…')

onMounted(async () => {
  const code = typeof route.query.code === 'string' ? route.query.code : null
  const tokenHash = typeof route.query.token_hash === 'string' ? route.query.token_hash : null
  const fragment = new URLSearchParams(window.location.hash.slice(1))
  const authType = route.query.type || fragment.get('type')
  const fragmentError = fragment.get('error_description') || fragment.get('error')

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      message.value = 'O link expirou ou já foi utilizado. Solicite um novo convite.'
      return
    }
  } else if (tokenHash) {
    const type = authType === 'recovery' ? 'recovery' : authType === 'invite' ? 'invite' : 'email'
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) {
      message.value = 'O link expirou ou já foi utilizado. Solicite um novo convite.'
      return
    }
  } else if (fragmentError) {
    message.value = 'O link expirou ou já foi utilizado. Solicite um novo convite.'
    return
  } else if (fragment.has('access_token') && fragment.has('refresh_token')) {
    const { error } = await supabase.auth.setSession({
      access_token: fragment.get('access_token')!,
      refresh_token: fragment.get('refresh_token')!
    })
    if (error) {
      message.value = 'Não foi possível confirmar o acesso. Solicite um novo convite.'
      return
    }
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}`
    )
  } else {
    const { data, error } = await supabase.auth.getSession()
    if (error || !data.session) {
      message.value = 'Link inválido. Solicite um novo convite.'
      return
    }
  }

  const fallbackPath = authType === 'invite' ? '/definir-senha' : '/'
  await navigateTo(resolveAppReturnPath(route.query.next, fallbackPath))
})
</script>

<template>
  <main class="auth-shell">
    <section
      class="auth-card"
      aria-live="polite"
    >
      <h1>{{ message }}</h1>
      <NuxtLink
        v-if="message !== 'Confirmando acesso…'"
        to="/login"
      >
        Voltar para entrar
      </NuxtLink>
    </section>
  </main>
</template>
