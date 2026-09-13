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

## 5. Sprint #2 (14/set–27/set) — Release 2

Três trilhas em paralelo: código de interface, início do backend, e validação de campo.

### 5.1 Código — interface

| Entrega | Descrição | Responsável |
|---|---|---|
| Navegação entre telas | Fluxo real de navegação usando expo-router | A definir |
| Componente `Card` reutilizável | Peça visual base, usada pelas telas de listagem | A definir |
| Telas consumindo `mock.ts` | Telas lendo do mock em vez de conteúdo fixo no código | A definir |
| Tela de chat do tutor | Interface da conversa, com estado local apenas — sem IA e sem API nesta etapa | A definir |

O chat desta sprint é casca: só a interface e o estado em memória. A ligação com a IA de
verdade só acontece na Sprint #3, depois que o backend existir.

### 5.2 Código — início do backend (ADR: Python + FastAPI + Gemini + Render)

A decisão de a equipe construir o próprio backend — em vez de esperar resposta do professor —
está registrada em [`PROJECT-CONTEXT.md`](../PROJECT-CONTEXT.md) §6. Aqui entram só as
tarefas; o porquê de cada escolha está lá.

| Entrega | Descrição | Responsável |
|---|---|---|
| Estrutura mínima do backend | Pasta `backend/` na raiz do repositório, FastAPI com uma rota `POST /api/chat` | A definir |
| Chave da IA | Gerar `GEMINI_API_KEY` em aistudio.google.com; variável de ambiente local, nunca commitada (regra inviolável 2) | A definir |
| System prompt socrático | Prompt fixo que impede resposta direta e força perguntas-guia (regra inviolável 6) | A definir |

### 5.3 Validação de campo — **CRÍTICA**

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

**Release 2** = navegação real entre telas + casca do chat + backend rodando local com o
Gemini de verdade (ainda sem deploy) + primeiras evidências de validação de campo.

## 6. Sprint #3 (28/set–18/out) — Release 3

Foco: sair do "backend local" para "app conversando com o Gemini de verdade, hospedado".

| Entrega | Descrição | Responsável |
|---|---|---|
| Streaming no backend | Resposta formatada segundo o Data Stream Protocol do AI SDK, para o app consumir token a token sem depender das libs JS do AI SDK | A definir |
| Teste local completo | Backend em `localhost` chamando o Gemini de verdade, validado **antes** do deploy — não depurar hospedagem e lógica de IA ao mesmo tempo | A definir |
| Deploy no Render | Web Service gratuito, deploy direto do GitHub, `GEMINI_API_KEY` configurada no painel do Render — nunca no código | A definir |
| `services/` no app | Camada de chamada à API (hoje só "planejada" no `docs/arquitetura.md`), consumindo o streaming do backend | A definir |
| Chat ligado à IA real | Tela de chat da Sprint #2 passa a usar `services/` em vez do estado mockado | A definir |

**Release 3** = tela de chat do app conversando de verdade com o tutor socrático, via backend
hospedado no Render.

## 7. Sprint #4 (19/out–01/nov) — Release 4

Foco: robustez e preparação para a fase de apresentação, que começa logo depois (09/nov).

| Entrega | Descrição | Responsável |
|---|---|---|
| Testes ponta a ponta | App (web e Expo Go) conversando com o backend real no Render, incluindo o cenário de cold start | A definir |
| UX do cold start | Estado de carregamento e feedback ao aluno durante os 30-50s de "acordar" o Render, em vez de tela travada | A definir |
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
