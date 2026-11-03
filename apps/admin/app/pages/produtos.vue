<script setup lang="ts">
import type { Database } from '@delupa/database/types'

type Product = {
  id: string
  name: string
  description: string
  price_cents: number
  unit: string
  quantity_available: number
  online_limit: number
  image_path: string | null
  status: 'active' | 'archived'
}

const supabase = useSupabaseClient<Database>()
const products = ref<Product[]>([])
const selectedId = ref<string | null>(null)
const name = ref('')
const description = ref('')
const price = ref('')
const cost = ref('')
const unit = ref('unidade')
const stock = ref('0')
const limit = ref('2')
const status = ref<'active' | 'archived'>('active')
const image = ref<File | null>(null)
const message = ref('')
const pending = ref(false)
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

async function loadProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    message.value = 'Não foi possível carregar os produtos.'
    return
  }
  products.value = (data || []) as Product[]
}

function resetForm() {
  selectedId.value = null
  name.value = ''
  description.value = ''
  price.value = ''
  cost.value = ''
  unit.value = 'unidade'
  stock.value = '0'
  limit.value = '2'
  status.value = 'active'
  image.value = null
}

async function editProduct(product: Product) {
  selectedId.value = product.id
  name.value = product.name
  description.value = product.description
  price.value = (product.price_cents / 100).toFixed(2)
  unit.value = product.unit
  stock.value = String(product.quantity_available)
  limit.value = String(product.online_limit)
  status.value = product.status
  image.value = null
  const { data } = await supabase
    .from('product_private')
    .select('acquisition_cost_cents')
    .eq('product_id', product.id)
    .maybeSingle()
  cost.value = data ? (data.acquisition_cost_cents / 100).toFixed(2) : '0.00'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function saveProduct() {
  message.value = ''
  pending.value = true
  let imagePath = selectedId.value
    ? products.value.find((product) => product.id === selectedId.value)?.image_path || null
    : null

  if (image.value) {
    const path = `${crypto.randomUUID()}/${Date.now()}-${image.value.name.replace(/[^\w.-]/g, '-')}`
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, image.value, { upsert: false })
    if (uploadError) {
      message.value = 'Não foi possível enviar a foto.'
      pending.value = false
      return
    }
    imagePath = path
  }

  const productValues = {
    name: name.value.trim(),
    description: description.value.trim(),
    price_cents: Math.round(Number(price.value.replace(',', '.')) * 100),
    unit: unit.value.trim(),
    quantity_available: Number(stock.value),
    online_limit: Number(limit.value),
    image_path: imagePath,
    status: status.value
  }

  const result = selectedId.value
    ? await supabase
        .from('products')
        .update(productValues)
        .eq('id', selectedId.value)
        .select('id')
        .single()
    : await supabase.from('products').insert(productValues).select('id').single()

  if (result.error || !result.data) {
    message.value = 'Não foi possível salvar o produto. Verifique os valores informados.'
    pending.value = false
    return
  }

  const productId = result.data.id
  const { error: costError } = await supabase.from('product_private').upsert({
    product_id: productId,
    acquisition_cost_cents: Math.round(Number(cost.value.replace(',', '.')) * 100)
  })
  pending.value = false
  if (costError) {
    message.value = 'Produto salvo, mas não foi possível salvar o custo privado.'
    return
  }

  message.value = 'Produto salvo.'
  resetForm()
  await loadProducts()
}

async function archiveProduct(product: Product) {
  const { error } = await supabase
    .from('products')
    .update({ status: 'archived' })
    .eq('id', product.id)
  message.value = error ? 'Não foi possível arquivar o produto.' : 'Produto arquivado.'
  await loadProducts()
}

onMounted(loadProducts)
</script>

<template>
  <div>
    <header class="topbar">
      <NuxtLink to="/">Delupa · Administração</NuxtLink>
      <nav class="topbar-actions">
        <NuxtLink to="/pedidos">Pedidos</NuxtLink>
        <NuxtLink to="/login">Conta</NuxtLink>
      </nav>
    </header>
    <main class="page-shell stack">
      <section class="content-card">
        <div class="section-heading">
          <div>
            <h1>Produtos</h1>
            <p class="muted">O custo de aquisição só fica disponível para administradores.</p>
          </div>
          <NuxtLink to="/">Voltar ao painel</NuxtLink>
        </div>
        <form
          class="form-stack"
          @submit.prevent="saveProduct"
        >
          <h2>{{ selectedId ? 'Editar produto' : 'Novo produto' }}</h2>
          <div class="form-grid">
            <label class="form-field">
              Nome
              <input
                v-model="name"
                maxlength="120"
                required
              />
            </label>
            <label class="form-field">
              Unidade
              <input
                v-model="unit"
                maxlength="24"
                placeholder="unidade, kg, pacote"
                required
              />
            </label>
            <label class="form-field">
              Preço público (R$)
              <input
                v-model="price"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </label>
            <label class="form-field">
              Custo de aquisição (R$)
              <input
                v-model="cost"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </label>
            <label class="form-field">
              Estoque disponível
              <input
                v-model="stock"
                type="number"
                min="0"
                step="1"
                required
              />
            </label>
            <label class="form-field">
              Limite por pedido online
              <input
                v-model="limit"
                type="number"
                min="1"
                step="1"
                required
              />
            </label>
            <label class="form-field">
              Estado
              <select v-model="status">
                <option value="active">Ativo</option>
                <option value="archived">Arquivado</option>
              </select>
            </label>
            <label class="form-field">
              Foto opcional
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="image = ($event.target as HTMLInputElement).files?.[0] || null"
              />
              <small>JPG, PNG ou WebP, até 5 MB.</small>
            </label>
          </div>
          <label class="form-field">
            Descrição
            <textarea
              v-model="description"
              rows="3"
            />
          </label>
          <p
            v-if="message"
            class="form-message"
            role="status"
          >
            {{ message }}
          </p>
          <div class="topbar-actions">
            <button
              type="submit"
              :disabled="pending"
            >
              {{ pending ? 'Salvando…' : 'Salvar produto' }}
            </button>
            <button
              v-if="selectedId"
              class="button-secondary"
              type="button"
              @click="resetForm"
            >
              Cancelar edição
            </button>
          </div>
        </form>
      </section>

      <section class="content-card">
        <h2>Catálogo</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Limite</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in products"
                :key="product.id"
              >
                <td>
                  <strong>{{ product.name }}</strong>
                  <br />
                  <span class="muted">{{ product.unit }}</span>
                </td>
                <td>{{ money.format(product.price_cents / 100) }}</td>
                <td>{{ product.quantity_available }}</td>
                <td>{{ product.online_limit }}</td>
                <td>{{ product.status === 'active' ? 'Ativo' : 'Arquivado' }}</td>
                <td>
                  <div class="topbar-actions">
                    <button
                      class="button-secondary"
                      @click="editProduct(product)"
                    >
                      Editar
                    </button>
                    <button
                      v-if="product.status === 'active'"
                      class="button-secondary danger"
                      @click="archiveProduct(product)"
                    >
                      Arquivar
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="products.length === 0">
                <td
                  colspan="6"
                  class="muted"
                >
                  Nenhum produto cadastrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>
