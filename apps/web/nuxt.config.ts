export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxtjs/supabase'],
  devtools: { enabled: false },
  compatibilityDate: '2026-11-03',
  supabase: {
    redirect: false,
    types: false
  }
})
