# Aluma — Planejamento de Sprints

> Documento de acompanhamento. Registra o que cada sprint entrega, quem responde por
> cada item e em que pé está. Para decisões de produto, escopo e arquitetura, a fonte
> é o [`PROJECT-CONTEXT.md`](../PROJECT-CONTEXT.md).

---

## 1. Visão geral

O Aluma é uma plataforma de tutoria com IA vinculada à turma real da escola. O aluno hoje
não tem um guia que entenda *o que especificamente* ele não entendeu, e muitos sequer sabem
o que estudar ou como estudar — é dessa falta de direção que nasce o desinteresse. As
alternativas disponíveis são o ChatGPT, que a maioria não sabe usar e que entrega a resposta
pronta, ou o professor particular, que custa dinheiro. Do outro lado, a escola ou proíbe a IA
ou finge que ela não existe; nos dois casos o aluno usa mesmo assim, sem supervisão, para
copiar resposta.

O diferencial do produto é um tutor que **nunca entrega a resposta**. Ele mostra o que
estudar, dá exemplos, pergunta de volta e obriga o aluno a pensar até chegar sozinho. O
ponto que costuma passar despercebido é que essa recusa não é só uma escolha pedagógica:
ela é, ao mesmo tempo, o mecanismo anti-cola. Não existem dois recursos separados — um
"modo tutor" e um "modo antifraude". É o mesmo comportamento resolvendo as duas dores de
uma vez, a do aluno que precisa aprender e a da escola que precisa de controle. O professor,
por sua vez, alimenta o conteúdo da matéria e recebe da IA o mapa de onde cada aluno travou,
sem acesso à conversa crua — só ao resumo de desempenho, porque a privacidade do adolescente
é regra fechada.

O modelo de receita é **licença por escola, por ano**. A escolha acompanha o ciclo de compra
de quem paga: escola da rede privada e secretaria de educação decidem orçamento anualmente,
não por assinatura individual. Quem paga é a instituição; quem usa são aluno e professor. A
métrica de sucesso adotada é aluno ativo por semana.

## 2. Equipe e responsabilidades

O time não é o mesmo nas duas disciplinas. Quem está nas duas carrega tanto o código quanto
os artefatos da Supernova.

| Nome | GitHub | Web/Mobile | Projeto de Sistemas |
|---|---|---|---|
| João Pedro Beckman — responsável, decisão final | @BECKMAN700 | sim | sim |
| Giordano Bruno de Moura Fragoso Santos | @GiordanOBru | sim | sim |
| Thales Rafael | @thalesrafael10 | sim | sim |
| Antonio Carlos | @Acgsop | sim | não |
| Iagor | @iagorlrnc | sim | não |
| Flávio | @flaviohen16 | não | sim |
| Gustavo Bringel | @GustavoBringel | não | sim |

A decisão final em qualquer impasse é do João Pedro.

## 3. Cronograma

O projeto responde a duas frentes com calendários próprios. Em Desenvolvimento Web/Mobile
(Prof. Jackson Gomes) o ritmo é ditado pelos encontros e pelas entregas que o professor pedir,
ainda sem data fixa divulgada. Em Projeto de Sistemas (Prof. Edeilson Milhomem) o plano de
ensino já fixa 4 sprints com data e release definidas — é essa tabela que passa a valer como
referência de calendário para as duas frentes, já que o código é o mesmo nas duas:

| Sprint | Início | Fim | Release |
|---|---|---|---|
| #1 | 24/ago | 13/set | Release 1 |
| #2 | 14/set | 27/set | Release 2 |
| #3 | 28/set | 18/out | Release 3 |
| #4 | 19/out | 01/nov | Release 4 |

Depois da Sprint #4 vem uma fase fora das 4 sprints: refinamento do produto (09 e 16/nov),
banca de apresentação técnica (23 e 30/nov) e o Demo Day / pitch final (07/dez).

Os marcos da Supernova ligados a esse calendário estão registrados no
[`PROJECT-CONTEXT.md`](../PROJECT-CONTEXT.md) §12.

## 4. Sprint #1 (24/ago–13/set) — concluída → Release 1

Fundação do repositório e saída do template de demonstração. Cobre o que antes estava
dividido internamente em "Sprint 0" e "Sprint 1" — as duas terminam dentro da janela oficial
da Sprint #1.

| Entrega | Responsável | Arquivo | Status |
|---|---|---|---|
| Inicialização do projeto Expo com TypeScript | João Pedro | — | Concluído — PR #4 |
| Limpeza do template do Expo | João Pedro | `app/`, `components/` | Concluído — PR #5 |
| Interfaces do domínio | Giordano | `types/aluma.ts` | Concluído — PR #8 |
| Cores e tema do Aluma | Antonio Carlos | `constants/theme.ts` | Concluído — PR #10 |
| Dados de exemplo | Thales | `data/mock.ts` | Concluído — PR #9 |
| Tela de boas-vindas | Iagor | `app/(tabs)/index.tsx` | Concluído — PR #7, #11 |

Stack fixada: React Native + Expo SDK 54, TypeScript, expo-router. Nenhuma dessas escolhas
foi preferência da equipe — todas vêm da ementa da disciplina, o que tem a vantagem de
eliminar a discussão.

Notas de execução:

- A limpeza removeu `explore.tsx`, `modal.tsx`, `hello-wave.tsx` e `parallax-scroll-view.tsx`,
  além das referências a eles nos dois `_layout.tsx`.
- O `constants/theme.ts` já existia, vindo do template; a tarefa foi substituir a paleta
  padrão do Expo pelas cores do Aluma, não criar o arquivo do zero.
- O `data/mock.ts` é material de desenvolvimento e demonstração. Pela regra 5 do projeto,
  ele fica isolado e sinalizado, e nunca entra no caminho de produção.

**Release 1** = o app abre já com a identidade do Aluma: tema, tipos do domínio e dados de
exemplo no lugar, tela inicial no lugar do template padrão do Expo.

**Retrospectiva (15/09):** o professor não aceitou a Release 1 como release. Uma release é
uma versão **estável e funcional**, e a nossa só tinha organização: uma tela estática sem
interação, e `data/mock.ts` e `types/aluma.ts` sem nenhum arquivo que os importe. O erro veio
do planejamento: a release foi definida por lista de tarefas, não pelo que o usuário consegue
fazer. **Regra a partir daqui:** toda release é definida por um *roteiro de demonstração*, ou
seja, passos que o professor executa sozinho, numa URL pública, e que funcionam. Se o roteiro
não passa inteiro, não é release.

## 5. Sprint #2 (14/set–27/set) — Release 2

Decisão da equipe (15/09): a Release 2 entrega **o chat com o tutor socrático usando IA de
verdade, publicado**. Isso puxa o deploy, que antes estava na Sprint #3, para esta sprint,
porque backend rodando só em `localhost` o professor não consegue testar.

Trade-off aceito: mostramos o diferencial do produto já na Release 2, mas a sprint concentra
muita coisa nova (FastAPI, Gemini, Render, deploy web). Para caber em duas semanas, **fica de
fora** tudo o que não é necessário para o roteiro abaixo: login, turma, histórico salvo,
streaming, trilha, exercícios e painel do professor.

### 5.0 Onde está cada coisa

A sprint fecha em 27/09, e a **apresentação da release é segunda, 28/09**, na aula de Projeto
de Sistemas. Presença vale 10 pontos individuais.

- **Guia individual de cada integrante:** `docs/guias/sprint-2-<nome>.md`, com passo a passo,
  prazos e um prompt base para usar com IA.
- **Issues:** marco [Release 2](https://github.com/BECKMAN700/Aluma/milestones) no GitHub, uma
  por tarefa, com responsável. O PR que resolve escreve `closes #N`.
- **Regras de layout:** [`layout-flexbox.md`](layout-flexbox.md).
- **Atas de reunião:** [`reunioes.md`](reunioes.md).

| Dia | Backend | App | Publicação e processo |
|---|---|---|---|
| sáb 19 – dom 20 | Giordano começa o esqueleto | Iagor: navegação | — |
| seg 21 | Giordano fecha o esqueleto | Iagor: tela de chat | Thales: lint no CI |
| ter 22 | **Esqueleto na `develop`** — destrava 3 pessoas | Iagor: tela de chat | Thales: lint no CI |
| qua 23 | Flávio: validação · Gustavo: limite · Thales: prompt | Antonio: refatoração da tela inicial | — |
| qui 24 | — | Antonio: `services/chat.ts` | João: verificação de disponibilidade |
| sex 25 | Thales: deploy · Flávio: testes · Gustavo: conversas | Antonio: estados de espera e erro | João: publicação web |
| sáb 26 | Gustavo: bateria anti-cola | Iagor: balões · Antonio: aviso | **Teste do roteiro inteiro, time todo** |
| dom 27 | Correções | Correções | João: Release e ficha |
| seg 28 | **Apresentação** | | |

### 5.1 Roteiro de demonstração (critério de aceite da Release 2)

1. O professor abre a URL pública do app no navegador do celular, sem instalar nada.
2. Na tela inicial, toca em **Conversar com o tutor** e chega na tela de chat.
3. Se o servidor estiver "dormindo" (cold start do Render), a tela mostra que o tutor está
   acordando e que isso pode levar até um minuto. A tela não trava.
4. Pergunta *"Quanto é x em 3x + 5 = 20?"*. O tutor **não** responde `x = 5`: responde com
   uma pergunta-guia (ex.: *"O que você pode fazer dos dois lados para isolar o 3x?"*).
5. Insiste: *"Só me dá a resposta."* O tutor continua recusando e guiando.
6. Pergunta algo fora de estudo (*"Me indica um filme"*). O tutor recusa com educação e
   traz a conversa de volta para o estudo.
7. Com o backend fora do ar, o app mostra um erro claro. Nunca inventa resposta.
8. O mesmo roteiro repetido com a janela do navegador estreitada a 320px de largura, e no
   celular com o teclado aberto: nada é cortado, nada sai da tela e não aparece rolagem
   lateral. O layout se ajusta sozinho, sem altura nem largura fixa no código.

### 5.2 Backend (ADR: Python + FastAPI + Gemini + Render)

O porquê de cada escolha está em [`PROJECT-CONTEXT.md`](../PROJECT-CONTEXT.md) §6. Aqui entram
só as tarefas.

| Entrega | Descrição | Responsável |
|---|---|---|
| Estrutura mínima | Pasta `backend/`, FastAPI, rotas `POST /api/chat` e `GET /health` | Giordano |
| System prompt socrático | Nunca entrega a resposta, guia por perguntas, recusa assunto fora de estudo (regra 6) | Thales |
| Validação no servidor | Mensagem obrigatória, tamanho máximo, histórico enviado limitado às últimas N mensagens; entrada inválida vira `422`, não chamada à IA (regra 3) | Flávio |
| Proteção da cota | A URL é pública: sem limite de requisições por IP, qualquer pessoa gasta as ~1.500 req/dia do Gemini. CORS liberado só para o domínio do app | Gustavo |
| Chave da IA | `GEMINI_API_KEY` só em variável de ambiente: `.env` local (no `.gitignore`) e painel do Render. Nunca no código, no app ou no log (regra 2) | Giordano |
| Log sem conversa | Registrar status, tempo e erro, mas **não** o texto das mensagens: o usuário é menor de idade (regra 8) | Giordano |
| Deploy no Render | Web Service gratuito, deploy a partir do GitHub | Thales |

Resposta **inteira**, sem streaming, nesta release. Streaming é melhoria da Release 3. Assim a
Release 2 tem uma peça a menos que pode quebrar.

### 5.3 App

| Entrega | Descrição | Responsável |
|---|---|---|
| Navegação | Tela inicial → tela de chat, com expo-router | Iagor |
| Tela de chat | Lista de mensagens, campo de texto, botão enviar, estado "tutor pensando". Layout em flexbox: container `column`, lista com `flex: 1`, barra de digitar em `row` com altura natural. Nenhuma altura fixa | Iagor |
| Balões de mensagem | `alignSelf: 'flex-end'` para o aluno e `'flex-start'` para o tutor, `maxWidth: '80%'`, texto com `flexShrink: 1` para não vazar da tela | Iagor |
| Refatoração da tela inicial | Trocar os 14 `position: absolute` e as 98 estrelas com coordenadas fixas por layout em flexbox. Remove o `as any` das linhas 122-123, que hoje viola a convenção de TypeScript do projeto | Antonio |
| `services/chat.ts` | Única camada que conhece a URL do backend, lida de `EXPO_PUBLIC_API_URL` (URL não é segredo; chave é) | Antonio |
| Estados de espera e erro | Cold start (passo 3 do roteiro) e backend fora (passo 7) | Antonio |
| Aviso de privacidade | Texto curto no chat: "não escreva seu nome nem dados pessoais". O tier gratuito do Gemini pode usar os prompts para treino (risco em PROJECT-CONTEXT §8) | Antonio |
| Verificação de disponibilidade | O app consulta `GET /health` antes de abrir o chat e detecta servidor dormindo, alimentando o aviso do passo 3 | João |
| Publicação web | `npx expo export -p web` publicado em host estático gratuito (host a definir, pendência 3 do professor) | João |

### 5.4 Qualidade mínima para chamar de release

| Entrega | Descrição | Responsável |
|---|---|---|
| Lint no CI | GitHub Actions rodando `npm run lint` em todo PR para a `develop` | Thales |
| Teste do backend | `pytest` para a validação de entrada e para o limite de requisições. Testa o que não depende da IA | Flávio |
| Bateria anti-cola | Lista fixa de ~10 perguntas-armadilha (pedido direto, insistência, "é pra prova", fora de assunto) rodada contra o backend publicado antes de fechar a release, com o resultado anexado ao PR | Gustavo |
| GitHub Release | Release publicada (não só tag), com o roteiro 5.1, a URL e o que ficou de fora | João |
| `docs/layout-flexbox.md` | Uma página com as regras de layout do projeto: sem altura fixa, `flexShrink: 1` em texto dentro de `row`, `absolute` só para decoração. É o critério objetivo do review de tela | João |
| Revisão dos PRs de segurança e infra | Áreas listadas no `.github/CODEOWNERS`: limite de requisições, configuração de CI e o plano da sprint. O resto fica com o revisor da matriz (§5.7) | João |

### 5.5 Validação de campo — **CRÍTICA**

Este é o principal gargalo para a pontuação na Supernova. Hoje a validação do projeto é
**zero**: nenhuma conversa com aluno, professor ou diretor. A banca avalia exatamente isso, e
nenhuma quantidade de código compensa a ausência dessa evidência. Já devia ter começado desde
a Sprint #1 — entra aqui como prioridade máxima da sprint.

| Meta | Quantidade | Status |
|---|---|---|
| Formulário respondido por alunos do fundamental/médio | 30+ | Não iniciado |
| Conversas de ~20 min com professores | 3 | Não iniciado |
| Conversa com coordenador ou diretor | 1 | Não iniciado |

É trabalho barato e cabe em um fim de semana: dá para rodar em grupo de WhatsApp de escola,
com primo, com vizinho. A diferença que produz é entre dizer "achamos que" e dizer
"perguntamos para 34 pessoas e 71% disseram". Enquanto os números acima estiverem em zero,
esta é a tarefa de maior prioridade do projeto inteiro — acima de qualquer item de código.

O Flávio e o Gustavo **coordenam** esta frente: montam o formulário, organizam as conversas e
analisam o resultado. Mas a coleta é de todos: **cada membro traz pelo menos 1 conversa ou 5
respostas de formulário**. Assim ninguém fica só com a parte sem código, e ninguém fica sem
contato com usuário real — que é o que a banca da Supernova pergunta.

### 5.6 Divisão do trabalho, peso e dependências

A nota das duas disciplinas é **individual**. Por isso a divisão não foi feita por "quem já
mexeu nisso", e sim equilibrando dificuldade e garantindo que **todo mundo entrega código
próprio**, que consegue defender na banca. O peso abaixo é estimativa da equipe, de 1 (pequeno)
a 4 (difícil), só para comparar carga entre pessoas.

| Pessoa | Disciplina | Tarefas | Peso |
|---|---|---|---|
| Giordano | as duas | Estrutura do backend + Gemini + chave (4), log sem conversa (1) | 5 |
| Flávio | Proj. Sistemas | Validação da entrada (2), teste do backend (2), coordenar validação de campo (1) | 5 |
| Gustavo | Proj. Sistemas | Limite de requisições + CORS (2), bateria anti-cola (2), coordenar validação de campo (1) | 5 |
| Thales | as duas | System prompt (2), deploy no Render (2), lint no CI (1) | 5 |
| Antonio | Web/Mobile | `services/chat.ts` (2), estados de espera e erro (2), aviso de privacidade (1), refatoração da tela inicial para flexbox (3) | 8 |
| Iagor | Web/Mobile | Tela de chat com layout flexbox (3), balões com `alignSelf` (2), navegação (1) | 6 |
| João | as duas | Verificação de disponibilidade do backend (2), publicação web (2), `docs/layout-flexbox.md` (1), GitHub Release (1), revisão dos PRs de segurança e infra (1) | 7 |

Antonio e Iagor carregam a frente de layout, que é o que a disciplina de Web/Mobile avalia.
A refatoração da tela inicial é "refatoração significativa documentada", um dos critérios de
PR relevante da ficha — o Antonio passa a ter o PR mais forte do app.

O Flávio e o Gustavo estão só em Projeto de Sistemas e não cursam Web/Mobile, então entram no
**backend**, que não depende do conteúdo daquela disciplina. Suposição a confirmar: os dois
conseguem aprender Python básico nos primeiros dias da sprint.

**Dependências e marcos internos:**

- **terça 22/09 — esqueleto do backend no ar (Giordano).** `GET /health` respondendo e
  `POST /api/chat` devolvendo algo fixo, ainda sem IA. Sem isso, Flávio, Gustavo e Thales ficam
  bloqueados. (Data original era 18/09, remarcada em 19/09 quando o planejamento foi concluído.)
- **Arquivos separados dentro de `backend/`** para quatro pessoas não brigarem pelo mesmo código:
  validação em `validation.py` (Flávio), limite em `rate_limit.py` (Gustavo), prompt em
  `prompt.py` (Thales).
- **Thales e Gustavo andam em dupla:** a bateria anti-cola testa o system prompt. Se a bateria
  achar furo, os dois voltam juntos ao prompt.
- **Iagor e Antonio combinam o contrato no primeiro dia:** a tela chama `enviarMensagem(texto)`
  e recebe a resposta ou um erro. Sem esse acerto, um espera o outro.

### 5.7 Como a sprint é pontuada (ficha do Prof. Edeilson)

A ficha de avaliação de Projeto de Sistemas define a nota assim:

| Bloco | Pontos | Como é avaliado |
|---|---|---|
| Presença na apresentação da release | 10 | Individual. Faltou, perdeu |
| Produto da sprint | 40 | Igual para o time: valor entregue (15), qualidade técnica (15), decisões de projeto (5), release publicada (5) |
| Contribuição individual | 50 | PR relevante (15), code review (10), impacto (15), engajamento (10) |

**Duas exigências travam os 50 pontos individuais.** Sem elas a nota cai, por regra de
formulário, mesmo com trabalho feito:

1. **No mínimo 1 PR relevante por pessoa por sprint.** Vale funcionalidade, refatoração
   significativa, correção crítica, teste estrutural ou melhoria arquitetural. Não vale ajuste
   de comentário, indentação ou CSS pequeno. Quem não tem PR relevante fica com teto de
   14 pontos (0 em PR, máx. 8 de impacto, máx. 6 de engajamento), mesmo com 3 reviews profundos.
2. **No mínimo 1 code review registrado por pessoa por sprint.** Precisa apontar problema
   técnico concreto, sugerir melhoria com justificativa e ter ao menos 3 linhas técnicas.
   "LGTM", "Ok" e "Aprovado" valem zero.

**Matriz de review obrigatório** (quem revisa quem). Cada pessoa é a revisora responsável de
exatamente um PR — um review profundo por sprint é o que a ficha exige, não sete:

| PR | Autor | Revisor obrigatório |
|---|---|---|
| Estrutura do backend + Gemini | Giordano | Flávio |
| Validação da entrada | Flávio | Gustavo |
| Limite de requisições + CORS | Gustavo | Thales |
| System prompt + deploy | Thales | Giordano |
| Verificação de disponibilidade + CI + web | João | Iagor |
| Tela de chat + balões + navegação | Iagor | Antonio |
| `services/chat.ts` + estados de espera/erro | Antonio | Iagor |
| Refatoração da tela inicial para flexbox | Antonio | João |

O `.github/CODEOWNERS` pede o João como revisor apenas nas áreas de risco (limite de
requisições, configuração de CI e este plano). Antes ele era dono de todo o repositório, o que
o transformaria em gargalo com 7 PRs chegando juntos no fim da sprint.

**Engajamento (10 pontos) exige no mínimo 3 evidências registradas** por pessoa. São elas:

- reunião do grupo com participação registrada — anotar em `docs/reunioes.md`, com data e quem esteve;
- tarefa concluída no board (Trello);
- resposta técnica ao PR de um colega;
- ter sido responsável por uma issue finalizada.

Por isso, a partir desta sprint: **cada tarefa vira uma Issue no GitHub**, com responsável
definido, e o PR que a resolve escreve `closes #N` na descrição. Sem esse rastro, o bloco de
engajamento vai a zero por falta de evidência, não por falta de trabalho.

**O que a ficha cobra do produto e onde já está coberto:**

| Critério da ficha | Onde cumprimos |
|---|---|
| Objetivo da sprint alcançado | Roteiro 5.1 passando inteiro |
| Funcionalidades planejadas entregues | Tabelas 5.2 e 5.3 |
| Release gerada e publicada (5 pts) | GitHub Release da seção 5.4, com URL e notas |
| Qualidade técnica: arquitetura, código, testes (15 pts) | Lint no CI, pytest do backend, bateria anti-cola (5.4) |
| Decisões de projeto: trade-offs justificados (5 pts) | Trade-offs registrados no topo da seção 5 e no `PROJECT-CONTEXT.md` §6 |

Obs.: a ficha é de Projeto de Sistemas, então vale para João, Giordano, Thales, Flávio e
Gustavo. Antonio e Iagor são avaliados em Web/Mobile, mas seguem a mesma prática de PR, review
e issue — é o mesmo repositório e o mesmo custo.

**Release 2** = qualquer pessoa abre a URL, conversa com o tutor socrático de verdade e passa
pelos 7 passos do roteiro 5.1. Mais as primeiras evidências de validação de campo.

## 6. Sprint #3 (28/set–18/out) — Release 3 🔶 a confirmar

Deploy e chat com IA já saíram na Release 2. Proposta: a Sprint #3 dá **direção** ao aluno,
que é a outra metade da dor central ("não sei o que estudar").

Roteiro proposto: *"Abro o app, vejo os tópicos de Matemática do 9º ano, escolho um, e o tutor
conversa comigo sobre esse tópico. A resposta aparece aos poucos, sem esperar a mensagem
inteira."*

| Entrega | Descrição | Responsável |
|---|---|---|
| Streaming no backend | Resposta no Data Stream Protocol do AI SDK, consumida token a token pelo app | A definir |
| Trilha de tópicos | Lista de tópicos com status (não iniciado / em andamento / dominado), requisito 3 da V1 | A definir |
| Chat ligado ao tópico | O tópico escolhido entra no contexto do system prompt | A definir |

**Release 3** = roteiro acima passando inteiro na URL pública.

## 7. Sprint #4 (19/out–01/nov) — Release 4

Foco: robustez e preparação para a fase de apresentação, que começa logo depois (09/nov).

| Entrega | Descrição | Responsável |
|---|---|---|
| Testes ponta a ponta | App (web e Expo Go) conversando com o backend real no Render, incluindo o cenário de cold start | A definir |
| Checklist de segurança | Confirmar que `GEMINI_API_KEY` não aparece em nenhum bundle, log ou commit do app (regra inviolável 2) | A definir |

**Release 4** fecha as 4 sprints. A partir de 09/nov começa o refinamento do produto e a
preparação da apresentação final — já fora deste ciclo de 4 sprints.

## 8. Regras de trabalho

O projeto usa **Git Flow com duas branches de longa duração**: a `develop` integra o trabalho do
dia a dia, e a `main` só recebe versão entregue e apresentável, vinda da `develop`.

**Ninguém commita direto em nenhuma das duas.** Sem exceção, inclusive o responsável pelo projeto.

Fluxo para qualquer alteração:

1. Atualizar a `develop` local: `git checkout develop && git pull`
2. Criar uma branch a partir dela: `git checkout -b tipo/descricao-curta`
3. Trabalhar, commitar, e subir: `git push -u origin tipo/descricao-curta`
4. Abrir o Pull Request no GitHub, **com base na `develop`**
5. Esperar revisão de outro membro
6. Mergear só depois de aprovado
7. **Apagar a branch** logo após o merge

O passo 7 não é limpeza cosmética. O PR #11 conflitou justamente porque a branch continuou viva e
recebendo commits depois de já ter sido mergeada por squash no PR #7 — o squash cria na `develop`
um commit que não existe no histórico da branch, e as duas histórias divergem. Branch mergeada é
branch encerrada.

Padrão de mensagem de commit — prefixo, dois-pontos, verbo no imperativo, em português e
curto:

| Prefixo | Quando usar | Exemplo |
|---|---|---|
| `feat` | Funcionalidade nova | `feat: adiciona tela de login` |
| `fix` | Correção de defeito | `fix: corrige rota da tela de chat` |
| `docs` | Só documentação | `docs: adiciona plano de sprints` |
| `chore` | Manutenção, configuração, limpeza | `chore: remove telas de demonstração` |

**Todo membro precisa conseguir explicar o código que commitou.** Essa regra é o ponto da
disciplina: o objetivo é a equipe aprender, não acumular arquivos. Código que ninguém sabe
defender é código que ninguém vai conseguir corrigir depois — e, na apresentação, é a pergunta
que a banca vai fazer. Vale para código escrito com ajuda de IA tanto quanto para código
escrito à mão.

As regras invioláveis de produto e segurança (chave de API, isolamento de turma, LGPD para
menores, a IA que nunca entrega a resposta) estão no [`PROJECT-CONTEXT.md`](../PROJECT-CONTEXT.md) §7
e valem em todas as sprints.
