<script setup lang="ts">
import type { Database } from '@delupa/database/types'

import { resolveAppReturnPath } from '@delupa/auth'

const route = useRoute()
const supabase = useSupabaseClient<Database>()
const webUrl = useRuntimeConfig().public.webUrl
const email = ref('')
const password = ref('')
const message = ref('')
const pending = ref(false)

async function login() {
  pending.value = true
  message.value = ''
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value
  })

  if (error || !data.user) {
    message.value = 'Não foi possível entrar. Confira seu e-mail e senha.'
    pending.value = false
    return
  }

  const { data: role, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (roleError || role?.role !== 'admin') {
    await supabase.auth.signOut()
    message.value = 'Esta conta não tem acesso administrativo.'
    pending.value = false
    return
  }

  await navigateTo(resolveAppReturnPath(route.query.next, '/'))
}
</script>

<template>
  <main class="auth-shell">
    <section
      class="auth-card"
      aria-labelledby="login-title"
    >
      <NuxtLink to="/">Delupa · Administração</NuxtLink>
      <h1 id="login-title">Entrar no painel</h1>
      <p>Acesso exclusivo para operadores autorizados.</p>
      <p
        v-if="route.query.erro === 'permissao'"
        class="form-message"
        data-kind="error"
        role="alert"
      >
        Sua conta não tem acesso administrativo.
      </p>
      <form
        class="form-stack"
        @submit.prevent="login"
      >
        <label class="form-field">
          E-mail
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
          />
        </label>
        <label class="form-field">
          Senha
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>
        <p
          v-if="message"
          class="form-message"
          data-kind="error"
          role="alert"
        >
          {{ message }}
        </p>
        <button
          type="submit"
          :disabled="pending"
        >
          {{ pending ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
      <p class="muted"><a :href="webUrl">Ir para a loja</a></p>
    </section>
  </main>
</template>
