# Estratégia de testes

Seguimos uma pirâmide: muitos testes unitários, alguns testes de integração e poucos testes de ponta a ponta. Os testes automatizados devem evitar produção e usar dados e serviços locais ou simulados.

## Unitários

`pnpm test` executa Vitest para regras puras, como papéis, caminhos de retorno, redirecionamento de recuperação de senha, conversão de valores e o fluxo de persistência de produtos. Rode `pnpm exec vitest` para manter o runner em modo watch. Esses testes não exigem Supabase nem navegador.

## Integração

Os testes de componente do admin usam `@nuxt/test-utils`, Vitest e `happy-dom`. Eles montam a página Nuxt real e simulam a fronteira Supabase, verificando estados e mensagens da interface. Execute apenas essa camada com `pnpm --filter @delupa/admin test:integration`; ela também faz parte de `pnpm test`.

Para políticas RLS e migrations, use o Supabase local e acrescente testes de banco com `supabase test db`. Esses testes devem validar acesso de `admin` e `client` sem consultar o projeto remoto.

## Ponta a ponta

Os testes Playwright cobrem poucos caminhos críticos no navegador real, incluindo metadados da página pública, entrada/recuperação de senha e `noindex` do painel. Inicie `pnpm dev:web` e `pnpm dev:admin` em terminais separados; em seguida rode `pnpm test:e2e`. CI inicia os dois apps e instala Chromium automaticamente antes dessa etapa.

Quando adicionar cobertura, prefira testar regras na camada mais rápida que represente o comportamento. Reserve E2E para fluxos que dependem da integração entre tela, roteamento e navegador.
