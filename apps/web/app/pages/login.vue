<script setup lang="ts">
import type { Database } from '@delupa/database/types'

import { resolveAppReturnPath } from '@delupa/auth'

const route = useRoute()
const supabase = useSupabaseClient<Database>()
const runtimeConfig = useRuntimeConfig()
const email = ref('')
const password = ref('')
const message = ref('')
const messageKind = ref<'error' | 'info'>('error')
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

  const { data: roleRecord, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (roleError || roleRecord?.role !== 'client') {
    await supabase.auth.signOut()
    message.value = 'Esta conta não tem acesso de cliente. Use o endereço do painel administrativo.'
    pending.value = false
    return
  }

  await navigateTo(resolveAppReturnPath(route.query.next, '/minha-conta'))
}
</script>

<template>
  <main class="auth-shell">
    <section
      class="auth-card"
      aria-labelledby="login-title"
    >
      <NuxtLink to="/">Delupa</NuxtLink>
      <h1 id="login-title">Entrar</h1>
      <p>Acesse sua conta de cliente para acompanhar seus pedidos.</p>

      <form
        class="form-stack"
        @submit.prevent="login"
      >
        <label class="form-field">
          E-mail
          <input
            v-model="email"
            type="email"
            name="email"
            autocomplete="email"
            required
          />
        </label>

        <label class="form-field">
          Senha
          <input
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            required
          />
        </label>

        <p
          v-if="message"
          class="form-message"
          :data-kind="messageKind"
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

      <p class="muted">
        Ainda não tem conta?
        <NuxtLink to="/cadastro">Cadastre-se</NuxtLink>
        .
      </p>
      <p
        v-if="runtimeConfig.public.adminUrl"
        class="muted"
      >
        É operador?
        <a :href="runtimeConfig.public.adminUrl">Acesse o painel</a>
        .
      </p>
    </section>
  </main>
</template>
