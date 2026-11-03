<script setup lang="ts">
import type { Database } from '@delupa/database/types'

definePageMeta({ middleware: 'client-auth' })
useSeoMeta({ title: 'Definir senha | Delupa', robots: 'noindex, nofollow' })

const supabase = useSupabaseClient<Database>()
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const messageKind = ref<'error' | 'info'>('error')
const pending = ref(false)

async function savePassword() {
  message.value = ''
  if (password.value !== confirmPassword.value) {
    message.value = 'As senhas não coincidem.'
    return
  }

  pending.value = true
  const { error } = await supabase.auth.updateUser({ password: password.value })
  pending.value = false
  if (error) {
    message.value = 'Não foi possível salvar a senha. Solicite um novo link e tente novamente.'
    return
  }

  messageKind.value = 'info'
  message.value = 'Senha definida. Você já pode acompanhar seus pedidos.'
  password.value = ''
  confirmPassword.value = ''
  await navigateTo('/minha-conta')
}
</script>

<template>
  <main class="auth-shell">
    <section
      class="auth-card"
      aria-labelledby="password-title"
    >
      <NuxtLink to="/">Delupa</NuxtLink>
      <h1 id="password-title">Definir senha</h1>
      <p>Escolha uma senha com pelo menos 8 caracteres para entrar e acompanhar seus pedidos.</p>
      <form
        class="form-stack"
        @submit.prevent="savePassword"
      >
        <label class="form-field">
          Nova senha
          <input
            v-model="password"
            type="password"
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
          {{ pending ? 'Salvando…' : 'Salvar senha' }}
        </button>
      </form>
    </section>
  </main>
</template>
