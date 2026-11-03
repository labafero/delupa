const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
const isDevelopment = env?.NODE_ENV === 'development'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxtjs/supabase'],
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      webUrl:
        env?.NUXT_PUBLIC_WEB_URL ||
        (isDevelopment ? 'http://localhost:3000' : 'https://delupa.labafero.com')
    }
  },
  vite: {
    server: {
      hmr: {
        port: 24699
      }
    }
  },
  routeRules: {
    '/definir-senha': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } }
  },
  compatibilityDate: '2026-11-03',
  supabase: {
    redirect: false,
    types: false
  }
})
