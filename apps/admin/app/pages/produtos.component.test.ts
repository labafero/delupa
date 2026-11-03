import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductsPage from './produtos.vue'

const { useSupabaseClientMock } = vi.hoisted(() => ({
  useSupabaseClientMock: vi.fn()
}))

mockNuxtImport('useSupabaseClient', () => useSupabaseClientMock)

describe('admin product form', () => {
  beforeEach(() => {
    useSupabaseClientMock.mockReset()
  })

  it('shows the failed request and re-enables save after a network exception', async () => {
    let rejectRequest: (error: Error) => void = () => {}
    const productRequest = new Promise<never>((_resolve, reject) => {
      rejectRequest = reject
    })
    const query = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn(() => productRequest)
    }
    useSupabaseClientMock.mockReturnValue({
      from: vi.fn(() => query),
      storage: { from: vi.fn() }
    })

    const wrapper = await mountSuspended(ProductsPage, { route: false })
    await flushPromises()
    await wrapper.get('input[required]').setValue('Pão caseiro')
    const numericFields = wrapper.findAll('input[type="number"]')
    await numericFields[0]!.setValue('12')
    await numericFields[1]!.setValue('8')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('button[type="submit"]').text()).toContain('Salvando produto…')
    rejectRequest(new Error('network unavailable'))
    await flushPromises()

    expect(wrapper.get('[role="status"]').text()).toContain('network unavailable')
    expect(wrapper.get('button[type="submit"]').text()).toBe('Salvar produto')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })
})
