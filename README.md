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

Os apps rodam em `http://localhost:3000` e `http://localhost:3001`. `pnpm supabase:env` copia somente a URL e a chave pública da stack local para os arquivos `.env` ignorados pelo Git. Os callbacks locais e de produção já estão listados em `supabase/config.toml`.

## Acesso administrativo

O cadastro público cria apenas usuários `client`. Convites e recuperação de senha levam a uma tela do app para definir uma senha; não é preciso editar credenciais no painel do Supabase. Para promover uma conta existente, confirme primeiro que o e-mail já pertence à pessoa autorizada e execute no SQL Editor do Supabase:

```sql
UPDATE public.user_roles AS roles
SET role = 'admin'
FROM auth.users AS users
WHERE roles.user_id = users.id
  AND lower(users.email) = lower('admin@example.com');
```

O custo de aquisição dos produtos fica em `product_private`, separado do catálogo público. Pedidos são criados pelo painel, guardam snapshots dos itens e têm histórico de status; checkout e reserva de estoque ainda não estão habilitados.

## SEO e indexação

O app público estende `packages/seo`, baseado em `@nuxtjs/seo`, como no monorepo VPN. O site define URL canônica, título, descrição em pt-BR, metadados Open Graph/Twitter, `robots.txt` e `sitemap.xml`. Só páginas públicas devem ser indexáveis; login, cadastro, conta, callback e definição de senha são excluídos do índice e do sitemap. O app administrativo envia `noindex, nofollow` em todas as rotas.

Em desenvolvimento e em previews, a configuração do site desativa indexação para evitar duplicatas. Depois de iniciar `pnpm dev:web`, confira `/robots.txt`, `/sitemap.xml` e as tags de `<head>` da página inicial. O domínio de produção é `https://delupa.labafero.com`.

Verificações disponíveis:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm build
```
