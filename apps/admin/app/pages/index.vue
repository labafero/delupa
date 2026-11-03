<script setup lang="ts">
import type { Database } from '@delupa/database/types'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const pending = ref(false)

async function signOut() {
  pending.value = true
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div>
    <header class="topbar">
      <NuxtLink to="/">Delupa · Administração</NuxtLink>
      <nav
        class="topbar-actions"
        aria-label="Navegação administrativa"
      >
        <NuxtLink to="/produtos">Produtos</NuxtLink>
        <NuxtLink to="/pedidos">Pedidos</NuxtLink>
        <span class="muted">{{ user?.email }}</span>
        <button
          class="text-button"
          :disabled="pending"
          @click="signOut"
        >
          Sair
        </button>
      </nav>
    </header>
    <main class="page-shell stack">
      <section class="content-card">
        <h1>Painel de operação</h1>
        <p>Gerencie o catálogo e acompanhe os pedidos registrados.</p>
        <div class="topbar-actions">
          <NuxtLink
            class="button-link"
            to="/produtos"
          >
            Gerenciar produtos
          </NuxtLink>
          <NuxtLink
            class="button-link"
            to="/pedidos"
          >
            Gerenciar pedidos
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>
