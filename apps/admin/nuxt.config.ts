export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxtjs/supabase'],
  devtools: { enabled: false },
  vite: {
    server: {
      hmr: {
        port: 24699
      }
    }
  },
  compatibilityDate: '2026-11-03',
  supabase: {
    redirect: false,
    types: false
  }
})
