const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
const isDevelopment = env?.NODE_ENV === 'development'
const siteUrl =
  env?.NUXT_SITE_URL || (isDevelopment ? 'http://localhost:3000' : 'https://delupa.labafero.com')

export default defineNuxtConfig({
  extends: ['../../packages/seo'],
  modules: ['@nuxt/eslint', '@nuxtjs/supabase'],
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  site: {
    url: siteUrl,
    name: 'Delupa',
    description: 'Encontre o Casal de Lupa na orla de Maceió e confira os produtos disponíveis.',
    defaultLocale: 'pt_BR',
    env: env?.VERCEL_ENV || (isDevelopment ? 'development' : 'production')
  },
  runtimeConfig: {
    public: {
      siteUrl,
      adminUrl:
        env?.NUXT_PUBLIC_ADMIN_URL ||
        (isDevelopment ? 'http://localhost:3001' : 'https://admin.delupa.labafero.com')
    }
  },
  routeRules: {
    '/login': { robots: false },
    '/cadastro': { robots: false },
    '/minha-conta': { robots: false },
    '/auth/callback': { robots: false },
    '/definir-senha': { robots: false }
  },
  compatibilityDate: '2026-11-03',
  supabase: {
    redirect: false,
    types: false
  }
})
