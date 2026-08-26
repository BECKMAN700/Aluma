# Trilha mobile

Aplicativo tem restrições que web não tem: o usuário atualiza quando quer, a rede some no elevador, a bateria é finita, a loja pode recusar a versão e o dispositivo pode ser um aparelho de entrada com 3 GB de RAM. Decisões erradas aqui só aparecem depois da publicação — quando corrigir custa uma nova revisão de loja.

Índice:
- [Decisão de plataforma](#decisão-de-plataforma)
- [Arquitetura](#arquitetura)
- [Offline-first e sincronização](#offline-first-e-sincronização)
- [Ciclo de vida e estados de tela](#ciclo-de-vida-e-estados-de-tela)
- [Desempenho](#desempenho)
- [Segurança e dados no dispositivo](#segurança-e-dados-no-dispositivo)
- [Permissões e notificações](#permissões-e-notificações)
- [Acessibilidade móvel](#acessibilidade-móvel)
- [Testes](#testes)
- [Publicação e pós-lançamento](#publicação-e-pós-lançamento)
- [Checklist pré-publicação](#checklist-pré-publicação)

## Decisão de plataforma

Apresente as três opções com trade-offs e recomende — nunca escolha em silêncio.

| Caminho | Melhor quando | Custo |
|---|---|---|
| **Nativo** (Swift / Kotlin) | uso pesado de hardware, animação avançada, offline-first complexo, dado sensível, desempenho máximo | duas bases de código, dois ciclos de manutenção |
| **Cross-platform** (Flutter / React Native) | velocidade até o mercado, UI consistente, um time só | ainda sobra trabalho específico de plataforma — reserve de 15% a 25% do tempo |
| **PWA** | conteúdo, catálogo, ferramenta interna, quando evitar a loja é vantagem | acesso limitado a hardware, notificação e distribuição com restrições |

Perguntas que decidem: usa quais recursos do aparelho? Precisa estar nas lojas? Quem mantém depois? Qual a experiência do time? Web e app compartilham lógica?

## Arquitetura

Camadas com dependência apontando para dentro:

- **Apresentação** — telas e estado de UI. Sem regra de negócio, sem chamada de rede direta.
- **Domínio** — regras de negócio puras, independentes de framework. É o que sobrevive à troca de biblioteca de UI.
- **Dados** — repositórios que decidem entre cache local e rede. A tela **nunca** sabe de onde veio o dado.

Essa fronteira é o que permite trocar API, adicionar offline ou migrar de framework sem reescrever o app.

Estado: uma fonte da verdade por tela, fluxo unidirecional, estado imutável. Estado espalhado é a causa número um de bug irreproduzível em app.

Navegação declarativa com deep link previsto desde o início — retrofitar deep link depois é doloroso.

## Offline-first e sincronização

Se a resposta a "precisa funcionar sem internet?" for sim, isso é decisão de arquitetura, não de recurso.

- Banco local como fonte primária de leitura; a rede atualiza o local, e a tela observa o local.
- Escrita entra numa fila durável com estado (`pendente`, `enviando`, `falhou`) e sobrevive ao fechamento do app.
- **Resolução de conflito decidida antes de codar**: última escrita vence, servidor vence, ou o usuário decide? Escreva no ADR.
- Operação de escrita idempotente (id gerado no cliente) para reenvio não duplicar.
- A interface mostra o estado: "salvo no aparelho, sincroniza quando houver conexão". Fingir sucesso é como se perde a confiança do usuário.
- Teste com rede desligada, rede lenta, e rede que cai no meio da requisição.

## Ciclo de vida e estados de tela

Cenários que o simulador esconde e o usuário real encontra em uma hora:

- App para em segundo plano e o sistema encerra o processo — o estado volta?
- Rotação de tela e mudança de tamanho de fonte do sistema
- Chamada, alarme ou notificação no meio de um formulário
- Permissão revogada nas configurações enquanto o app rodava
- Sessão expirada em segundo plano
- Bateria em modo economia, dados móveis limitados

Toda tela que carrega dado precisa dos quatro estados: **carregando, vazio, erro (com ação de tentar de novo), sucesso**. Estado vazio bem escrito é oportunidade de orientar o usuário, não uma tela em branco.

## Desempenho

Metas de partida para 2026 (ajuste ao aparelho popular do seu público, não ao seu):

| Métrica | Meta |
|---|---|
| Abertura a frio | até 2,5 s no p90 |
| Resposta ao toque | abaixo de 100 ms |
| Sessões sem travamento | acima de 99,5% |
| Rolagem | sem quadro perdido em lista longa |

Práticas: skeleton em vez de spinner (percepção de velocidade); listas com reciclagem e paginação; imagens dimensionadas e em cache; trabalho pesado fora da thread principal; módulos sob demanda para reduzir abertura a frio; medir antes e depois — sem medição, é opinião.

Vigie também tamanho do pacote, consumo de bateria e de dados móveis. App que gasta bateria é desinstalado sem reclamação.

## Segurança e dados no dispositivo

- Token e credencial em armazenamento seguro do sistema (Keychain / Keystore) — nunca em preferências simples ou arquivo texto.
- Nada de segredo embutido no binário: app instalado é código na mão de terceiros. Chave de API sensível fica no seu backend.
- HTTPS obrigatório; considere fixação de certificado em app financeiro ou de saúde.
- Não registre dado pessoal em log de produção.
- Biometria como conveniência sobre uma autenticação real, não como substituta.
- Limpe dado sensível no logout, inclusive cache e arquivos temporários.
- Cuidado com captura de tela e conteúdo sensível no alternador de aplicativos.

## Permissões e notificações

- Peça a permissão **no momento em que o benefício é óbvio**, não na abertura. Pedir tudo de cara derruba a taxa de aceite.
- Explique antes de pedir ("para escanear o código, precisamos da câmera").
- O app precisa continuar funcionando com a permissão negada — degrade, não trave.
- Notificação: peça permissão depois de o usuário ver valor; ofereça controle granular; nunca use push para conteúdo que ele não pediu.

## Acessibilidade móvel

WCAG 2.2 nível AA virou cláusula contratual em compras corporativas. Além do checklist geral:

- Alvos de toque de pelo menos 44×44 pt (iOS) / 48×48 dp (Android)
- Rótulo acessível em todo ícone-botão (o ícone sozinho não é lido)
- Suporte a fonte dinâmica: teste com o maior tamanho do sistema e veja se o layout aguenta
- Ordem de foco lógica para VoiceOver / TalkBack; teste um fluxo inteiro com o leitor ligado
- Contraste mínimo de 4,5:1; não use só cor para indicar erro
- Respeitar preferência de movimento reduzido
- Alternativa ao gesto complexo (arrastar, deslizar) sempre disponível

## Testes

- **Unitários** no domínio — a maior parte, roda em segundos.
- **De widget/componente** para estados de tela: carregando, vazio, erro, sucesso.
- **De integração** para fluxo crítico (login, compra, sincronização).
- **Em aparelho real**, incluindo um modelo de entrada — emulador esconde problema de desempenho, câmera, notificação e permissão.
- Matriz mínima: menor versão de SO suportada, versão mais recente, tela pequena, tela grande, fonte grande, sem rede.

## Publicação e pós-lançamento

- Contas de desenvolvedor, certificados e assinatura resolvidos **antes** do fim do desenvolvimento — é onde prazos morrem.
- Ficha da loja: política de privacidade obrigatória, declaração de dados coletados, classificação etária, capturas de tela.
- Motivos frequentes de recusa: funcionalidade incompleta, login sem conta de teste para o revisor, permissão sem justificativa, uso de API privada, política de privacidade ausente.
- Lançamento gradual (5% → 20% → 100%) observando travamentos antes de liberar para todos.
- Relatório de travamento e analytics instrumentados **desde a primeira versão** — sem isso você não sabe o que quebrou no aparelho de alguém.
- Preveja atualização forçada: um mecanismo para exigir versão mínima quando houver falha grave ou quebra de contrato de API. Usuário não atualiza sozinho.
- Versões antigas continuam vivas por meses: **a API precisa manter compatibilidade retroativa.**

## Checklist pré-publicação

- [ ] Testado em aparelho real, incluindo um modelo de entrada e a menor versão de SO suportada
- [ ] Funciona sem rede e com rede instável, com feedback claro
- [ ] Todos os estados de tela implementados (carregando, vazio, erro com ação, sucesso)
- [ ] Permissões pedidas em contexto, com degradação se negadas
- [ ] Segredo nenhum no binário; token em armazenamento seguro
- [ ] Acessibilidade: leitor de tela em um fluxo completo, fonte grande, contraste, alvos de toque
- [ ] Abertura a frio e resposta ao toque medidas contra a meta
- [ ] Relatório de travamento e analytics ativos
- [ ] Política de privacidade e declaração de dados publicadas e verdadeiras
- [ ] Mecanismo de atualização mínima previsto
- [ ] Conta de teste disponível para o revisor da loja
