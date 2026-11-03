<script setup lang="ts">
import type { Database } from '@delupa/database/types'

type Profile = { user_id: string; email: string }
type Product = { id: string; name: string; unit: string; price_cents: number; status: string }
type Order = {
  id: string
  customer_id: string
  customer_email: string
  pickup_code: string
  status: Database['public']['Enums']['order_status']
  payment_method: Database['public']['Enums']['order_payment_method']
  payment_status: Database['public']['Enums']['order_payment_status']
  fulfillment: Database['public']['Enums']['order_fulfillment']
  delivery_address: string | null
  pickup_location: string | null
  delivery_instructions: string | null
  total_cents: number
  created_at: string
  items?: {
    product_name: string
    unit: string
    quantity: number
    unit_price_cents: number
    line_total_cents: number
  }[]
  email?: string
}

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const profiles = ref<Profile[]>([])
const products = ref<Product[]>([])
const orders = ref<Order[]>([])
const customerId = ref('')
const fulfillment = ref<'delivery' | 'pickup'>('pickup')
const paymentMethod = ref<Database['public']['Enums']['order_payment_method']>('manual_pix')
const fulfillmentLocation = ref('')
const instructions = ref('')
const quantities = ref<Record<string, number>>({})
const message = ref('')
const pending = ref(false)
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
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
const paymentMethods: Record<string, string> = {
  manual_pix: 'Pix manual',
  cash_at_delivery: 'Dinheiro na entrega',
  cash_at_pickup: 'Dinheiro na retirada'
}

watch(fulfillment, (value) => {
  if (value === 'delivery' && paymentMethod.value === 'cash_at_pickup') {
    paymentMethod.value = 'manual_pix'
  }
  if (value === 'pickup' && paymentMethod.value === 'cash_at_delivery') {
    paymentMethod.value = 'manual_pix'
  }
})

async function loadOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    message.value = 'Não foi possível carregar os pedidos.'
    return
  }
  const records = (data || []) as Order[]
  const ids = records.map((order) => order.id)
  let items: Database['public']['Tables']['order_items']['Row'][] = []
  if (ids.length) {
    const { data: itemData } = await supabase.from('order_items').select('*').in('order_id', ids)
    items = itemData || []
  }
  orders.value = records.map((order) => ({
    ...order,
    email: order.customer_email,
    items: (items || []).filter((item) => item.order_id === order.id)
  }))
}

async function loadFormOptions() {
  const [{ data: customerData }, { data: productData }] = await Promise.all([
    supabase.from('profiles').select('user_id,email').order('email'),
    supabase
      .from('products')
      .select('id,name,unit,price_cents,status')
      .eq('status', 'active')
      .order('name')
  ])
  profiles.value = (customerData || []) as Profile[]
  products.value = (productData || []) as Product[]
  quantities.value = Object.fromEntries(products.value.map((product) => [product.id, 0]))
}

async function createOrder() {
  message.value = ''
  const items = Object.entries(quantities.value)
    .filter(([, quantity]) => Number(quantity) > 0)
    .map(([product_id, quantity]) => ({ product_id, quantity: Number(quantity) }))
  if (!customerId.value || items.length === 0 || !fulfillmentLocation.value.trim()) {
    message.value =
      'Escolha um cliente, ao menos um produto e informe o endereço ou local combinado.'
    return
  }

  pending.value = true
  const { error } = await supabase.rpc('create_admin_order', {
    p_customer_id: customerId.value,
    p_fulfillment: fulfillment.value,
    p_payment_method: paymentMethod.value,
    p_fulfillment_location: fulfillmentLocation.value,
    p_delivery_instructions: instructions.value,
    p_items: items
  })
  pending.value = false
  if (error) {
    message.value = 'Não foi possível criar o pedido. Confira o cliente e os produtos ativos.'
    return
  }
  message.value = 'Pedido criado com preços e nomes registrados no momento do pedido.'
  fulfillmentLocation.value = ''
  instructions.value = ''
  quantities.value = Object.fromEntries(products.value.map((product) => [product.id, 0]))
  await loadOrders()
}

async function updateOrder(order: Order, field: 'status' | 'payment_status', value: string) {
  const update =
    field === 'status'
      ? { status: value as Order['status'] }
      : { payment_status: value as Order['payment_status'] }
  const { error } = await supabase
    .from('orders')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', order.id)
  message.value = error ? 'Não foi possível atualizar o pedido.' : 'Pedido atualizado.'
  await loadOrders()
}

onMounted(async () => {
  await Promise.all([loadOrders(), loadFormOptions()])
})
</script>

<template>
  <div>
    <header class="topbar">
      <NuxtLink to="/">Delupa · Administração</NuxtLink>
      <nav class="topbar-actions">
        <NuxtLink to="/produtos">Produtos</NuxtLink>
        <span class="muted">{{ user?.email }}</span>
        <NuxtLink to="/login">Conta</NuxtLink>
      </nav>
    </header>
    <main class="page-shell stack">
      <section class="content-card">
        <div class="section-heading">
          <div>
            <h1>Pedidos</h1>
            <p class="muted">
              Pedidos são registrados pelo admin nesta versão; checkout e reserva de estoque ficam
              para depois.
            </p>
          </div>
          <NuxtLink to="/">Voltar ao painel</NuxtLink>
        </div>
        <form
          class="form-stack"
          @submit.prevent="createOrder"
        >
          <h2>Novo pedido</h2>
          <div class="form-grid">
            <label class="form-field">
              Cliente
              <select
                v-model="customerId"
                required
              >
                <option
                  value=""
                  disabled
                >
                  Selecione um cliente
                </option>
                <option
                  v-for="profile in profiles"
                  :key="profile.user_id"
                  :value="profile.user_id"
                >
                  {{ profile.email }}
                </option>
              </select>
            </label>
            <label class="form-field">
              Entrega ou retirada
              <select v-model="fulfillment">
                <option value="pickup">Retirada / encontro</option>
                <option value="delivery">Entrega</option>
              </select>
            </label>
            <label class="form-field">
              Pagamento
              <select v-model="paymentMethod">
                <option value="manual_pix">Pix manual</option>
                <option
                  v-if="fulfillment === 'pickup'"
                  value="cash_at_pickup"
                >
                  Dinheiro na retirada
                </option>
                <option
                  v-if="fulfillment === 'delivery'"
                  value="cash_at_delivery"
                >
                  Dinheiro na entrega
                </option>
              </select>
            </label>
            <label class="form-field">
              {{
                fulfillment === 'delivery' ? 'Endereço de entrega' : 'Local combinado para retirada'
              }}
              <input
                v-model="fulfillmentLocation"
                required
              />
            </label>
            <label class="form-field">
              {{ fulfillment === 'delivery' ? 'Instruções de entrega' : 'Observações do local' }}
              <input v-model="instructions" />
            </label>
          </div>
          <fieldset class="form-field">
            <legend>Itens</legend>
            <p
              v-if="products.length === 0"
              class="muted"
            >
              Cadastre um produto ativo antes de criar pedidos.
            </p>
            <div
              v-for="product in products"
              :key="product.id"
              class="form-grid"
            >
              <label>
                {{ product.name }} ({{ product.unit }}) ·
                {{ money.format(product.price_cents / 100) }}
              </label>
              <label class="form-field">
                Quantidade
                <input
                  v-model.number="quantities[product.id]"
                  type="number"
                  min="0"
                  step="1"
                />
              </label>
            </div>
          </fieldset>
          <p
            v-if="message"
            class="form-message"
            role="status"
          >
            {{ message }}
          </p>
          <button
            type="submit"
            :disabled="pending"
          >
            {{ pending ? 'Criando…' : 'Criar pedido' }}
          </button>
        </form>
      </section>

      <section class="content-card">
        <h2>Pedidos recentes</h2>
        <div class="stack">
          <article
            v-for="order in orders"
            :key="order.id"
            class="content-card"
          >
            <div class="section-heading">
              <div>
                <h3>{{ order.email }} · {{ money.format(order.total_cents / 100) }}</h3>
                <p class="muted">
                  {{ new Date(order.created_at).toLocaleString('pt-BR') }} ·
                  {{ order.fulfillment === 'delivery' ? 'Entrega' : 'Retirada / encontro' }} ·
                  Código
                  {{ order.pickup_code }}
                </p>
              </div>
              <small>#{{ order.id.slice(0, 8) }}</small>
            </div>
            <ul>
              <li
                v-for="item in order.items"
                :key="`${order.id}-${item.product_name}`"
              >
                {{ item.quantity }} × {{ item.product_name }} ({{ item.unit }}) ·
                {{ money.format(item.line_total_cents / 100) }}
              </li>
            </ul>
            <p v-if="order.delivery_address || order.pickup_location">
              <strong>
                {{ order.fulfillment === 'delivery' ? 'Endereço:' : 'Local combinado:' }}
              </strong>
              {{ order.delivery_address || order.pickup_location }}
              <span v-if="order.delivery_instructions">· {{ order.delivery_instructions }}</span>
            </p>
            <div class="form-grid">
              <label class="form-field">
                Estado
                <select
                  :value="order.status"
                  @change="updateOrder(order, 'status', ($event.target as HTMLSelectElement).value)"
                >
                  <option
                    v-for="(label, key) in statusNames"
                    :key="key"
                    :value="key"
                  >
                    {{ label }}
                  </option>
                </select>
              </label>
              <label class="form-field">
                Pagamento · {{ paymentMethods[order.payment_method] }}
                <select
                  :value="order.payment_status"
                  @change="
                    updateOrder(order, 'payment_status', ($event.target as HTMLSelectElement).value)
                  "
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="failed">Falhou</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </label>
            </div>
          </article>
          <p
            v-if="orders.length === 0"
            class="muted"
          >
            Ainda não há pedidos.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>
