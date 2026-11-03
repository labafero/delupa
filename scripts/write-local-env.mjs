import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const status = execFileSync('pnpm', ['exec', 'supabase', 'status', '-o', 'env'], {
  encoding: 'utf8'
})

const values = Object.fromEntries(
  status
    .split(/\r?\n/)
    .filter((line) => line.includes('='))
    .map((line) => {
      const separator = line.indexOf('=')
      return [line.slice(0, separator), line.slice(separator + 1).replace(/^['"]|['"]$/g, '')]
    })
)

if (!values.API_URL || !values.ANON_KEY) {
  throw new Error('Supabase local API URL or anon key is missing. Start the local stack first.')
}

const contents = `NUXT_PUBLIC_SUPABASE_URL=${values.API_URL}\nNUXT_PUBLIC_SUPABASE_KEY=${values.ANON_KEY}\n`

for (const app of ['web', 'admin']) {
  writeFileSync(new URL(`../apps/${app}/.env`, import.meta.url), contents, { mode: 0o600 })
}

console.log('Local Supabase environment written to apps/web/.env and apps/admin/.env.')
