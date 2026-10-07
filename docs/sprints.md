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
| Anna Beatriz Moura de Oliveira | @bibimoura | não | sim |

Anna Beatriz entrou em 07/10/2026, durante a Sprint #3; por isso não aparece nas Sprints 1 e 2.

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

## 4. Sprints

Cada sprint tem o seu arquivo. Para trabalhar, abra só o da sprint atual.

| Sprint | O que entrega | Situação | Arquivo |
|---|---|---|---|
| #1 | Fundação: projeto Expo, tema, tipos, tela inicial | Concluída (não aceita como release) | [`sprint-1.md`](sprints/sprint-1.md) |
| #2 | Chat com o tutor socrático, com IA de verdade, publicado | Concluída | [`sprint-2.md`](sprints/sprint-2.md) |
| #3 | Entrar: login, papéis, turma por código, conversa salva | **Em andamento** | [`sprint-3.md`](sprints/sprint-3.md) |
| #4 | Matéria e material: tópicos, PDF do professor, trilha | Proposta | [`sprint-4.md`](sprints/sprint-4.md) |

Depois da Sprint #4 vem o refinamento (painel do professor e acabamento), descrito no fim do
[`sprint-4.md`](sprints/sprint-4.md).

O desenho técnico que as sprints seguem — pastas, tabelas, rotas e quem pode chamar cada uma —
está em [`arquitetura.md`](arquitetura.md).

## 5. Regras de trabalho

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
