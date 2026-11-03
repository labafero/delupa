export type ProductValues = {
  name: string
  description: string
  price_cents: number
  unit: string
  quantity_available: number
  online_limit: number
  image_path: string | null
  status: 'active' | 'archived'
}

type Result<T> = {
  data: T | null
  error: { message: string } | null
}

type SaveProductInput = {
  selectedId: string | null
  image: File | null
  values: ProductValues
  acquisitionCostCents: number
}

type SaveProductDependencies = {
  setPending: (pending: boolean) => void
  setStep: (step: string) => void
  uploadImage: (image: File) => Promise<Result<string>>
  saveProduct: (id: string | null, values: ProductValues) => Promise<Result<{ id: string }>>
  saveCost: (id: string, amount: number) => Promise<Result<unknown>>
  resetForm: () => void
  reloadProducts: () => Promise<void>
  onException?: (error: unknown) => void
}

export function moneyToCents(value: string | number): number {
  return Math.round(Number(String(value).replace(',', '.')) * 100)
}

export async function saveProduct(
  input: SaveProductInput,
  dependencies: SaveProductDependencies
): Promise<string> {
  let step = ''
  dependencies.setPending(true)

  try {
    const values = { ...input.values }

    if (input.image) {
      step = 'Enviando foto'
      dependencies.setStep(step)
      const upload = await dependencies.uploadImage(input.image)
      if (upload.error || !upload.data) {
        return `Falha ao enviar a foto: ${upload.error?.message || 'caminho da foto vazio'}`
      }
      values.image_path = upload.data
    }

    step = 'Salvando produto'
    dependencies.setStep(step)
    const product = await dependencies.saveProduct(input.selectedId, values)
    if (product.error || !product.data) {
      return `Falha ao salvar o produto: ${product.error?.message || 'o Supabase não retornou o produto salvo.'}`
    }

    step = 'Salvando custo privado'
    dependencies.setStep(step)
    const cost = await dependencies.saveCost(product.data.id, input.acquisitionCostCents)
    if (cost.error) {
      return `Produto criado, mas o custo privado não foi salvo: ${cost.error.message}`
    }

    dependencies.resetForm()
    await dependencies.reloadProducts()
    return 'Produto salvo.'
  } catch (error) {
    dependencies.onException?.(error)
    const detail = error instanceof Error ? error.message : 'erro inesperado'
    return `Falha durante “${step || 'salvamento'}”: ${detail}`
  } finally {
    dependencies.setPending(false)
    dependencies.setStep('')
  }
}
