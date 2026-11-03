import { expect, test } from '@playwright/test'

test('public home page exposes Portuguese search and sharing metadata', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveTitle('Casal de Lupa na orla de Maceió | Delupa')
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Encontre o Casal de Lupa na orla de Maceió e confira cervejas, mangas e outros produtos disponíveis.'
  )
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'http://localhost:3000'
  )
})

test('public login offers password recovery', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/login')

  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Esqueci minha senha' })).toBeVisible()
})
