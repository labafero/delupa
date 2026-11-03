# Delupa

Monorepo Nuxt do Casal de Lupa.

## Aplicações

- `apps/web`: experiência pública em `delupa.labafero.com`.
- `apps/admin`: painel dos operadores em `admin.delupa.labafero.com`.
- `supabase`: configuração local, migrations e seeds do backend compartilhado.

Cada app é um projeto Vercel separado, ligado ao mesmo repositório e configurado com `apps/web` ou `apps/admin` como diretório raiz. Associe `delupa.labafero.com` ao projeto público e `admin.delupa.labafero.com` ao projeto admin. As duas aplicações usam o mesmo projeto Supabase; autorização deve ser aplicada no backend com políticas RLS.

## Desenvolvimento local

Requisitos: Node.js 24, pnpm 11.1.3 e Docker compatível com a Supabase CLI.

```bash
pnpm install
pnpm supabase:start
pnpm supabase:env
pnpm dev:web
pnpm dev:admin
```

Os apps rodam em `http://localhost:3000` e `http://localhost:3001`. `pnpm supabase:env` copia somente a URL e a chave pública da stack local para os arquivos `.env` ignorados pelo Git. Cadastre os mesmos domínios locais e de produção nas configurações de redirect do Supabase Auth quando o fluxo de autenticação for implementado.

Verificações disponíveis:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm build
```
