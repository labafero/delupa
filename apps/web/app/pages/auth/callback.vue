<script setup lang="ts">
import type { Database } from '@delupa/database/types'

import { resolveAppReturnPath } from '@delupa/auth'

const route = useRoute()
const supabase = useSupabaseClient<Database>()
const errorMessage = ref('')

onMounted(async () => {
  const code = typeof route.query.code === 'string' ? route.query.code : null
  if (!code) {
    errorMessage.value = 'Não foi possível confirmar o acesso. Solicite um novo link por e-mail.'
    return
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    errorMessage.value = 'O link expirou ou já foi usado. Solicite um novo link por e-mail.'
    return
  }

  await navigateTo(resolveAppReturnPath(route.query.next, '/minha-conta'))
})
</script>

<template>
  <main class="auth-shell">
    <section
      class="auth-card"
      aria-live="polite"
    >
      <h1>{{ errorMessage ? 'Não foi possível confirmar' : 'Confirmando seu acesso…' }}</h1>
      <p
        v-if="errorMessage"
        class="form-message"
        data-kind="error"
        role="alert"
      >
        {{ errorMessage }}
      </p>
      <p v-if="errorMessage"><NuxtLink to="/login">Voltar para entrar</NuxtLink></p>
    </section>
  </main>
</template>
