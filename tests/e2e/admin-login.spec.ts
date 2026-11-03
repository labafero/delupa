import { expect, test } from '@playwright/test'

test('admin login is available to unauthenticated operators', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: 'Entrar no painel' })).toBeVisible()
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.getByLabel('Senha')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeEnabled()
})
