import { expect, test } from '@playwright/test'

test('admin login is available to unauthenticated operators', async ({ page }) => {
  const response = await page.goto('/login')

  await expect(page.getByRole('heading', { name: 'Entrar no painel' })).toBeVisible()
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.getByLabel('Senha')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeEnabled()
  await expect(
    page.getByRole('button', { name: 'Esqueci ou ainda não defini minha senha' })
  ).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow')
})
