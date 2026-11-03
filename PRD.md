# Delupa — Product Requirements Document

**Status:** Draft v0.2  
**Data:** 3 de novembro de 2026  
**Produto:** Webapp mobile-first para encontrar o Casal de Lupa no litoral de Maceió, Alagoas  
**Público operador:** O casal, que vende cerveja, manga e sal em bicicletas de carga e promove microfestas com sets de cumbia, reggae e rock.  
**Arquitetura escolhida:** Monorepo Nuxt com app do cliente e app administrativo.

## 1. Executive Summary

**Problem Statement:** Quem quer encontrar o Casal de Lupa na orla não sabe onde eles estão naquele momento nem quando estarão em determinado trecho. O casal também precisa de um canal próprio para divulgar a agenda e os produtos, receber pedidos com reserva curta e oferecer entrega garantida quando o pedido for pago antecipadamente.

**Proposed Solution:** Criar um monorepo Nuxt com uma experiência pública mobile-first para localização, perfil, agenda e compra, além de um admin para catálogo, pedidos e operação. O cliente poderá reservar o carrinho por 10 minutos, pagar antecipadamente para receber entrega garantida ou escolher pagamento no encontro, sem garantia de entrega.

**Success Criteria — metas iniciais propostas, a validar com o casal:**

- Em teste com pelo menos 10 pessoas, 8 ou mais conseguem localizar o casal no mapa e entender se a posição está atualizada sem ajuda.
- Quando o compartilhamento estiver ativo e o navegador estiver enviando posições, pelo menos 90% das atualizações são exibidas ao público em até 30 segundos, em teste de campo com rede disponível.
- Os operadores conseguem iniciar e pausar a divulgação da localização em até 2 ações na interface.
- Pelo menos 80% dos visitantes de teste encontram a próxima parada ou evento em até 30 segundos.
- No piloto de comércio, pelo menos 95% dos carrinhos expirados liberam o estoque reservado em até 30 segundos após o prazo de 10 minutos.
- A taxa de pedidos pagos com entrega garantida concluídos até o corte de entrega configurado para o dia será medida no piloto; meta numérica **TBD** após o piloto.
- Definir, após o piloto, uma meta de adoção (visitas recorrentes, conversão de reserva ou vendas atribuídas ao app); baseline e objetivo numérico permanecem **TBD**.

## 2. User Experience & Functionality

### User Personas

- **Pessoa na praia:** Está em Maceió, quer encontrar o casal agora, conferir os produtos e saber onde/ quando será a próxima parada ou microfesta.
- **Cliente que planeja comprar:** Quer reservar produtos antes de chegar e pagar online; esse fluxo pertence à evolução de comércio após o MVP.
- **Operador(a) do Casal de Lupa:** Usa o celular enquanto circula de bicicleta para publicar/pausar a localização e manter perfil e agenda atualizados.
- **DJ/anfitrião:** Divulga microfestas e informações essenciais dos sets sem transformar o MVP numa plataforma de streaming ou rede social.

### User Stories e Acceptance Criteria

#### História 1 — Encontrar as duas pessoas agora

**Como** pessoa na praia, **quero** ver a última localização pública de cada integrante num mapa, **para** decidir como chegar até eles.

- O mapa mostra simultaneamente dois pins, um por integrante do casal, com identificação e horário da última sincronização de cada um.
- Com compartilhamento ativo, cada dispositivo sincroniza sua posição automaticamente a cada 5 minutos; cada integrante também pode forçar uma sincronização imediata no `/admin`.
- Com conexão funcional, uma posição enviada deve aparecer ao público em até 30 segundos (p90 no piloto); esse prazo mede a entrega após o envio, não a frequência de sincronização.
- Após 10 minutos sem sincronização de um pin, a interface deixa de indicá-lo como atual e mostra o horário da última posição. O limite equivale a duas janelas automáticas e pode ser ajustado no piloto.
- Se o compartilhamento estiver pausado ou a posição estiver indisponível, o app não inventa uma posição atual; pode mostrar a próxima parada publicada na agenda.
- A página continua utilizável sem permissão de localização do visitante; cada integrante publica a própria posição pelo seu dispositivo de operador.

#### História 2 — Publicar e pausar a localização

**Como** operador(a), **quero** iniciar e interromper a publicação da localização a qualquer momento, **para** controlar quando clientes podem nos encontrar.

- O modo operador exige autenticação.
- O app explica por que solicita localização e solicita permissão do navegador apenas quando o operador inicia o compartilhamento.
- Há controles visíveis para iniciar/pausar e sincronizar agora, com confirmação visual do estado e da última sincronização; não há compartilhamento público antes de uma ação explícita de início.
- Cada sessão/dispositivo de operador publica um pin próprio; pausar um integrante não apaga nem pausa automaticamente o pin do outro.
- Enquanto ativo, o dispositivo tenta sincronizar a cada 5 minutos, além de permitir envio manual imediato no `/admin`.
- Ao pausar, novas coordenadas deixam de ser exibidas como atuais. A política para apagar ou manter a última posição deve ser confirmada antes do lançamento; comportamento provisório recomendado: manter o pin como última posição, com estado pausado e horário visível.
- Erros de permissão, GPS, conexão ou bateria apresentam estado recuperável e opção de publicar manualmente uma parada/área aproximada.
- O fluxo informa que o navegador pode interromper atualizações em segundo plano; o operador deve manter o modo ativo aberto durante o uso. Compatibilidade real deve ser validada em aparelhos e navegadores escolhidos.

#### História 3 — Conhecer o casal e seus produtos

**Como** visitante, **quero** reconhecer o Casal de Lupa, entender o que vendem e consultar seus canais, **para** decidir se quero encontrá-los ou fazer um pedido.

- A página apresenta nome, descrição curta, imagem/identidade visual, produtos principais (cerveja, manga e sal) e formas de contato aprovadas pelo casal.
- Conteúdo essencial é legível em celular, com botões e textos em português brasileiro.
- O app não apresenta estoque como garantido em tempo real no MVP; quando o catálogo transacional for lançado, disponibilidade deve refletir estoque reservável.
- A página pública apresenta título, descrição e metadados de compartilhamento em português brasileiro, URL canônica e idioma `pt-BR`.
- `robots.txt` e `sitemap.xml` incluem apenas conteúdo público; login, cadastro, conta, callback e todo o painel administrativo usam `noindex`.
- Builds de preview e desenvolvimento não devem ser indexados.

#### História 4 — Consultar agenda e microfestas

**Como** visitante, **quero** ver próximas paradas e eventos, **para** planejar quando encontrá-los.

- Cada item publicado contém título, data e hora local, descrição curta e local/trecho; itens passados deixam de aparecer na seção de próximos eventos.
- O estado “sem agenda publicada” é claro e não é confundido com ausência do casal.
- A agenda pode representar microfestas e sets de cumbia, reggae e rock; informações de artistas, duração e playlist ficam a critério do casal.
- Operadores autenticados podem criar, editar, publicar e cancelar itens sem alterar código.

#### História 5 — Reservar e pagar antecipadamente (fase posterior ao MVP)

**Como** cliente, **quero** reservar produtos no carrinho por 10 minutos e pagar online, **para** receber meu pedido por entrega garantida ou combinar um encontro para retirada.

- O catálogo informa descrição, preço, disponibilidade e limite por produto; o admin pode criar, consultar, editar e arquivar produtos (CRUD básico).
- O cliente pode criar/consultar/editar/remover os itens do próprio carrinho; o prazo inicial de 10 minutos começa quando o primeiro item é adicionado. Adicionar ou remover itens depois não reinicia a contagem; o prazo restante fica visível. Esse valor fecha o escopo inicial e poderá ser revisto com base na operação.
- Ao expirar o prazo sem pagamento confirmado, o carrinho deixa de reservar estoque e o cliente precisa confirmar disponibilidade novamente.
- Para um pedido com entrega, o cliente precisa permitir acesso à localização do dispositivo para preencher o local de entrega; pode ajustar o pin e adicionar instruções de referência/contato antes de concluir.
- O pedido pago antecipadamente tem entrega garantida até o corte de entrega do dia: se a bicicleta/transporte do casal ficar indisponível, o casal providencia e paga meio alternativo (por exemplo, mototáxi ou Uber), sem cobrar taxa de entrega do cliente. O admin configura por dia o corte (geralmente às 18h) e a distância máxima em quilômetros. A área é aberta dentro desse raio, medido desde a posição publicada mais recente do casal no instante em que o cliente envia o pedido; guardar essa posição como referência do pedido.
- Não há cobrança de entrega. A rota é definida durante a operação, pode mudar e não é prometido um horário exato de chegada; o app informa o corte de entrega daquele dia e o estado do pedido.
- A retirada/encontro pode acontecer num ponto diferente do pin do casal ou no caminho. O app gera um código único do pedido para o cliente se identificar; o operador valida esse código antes de marcar a entrega/retirada como concluída.
- Um pedido com pagamento no encontro/local não inclui garantia de entrega; o app informa claramente a modalidade, local combinado e essa condição antes da confirmação.
- O cliente pode escolher checkout online por provedor de pagamento aprovado ou Pix manual fornecido pelo casal a partir de sua própria conta bancária. No Pix manual, o pedido fica pendente até confirmação do operador; comprovante enviado pelo cliente, se aceito, não substitui a verificação do recebimento.
- O total dos produtos e eventuais taxas do provedor de pagamento repassadas ao cliente deve ser exibido antes da confirmação; não há taxa de entrega. O app não armazena dados de cartão; o provedor escolhido processa esse pagamento.
- O admin pode consultar pedidos, confirmar manualmente Pix após verificação no banco, atualizar estados de preparo, entrega, cancelamento e reembolso e consultar o código de retirada.
- Estados mínimos: carrinho reservado, aguardando pagamento, pago, em preparação, em entrega/aguardando encontro, concluído, expirado, cancelado e reembolsado.
- O limite online inicial é de até 2 cervejas por cadastro/pessoa; limites são configuráveis por produto. A janela de aplicação do limite (por pedido, dia ou período) e como identificar uma pessoa entre cadastros são **TBD**. A regra limita pedidos online e não restringe a venda presencial.
- O Pix manual não estende a reserva: se não houver confirmação do pagamento dentro dos 10 minutos iniciais, o carrinho expira e o estoque é liberado. O prazo pode ser revisto depois do piloto. Taxas do provedor, reembolso, emissão fiscal e regras de venda de bebidas alcoólicas devem ser definidas antes desta fase.

#### História 6 — Operar catálogo e pedidos (fase posterior ao MVP)

**Como** operador(a), **quero** gerenciar produtos e pedidos num admin, **para** controlar preço, estoque, reservas, pagamentos e entregas.

- Admin autenticado permite CRUD básico de produtos e consulta/atualização de pedidos conforme permissões.
- Convites, cadastro e recuperação de acesso permitem definir ou redefinir a senha dentro do app; rotas de autenticação não são indexáveis.
- Produto contém nome, descrição, preço público, custo de aquisição privado, quantidade disponível, limite online e estado ativo/arquivado.
- O admin consegue atualizar custo de aquisição e preço de venda para comprar em atacado, manter margem e repassar preços menores ao cliente; custo e margem nunca aparecem no app público.
- Atualizações de preço/estoque não alteram silenciosamente um pedido já pago; tratamento para carrinho ainda reservado é informado ao cliente e definido antes do lançamento.
- O sistema registra histórico mínimo de mudanças de estado e identifica o operador que confirmou pagamento manual ou entrega.
- Operadores podem marcar indisponibilidade, propor substituição/reembolso e contatar o cliente por canal definido (**TBD**).

### User Flow principal do MVP

1. Visitante abre link/QR code do Delupa.
2. Vê o estado da localização, mapa e horário da última atualização.
3. Abre perfil para conferir produtos e identidade do casal.
4. Consulta agenda e escolhe uma parada ou microfesta.
5. Usa o pin como referência e, se quiser, abre o local em seu aplicativo de mapas; pode combinar um ponto de encontro diferente.

**Fluxo operador:** autenticar → iniciar compartilhamento → confirmar estado ativo → consultar/editar agenda → pausar compartilhamento quando desejar.

**Fluxo de compra v1.1:** consultar catálogo → adicionar o primeiro item (inicia a reserva inicial de 10 minutos, sem prorrogação por Pix manual) → escolher entrega ou encontro/retirada → permitir localização para entrega e ajustar pin/instruções → escolher pagamento integrado ou Pix manual → receber código único → acompanhar estado até entrega/retirada. Para entrega garantida no dia, o sistema usa o corte e a distância máxima daquele dia, calculada desde a última posição publicada do casal quando o pedido é enviado. Não há taxa de entrega nem previsão exata de chegada.

### Non-Goals

- App nativo para iOS/Android no MVP; o primeiro lançamento é webapp mobile-first.
- Garantir rastreamento em segundo plano contínuo em todos os celulares usando somente navegador.
- Plataforma pública de streaming, hospedagem ou reprodução de música; qualquer integração de áudio/licenciamento requer definição própria.
- Rede social, feed, comentários, chat aberto ou sistema de seguidores.
- Gestão completa de estoque, ERP, contabilidade, emissão fiscal ou logística de entrega própria no MVP.
- Prometer precisão de GPS ou disponibilidade de rede que o dispositivo e a operadora não controlam.
- Publicar a localização dos operadores quando eles pausarem o compartilhamento.

## 3. AI System Requirements

Não há funcionalidade de IA prevista no MVP ou nas fases aqui descritas. Não são necessários modelos, ferramentas de IA ou avaliações de qualidade de IA.

## 4. Technical Specifications

### Architecture Overview

Proposta lógica: monorepo Nuxt com duas aplicações e módulos compartilhados; banco, hospedagem e serviços gerenciados continuam **TBD**.

1. **`apps/client`:** Nuxt para mapa, estado de atualização, perfil, agenda, catálogo, carrinho, checkout e consulta de pedido.
2. **`apps/admin`:** Nuxt autenticado para localização, agenda, CRUD de produtos, consulta/atualização de pedidos, pagamentos e entrega.
3. **Módulos compartilhados:** tipos, validações, componentes e regras de domínio comuns às duas aplicações, sem duplicar regras de preço, limite e reserva.
4. **API/backend:** autenticação, autorização, localização, agenda, catálogo, carrinho, bloqueio temporário de estoque, pedidos e estados de pagamento; canal em tempo real para atualizações de localização.
5. **Persistência:** última posição e horário de sincronização por integrante, perfil/agenda, produtos, estoque, carrinhos com expiração, pedidos e histórico mínimo operacional. Histórico de trilha GPS não é requisito.
6. **Mapa:** camada OpenStreetMap ou baseada em dados OSM para ilustração; o pin pode abrir aplicativo de mapas nativo ou Google Maps. A navegação é opcional, pois cliente e casal podem se encontrar no caminho.
7. **Pagamentos:** adaptador para provedor online selecionado e fluxo manual de Pix; confirmação via webhook assinado para provedor, confirmação administrativa para Pix manual e operações idempotentes.
8. **SEO técnico:** camada compartilhada `packages/seo` com `@nuxtjs/seo`, configuração de domínio/idioma e metadados da página pública; páginas de autenticação e administração não são indexáveis.

A localização do casal vem do dispositivo operador; o visitante não precisa compartilhar sua própria localização para consultar o mapa. A Geolocation API depende de contexto seguro (HTTPS) e permissão explícita do usuário. A atualização contínua usa `watchPosition`, mas o comportamento em segundo plano varia conforme navegador e sistema; isso é uma limitação central do produto web e precisa ser testada em campo. Consulte [MDN — Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) e [MDN — watchPosition](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition).

### Integration Points

- **Mapa ilustrativo:** OpenStreetMap ou provedor compatível com dados OSM, com atribuição visível. Se usar os tiles públicos padrão do OSM, obedecer à política de uso, cache e identificação; manter provedor/camada substituível e avaliar tiles hospedados se o volume comercial crescer, pois os serviços públicos são best-effort e podem bloquear uso inadequado. [Política oficial de tiles do OSM](https://operations.osmfoundation.org/policies/tiles/).
- **Abrir rota externa:** links para aplicativo de mapas nativo ou Google Maps; destino baseado no pin público ou no ponto de entrega combinado.
- **Autenticação de operadores:** mecanismo a selecionar (**TBD**); limitar acesso de edição ao casal.
- **Tempo real:** canal de eventos do backend; provedor/implementação (**TBD**).
- **Pagamentos:** integração web selecionada por disponibilidade, reputação/comunidade e custo, com eventuais taxas do provedor apresentadas ao cliente; Pix manual gerado pelo casal no próprio banco como alternativa. Provedor, métodos PIX/cartão, tarifas, estorno e conciliação permanecem **TBD**. Não cobrar taxa de entrega.
- **Analytics:** eventos mínimos de visualização de mapa, perfil e agenda, sem coletar localização do visitante por padrão; ferramenta e retenção **TBD**.
- **QR code/link curto:** distribuição em materiais físicos e redes sociais; domínio final **TBD**.

### Security & Privacy

- Tratar coordenadas e histórico de deslocamento como dados pessoais de alto impacto operacional; documentar finalidade, acesso, retenção e descarte antes de produção.
- Solicitar permissão e iniciar compartilhamento somente após ação explícita do operador; oferecer pausa imediata na interface.
- Mostrar claramente quando a posição está ativa e quando foi atualizada pela última vez.
- Proteger modo operador com autenticação, autorização por função e proteção contra acesso não autorizado a endpoints de escrita.
- Usar HTTPS, controle de acesso no backend, segredos fora do cliente e logs sem coordenadas precisas sempre que possível.
- Coletar o mínimo de dados de clientes necessário para agenda, reservas e atendimento. Solicitar geolocalização do cliente apenas ao preencher pedido que exige local de entrega; explicar o uso, enviar somente a localização necessária ao pedido e definir retenção/acesso antes do lançamento. Não coletar localização contínua dos visitantes.
- Definir retenção curta para coordenadas; apagar ou anonimizar posições antigas conforme política aprovada. Período exato **TBD**.
- Publicar aviso de privacidade e canal para solicitações de titulares antes do lançamento; validar a operação com assessoria apropriada à LGPD. A ANPD identifica geolocalização de celular como dado pessoal em sua página sobre direitos dos titulares: [ANPD — Titular de Dados](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados).
- Para pagamento futuro, minimizar dados de cartão armazenados pela aplicação; delegar captura ao provedor escolhido e confirmar transações no servidor.

## 5. Risks & Roadmap

### Phased Rollout

**MVP — Encontrar o casal**

- Página pública mobile-first com mapa exibindo simultaneamente o pin individual de cada integrante, horários e estado de atualização.
- Sincronização automática da posição a cada 5 minutos por dispositivo, com ação manual de sincronização imediata no `/admin`.
- SEO técnico básico para a página pública, com URL canônica, metadados sociais, `robots.txt` e `sitemap.xml`; rotas privadas e de administração fora do índice.
- Modo operador autenticado para iniciar/pausar compartilhamento.
- Perfil com descrição e produtos principais.
- Agenda editável de paradas e microfestas.
- Estados de erro, GPS indisponível, permissão negada, conexão perdida e posição desatualizada.
- Piloto de campo na orla de Maceió para validar cobertura, consumo de bateria, usabilidade e atualização percebida.

**v1.1 — Catálogo, pedidos e entrega**

- CRUD básico de produtos no admin e catálogo público.
- Carrinho com reserva inicial de estoque por 10 minutos a partir do primeiro item, sem extensão por Pix manual; o prazo será revisado após o piloto. Limite online configurável por produto (inicialmente 2 cervejas por cadastro, janela de aplicação **TBD**).
- Pedidos com checkout de provedor selecionado ou Pix manual; eventuais taxas de pagamento visíveis antes da confirmação. Sem taxa de entrega.
- Local de entrega preenchido com localização do cliente, instruções e opção de encontro noutro ponto; código único para conferência.
- Entrega garantida até o corte diário em pedido pago antecipadamente, incluindo transporte alternativo em caso de imprevisto. O limite de distância é configurado por dia e medido desde a posição do casal no momento em que o cliente envia o pedido. A rota pode mudar, não há previsão exata de chegada e não há taxa de entrega; pedido pago no encontro não tem garantia de entrega.
- Estados de pedido, confirmação manual de Pix, cancelamentos/reembolsos e liberação de estoque após expiração.
- Relatório operacional de preço, custo de aquisição, margem, vendas e conversão.

**v2.0 — Experiência de DJ e comunidade (a definir)**

- Recursos para divulgar programação, set times, estilos e microfestas itinerantes.
- Possíveis recursos como agenda recorrente, playlist externa ou aviso de “som rolando agora”, após validação com os usuários e análise de direitos/integrações.
- Não incluir streaming próprio ou pedidos de música até escopo, licenças e moderação serem definidos.

### Technical Risks

- **Suspensão do navegador em segundo plano:** pode congelar a publicação de localização quando a tela é bloqueada ou o navegador é suspenso. Mitigação: teste de campo; estado de atualização transparente; instrução de manter o modo operador aberto; fallback de parada manual. Se atualização em background confiável for requisito, avaliar app nativo ou outra solução depois do piloto.
- **Sinal móvel instável na orla:** pode atrasar ou impedir atualizações. Mitigação: apresentar idade da última posição, fila local limitada e opção de publicar posição/trecho manualmente.
- **Precisão do GPS e bateria:** atualizações frequentes podem consumir bateria e oscilar. Mitigação: ajustar intervalo/distância, comunicar incerteza e permitir pausa.
- **Exposição de localização:** publicação inadvertida pode afetar a segurança dos operadores. Mitigação: iniciar apenas por ação explícita, pausa sempre acessível, mostrar estado e definir se o último pin é ocultado imediatamente.
- **Dependência de mapas:** preço, limites e cobertura do provedor podem mudar. Mitigação: escolher provedor após protótipo e manter interface desacoplada.
- **Pagamentos e estoque na v1.1:** falhas de webhook, cobranças duplicadas ou disputa entre reservas podem causar divergência. Mitigação: idempotência, reconciliação e estados explícitos de pedido.
- **Prazo curto do carrinho:** conexão lenta ou Pix manual pode não ser confirmado em 10 minutos. Mitigação: iniciar a contagem no primeiro item, mostrar o tempo restante, não estender a reserva por Pix manual e liberar estoque ao expirar; rever o prazo após o piloto.
- **Entrega garantida:** distância, clima, segurança e custo de mototáxi/Uber podem tornar a promessa difícil ou reduzir a margem. Mitigação: configurar por dia o corte (geralmente 18h) e a distância máxima, calcular desde a posição do casal quando o cliente envia o pedido e monitorar custos operacionais; não prometer rota nem horário exato de chegada.
- **Limite por cadastro:** clientes podem criar contas múltiplas para contornar o teto de cerveja. Mitigação: definir verificação proporcional sem coletar dados excessivos.
- **Operação de bebidas alcoólicas:** políticas de venda, comunicação, idade e entrega/retirada precisam ser validadas antes de ativar pedidos pagos.

### Decisões em aberto

- Nome/identidade pública final: “Delupa”, “Casal de Lupa”, “Os de Lupa” ou outro.
- Hospedagem, backend, estrutura do monorepo e provedor de tiles/mapas; Nuxt e as áreas client/admin estão definidos.
- Se o mapa mostra coordenada precisa ou área aproximada, especialmente em situação de pausa.
- Retenção exata da última posição e eventual histórico.
- Como operar localização em dispositivos bloqueados ou com navegador em segundo plano.
- Quais métricas finais definem sucesso e qual é a meta do piloto.
- Provedor de pagamento, métodos aceitos, cancelamento/reembolso e regras de estoque.
- Exceções da entrega garantida em situações de segurança, clima ou força maior.
- Se entrega exige localização precisa ou aceita pin aproximado, como o cliente ajusta local/instruções e por quanto tempo esses dados são retidos.
- O prazo inicial é 10 minutos a partir do primeiro item, sem extensão por Pix manual e sem reinício ao alterar o carrinho; revisar o valor após observar a operação.
- Como o código único é apresentado ao cliente e validado pelo casal.
- Regra temporal do limite online de 2 cervejas por cadastro e política de verificação de cadastro/pessoa.
- Se o pagamento no local sempre significa encontro/retirada ou pode iniciar pedido de entrega sem garantia.
- Conteúdo de DJ desejado para a segunda fase e quais integrações externas serão aceitas.
