import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
        url: 'http://localhost:3001/login',
        overrides: {
          runtimeConfig: {
            public: {
              supabase: {
                url: 'http://127.0.0.1:54331',
                key: 'test-anon-key'
              }
            }
          }
        }
      }
    },
    include: ['app/**/*.component.test.ts']
  }
})
