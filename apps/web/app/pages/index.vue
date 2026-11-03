<script setup lang="ts">
import type { Database } from '@delupa/database/types'

const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const products = ref<
  {
    id: string
    name: string
    description: string
    unit: string
    price_cents: number
    image_path: string | null
  }[]
>([])
const pending = ref(false)
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

onMounted(async () => {
  const { data } = await supabase
    .from('products')
    .select('id,name,description,unit,price_cents,image_path')
    .eq('status', 'active')
    .order('name')
  products.value = data || []
})

function imageUrl(path: string | null) {
  if (!path) return null
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

async function signOut() {
  pending.value = true
  const { error } = await supabase.auth.signOut()
  pending.value = false
  if (!error) await navigateTo('/')
}
</script>

<template>
  <div>
    <header class="topbar">
      <NuxtLink to="/">Delupa</NuxtLink>
      <nav
        class="topbar-actions"
        aria-label="Conta"
      >
        <template v-if="user">
          <NuxtLink to="/minha-conta">Minha conta</NuxtLink>
          <button
            class="text-button"
            :disabled="pending"
            @click="signOut"
          >
            Sair
          </button>
        </template>
        <template v-else>
          <NuxtLink to="/login">Entrar</NuxtLink>
          <NuxtLink
            class="button-link"
            to="/cadastro"
          >
            Criar conta
          </NuxtLink>
        </template>
      </nav>
    </header>

    <main class="page-shell">
      <section class="content-card">
        <h1>Encontre o Casal de Lupa</h1>
        <p>Mapa, agenda e produtos do casal na orla de Maceió.</p>
      </section>
      <section
        class="page-shell"
        aria-labelledby="catalog-title"
      >
        <h2 id="catalog-title">Produtos</h2>
        <div
          v-if="products.length"
          class="product-grid"
        >
          <article
            v-for="product in products"
            :key="product.id"
            class="product-card"
          >
            <img
              v-if="imageUrl(product.image_path)"
              :src="imageUrl(product.image_path) || undefined"
              :alt="product.name"
            />
            <div class="product-card-body">
              <h2>{{ product.name }}</h2>
              <p>{{ product.description || 'Produto do Casal de Lupa.' }}</p>
              <strong>{{ money.format(product.price_cents / 100) }} / {{ product.unit }}</strong>
            </div>
          </article>
        </div>
        <p
          v-else
          class="empty-state"
        >
          O catálogo estará disponível em breve.
        </p>
      </section>
    </main>
  </div>
</template>
