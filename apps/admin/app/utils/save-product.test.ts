import { describe, expect, it, vi } from 'vitest'
import { moneyToCents, saveProduct } from './save-product'

describe('moneyToCents', () => {
  it('converts numeric input values into cents', () => {
    expect(moneyToCents(12)).toBe(1200)
  })
})

describe('saveProduct', () => {
  it('releases the pending state when the product request rejects', async () => {
    const setPending = vi.fn()
    const setStep = vi.fn()
    const productRequest = vi.fn().mockRejectedValue(new Error('network unavailable'))

    const message = await saveProduct(
      {
        selectedId: null,
        image: null,
        values: {
          name: 'Pão',
          description: '',
          price_cents: 1200,
          unit: 'unidade',
          quantity_available: 5,
          online_limit: 2,
          image_path: null,
          status: 'active'
        },
        acquisitionCostCents: 800
      },
      {
        setPending,
        setStep,
        uploadImage: vi.fn(),
        saveProduct: productRequest,
        saveCost: vi.fn(),
        resetForm: vi.fn(),
        reloadProducts: vi.fn()
      }
    )

    expect(message).toContain('Salvando produto')
    expect(message).toContain('network unavailable')
    expect(setPending).toHaveBeenNthCalledWith(1, true)
    expect(setPending).toHaveBeenLastCalledWith(false)
    expect(setStep).toHaveBeenLastCalledWith('')
  })
})
