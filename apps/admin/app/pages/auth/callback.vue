<script setup lang="ts">
import type { Database } from '@delupa/database/types'

import { resolveAppReturnPath } from '@delupa/auth'

const route = useRoute()
const supabase = useSupabaseClient<Database>()
const message = ref('Confirmando acesso…')

onMounted(async () => {
  const code = typeof route.query.code === 'string' ? route.query.code : null
  if (!code) {
    message.value = 'Link inválido. Solicite um novo convite.'
    return
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    message.value = 'O link expirou ou já foi utilizado. Solicite um novo convite.'
    return
  }

  await navigateTo(resolveAppReturnPath(route.query.next, '/'))
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
