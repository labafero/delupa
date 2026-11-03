const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
const isDevelopment = env?.NODE_ENV === 'development'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxtjs/supabase'],
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      adminUrl:
        env?.NUXT_PUBLIC_ADMIN_URL ||
        (isDevelopment ? 'http://localhost:3001' : 'https://admin.delupa.labafero.com')
    }
  },
  compatibilityDate: '2026-11-03',
  supabase: {
    redirect: false,
    types: false
  }
})
