<script setup lang="ts">
import type { Database } from '@delupa/database/types'

import { resolveAppReturnPath } from '@delupa/auth'

const route = useRoute()
const supabase = useSupabaseClient<Database>()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const messageKind = ref<'error' | 'info'>('error')
const pending = ref(false)

async function register() {
  message.value = ''
  if (password.value !== confirmPassword.value) {
    message.value = 'As senhas não coincidem.'
    return
  }

  pending.value = true
  const callbackUrl = new URL('/auth/callback', window.location.origin)
  callbackUrl.searchParams.set('next', resolveAppReturnPath(route.query.next, '/minha-conta'))

  const { data, error } = await supabase.auth.signUp({
    email: email.value.trim(),
    password: password.value,
    options: { emailRedirectTo: callbackUrl.toString() }
  })

  pending.value = false
  if (error) {
    message.value = 'Não foi possível criar sua conta. Confira os dados e tente novamente.'
    return
  }

  if (data.session) {
    await navigateTo(resolveAppReturnPath(route.query.next, '/minha-conta'))
    return
  }

  messageKind.value = 'info'
  message.value = 'Conta criada. Confira seu e-mail para confirmar o cadastro e entrar.'
}
</script>

<template>
  <main class="auth-shell">
    <section
      class="auth-card"
      aria-labelledby="register-title"
    >
      <NuxtLink to="/">Delupa</NuxtLink>
      <h1 id="register-title">Criar conta de cliente</h1>
      <p>
        O cadastro cria uma conta de cliente. O acesso administrativo é concedido separadamente.
      </p>

      <form
        class="form-stack"
        @submit.prevent="register"
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
            autocomplete="new-password"
            minlength="8"
            required
          />
        </label>

        <label class="form-field">
          Confirmar senha
          <input
            v-model="confirmPassword"
            type="password"
            name="confirm-password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </label>

        <p
          v-if="message"
          class="form-message"
          :data-kind="messageKind"
          role="status"
        >
          {{ message }}
        </p>

        <button
          type="submit"
          :disabled="pending"
        >
          {{ pending ? 'Criando conta…' : 'Criar conta' }}
        </button>
      </form>

      <p class="muted">
        Já tem uma conta?
        <NuxtLink to="/login">Entrar</NuxtLink>
        .
      </p>
    </section>
  </main>
</template>
