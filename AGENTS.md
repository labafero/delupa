# Diretrizes do Repositório

## Estrutura do Projeto e Organização dos Módulos

O monorepo usa `apps/web` para a experiência pública, `apps/admin` para as ferramentas dos operadores e `supabase/` para configuração local, migrations e seeds. Pacotes compartilhados futuros ficam em `packages/`; crie-os quando houver contratos ou lógica usados por ambos os apps.

## Comandos de Desenvolvimento, Build e Testes

Use Node.js 24 e pnpm 11.1.3. A partir da raiz, `pnpm dev:web` inicia o app público, `pnpm dev:admin` inicia o painel, `pnpm supabase:start` inicia o backend local, `pnpm supabase:env` grava as credenciais públicas locais nos `.env` ignorados e `pnpm supabase:stop` encerra a stack. `pnpm lint`, `pnpm format:check`, `pnpm typecheck` e `pnpm build` executam as verificações dos workspaces.

## Estilo de Código e Convenções de Nomenclatura

Use ESLint e Prettier com a configuração da raiz: dois espaços, aspas simples, sem ponto e vírgula e sem vírgula final. Os apps são pacotes independentes (`@delupa/web` e `@delupa/admin`). Escreva a interface em português brasileiro e explique com clareza os estados e as permissões de compartilhamento de localização.

## Diretrizes de Testes

O framework de testes ainda não foi escolhido. Ao adicionar testes, priorize início e pausa explícitos do compartilhamento de localização, estados de localização desatualizada ou indisponível e exibição da agenda; documente aqui o comando e os serviços necessários.

## Segurança e Configuração

Trate as coordenadas dos operadores e os locais de entrega dos clientes como dados sensíveis. Não envie credenciais ao repositório nem exponha segredos no código do cliente; use variáveis de ambiente para chaves de serviços. Exija uma ação explícita do operador antes de publicar a localização e restrinja operações de escrita do admin a operadores autenticados.

## Commits e Pull Requests

Escreva mensagens de commit curtas e no imperativo (por exemplo, `Adiciona estado de localização desatualizada`). Pull requests devem explicar a mudança, listar verificações, vincular requisitos ou issues e incluir capturas móveis para alterações visuais. Destaque mudanças que afetem privacidade da localização, permissões ou pedidos.
