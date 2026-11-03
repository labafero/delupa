<script setup lang="ts">
import type { Database } from '@delupa/database/types'

definePageMeta({ middleware: 'client-auth' })

useSeoMeta({ title: 'Minha conta | Delupa', robots: 'noindex, nofollow' })

const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const orders = ref<
  {
    id: string
    status: string
    payment_status: string
    fulfillment: string
    delivery_address: string | null
    pickup_location: string | null
    total_cents: number
    pickup_code: string
    created_at: string
    items: {
      id: string
      product_name: string
      quantity: number
      unit: string
      line_total_cents: number
    }[]
  }[]
>([])
const statusNames: Record<string, string> = {
  awaiting_payment: 'Aguardando pagamento',
  paid: 'Pago',
  preparing: 'Em preparação',
  out_for_delivery: 'Em entrega',
  awaiting_pickup: 'Aguardando retirada',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado'
}
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

onMounted(async () => {
  const { data: orderData } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  const records = orderData || []
  const { data: itemData } = records.length
    ? await supabase
        .from('order_items')
        .select('*')
        .in(
          'order_id',
          records.map((order) => order.id)
        )
    : { data: [] }
  orders.value = records.map((order) => ({
    ...order,
    items: (itemData || []).filter((item) => item.order_id === order.id)
  }))
})

async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (!error) await navigateTo('/')
}
</script>

<template>
  <div>
    <header class="topbar">
      <NuxtLink to="/">Delupa</NuxtLink>
      <button
        class="text-button"
        @click="signOut"
      >
        Sair
      </button>
    </header>
    <main class="page-shell">
      <section class="content-card">
        <h1>Minha conta</h1>
        <p>Conectado como {{ user?.email }}.</p>
        <h2>Meus pedidos</h2>
        <article
          v-for="order in orders"
          :key="order.id"
          class="content-card"
        >
          <h3>
            {{ statusNames[order.status] || order.status }} ·
            {{ money.format(order.total_cents / 100) }}
          </h3>
          <p>
            {{ order.fulfillment === 'delivery' ? 'Entrega' : 'Retirada / encontro' }} · Código
            {{ order.pickup_code }}
          </p>
          <p v-if="order.delivery_address || order.pickup_location">
            {{ order.delivery_address || order.pickup_location }}
          </p>
          <ul>
            <li
              v-for="item in order.items"
              :key="item.id"
            >
              {{ item.quantity }} × {{ item.product_name }} ({{ item.unit }}) ·
              {{ money.format(item.line_total_cents / 100) }}
            </li>
          </ul>
        </article>
        <p v-if="orders.length === 0">Seus pedidos aparecerão aqui quando forem registrados.</p>
      </section>
    </main>
  </div>
</template>
