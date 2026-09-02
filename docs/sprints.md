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

**As datas das sprints estão a definir.** O motivo é estrutural, não desorganização: o
projeto responde a duas frentes com calendários próprios e independentes. Em Desenvolvimento
Web/Mobile (Prof. Jackson Gomes) o ritmo é ditado pelos encontros e pelas entregas que o
professor pedir. Em Projeto de Sistemas o ritmo é o da competição Sebrae Supernova. As duas
avançam em paralelo e nem sempre puxam para o mesmo lado.

Fixar data de sprint antes de saber o que cada frente vai cobrar produziria um cronograma
falso. As sprints ficam, então, ordenadas por dependência e não por data. Os marcos externos
já conhecidos estão registrados no [`PROJECT-CONTEXT.md`](../PROJECT-CONTEXT.md) §12 e são a
referência para o sequenciamento.

## 4. Sprint 0 — concluída

Fundação do repositório e do projeto.

| Entrega | Responsável | Status |
|---|---|---|
| Inicialização do projeto Expo com TypeScript | João Pedro | Concluído — PR #4 |

Stack fixada: React Native + Expo SDK 54, TypeScript, expo-router. Nenhuma dessas escolhas
foi preferência da equipe — todas vêm da ementa da disciplina, o que tem a vantagem de
eliminar a discussão.

## 5. Sprint 1 — em andamento

Objetivo: sair do template de demonstração e ter as peças básicas do domínio no lugar. Os
quatro itens em aberto são independentes entre si e podem correr em paralelo.

| Responsável | Entrega | Arquivo | Status |
|---|---|---|---|
| João Pedro | Limpeza do template do Expo | `app/`, `components/` | Concluído — PR #5 |
| Giordano | Interfaces do domínio | `types/aluma.ts` | Não iniciado |
| Antonio Carlos | Cores e tema do Aluma | `constants/theme.ts` | Não iniciado |
| Thales | Dados de exemplo | `data/mock.ts` | Não iniciado |
| Iagor | Tela de boas-vindas | `app/(tabs)/index.tsx` | Não iniciado |

Notas de execução:

- A limpeza removeu `explore.tsx`, `modal.tsx`, `hello-wave.tsx` e `parallax-scroll-view.tsx`,
  além das referências a eles nos dois `_layout.tsx`.
- O `app/(tabs)/index.tsx` foi deixado deliberadamente mínimo — `View` e `Text` puros, sem
  estilo e sem tema. Isso é o ponto de partida do Iagor, não uma tela pela metade.
- O `constants/theme.ts` **já existe**, veio do template. A tarefa do Antonio Carlos é
  substituir a paleta padrão do Expo pelas cores do Aluma, não criar o arquivo do zero.
- O `data/mock.ts` é material de desenvolvimento e demonstração. Pela regra 5 do projeto,
  ele fica isolado e sinalizado, e nunca entra no caminho de produção.

## 6. Sprint 2 — planejada

Duas trilhas em paralelo: uma de código, outra de campo.

### 6.1 Código

| Entrega | Descrição | Responsável |
|---|---|---|
| Navegação entre telas | Fluxo real de navegação usando expo-router | A definir |
| Componente `Card` reutilizável | Peça visual base, usada pelas telas de listagem | A definir |
| Telas consumindo `mock.ts` | Telas lendo do mock em vez de conteúdo fixo no código | A definir |
| Tela de chat do tutor | Interface da conversa, com estado local apenas — sem IA e sem API nesta etapa | A definir |

O chat desta sprint é casca: só a interface e o estado em memória. A integração com IA passa
obrigatoriamente pelo servidor, porque a chave de API nunca fica no app — e o backend ainda é
pendência aberta (`PROJECT-CONTEXT.md` §9).

### 6.2 Validação de campo — **CRÍTICA**

Este é o principal gargalo para a pontuação na Supernova. Hoje a validação do projeto é
**zero**: nenhuma conversa com aluno, professor ou diretor. A banca avalia exatamente isso, e
nenhuma quantidade de código compensa a ausência dessa evidência.

| Meta | Quantidade | Status |
|---|---|---|
| Formulário respondido por alunos do fundamental/médio | 30+ | Não iniciado |
| Conversas de ~20 min com professores | 3 | Não iniciado |
| Conversa com coordenador ou diretor | 1 | Não iniciado |

É trabalho barato e cabe em um fim de semana: dá para rodar em grupo de WhatsApp de escola,
com primo, com vizinho. A diferença que produz é entre dizer "achamos que" e dizer
"perguntamos para 34 pessoas e 71% disseram". Enquanto os números acima estiverem em zero,
esta é a tarefa de maior prioridade do projeto inteiro — acima de qualquer item de código.

## 7. Regras de trabalho

**Ninguém commita direto na `main`.** Sem exceção, inclusive o responsável pelo projeto.

Fluxo para qualquer alteração:

1. Atualizar a `main` local: `git checkout main && git pull`
2. Criar uma branch a partir dela: `git checkout -b tipo/descricao-curta`
3. Trabalhar, commitar, e subir: `git push -u origin tipo/descricao-curta`
4. Abrir o Pull Request no GitHub
5. Esperar revisão de outro membro
6. Mergear só depois de aprovado

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
