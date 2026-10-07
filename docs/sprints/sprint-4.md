# Sprint #4 (19/out–01/nov) — Release 4: matéria e material 🔶 proposta

> Índice em [`../sprints.md`](../sprints.md). Desenho técnico em
> [`../arquitetura.md`](../arquitetura.md). Os responsáveis abaixo são **proposta**: fecham no
> planejamento de 19/10, conforme a Sprint #3 terminar.

Com login e turma no lugar, a Sprint #4 entrega o que faz o tutor falar **da matéria daquela
turma**: o professor organiza a matéria em tópicos e envia o material; o aluno vê a trilha e
conversa sobre um tópico.

## 1. Roteiro de demonstração (critério de aceite da Release 4)

1. O professor abre a turma, cria a matéria "Matemática" e três tópicos.
2. Envia um PDF em um tópico. PDF grande demais, ou escaneado (sem texto), é recusado com
   mensagem clara.
3. O aluno abre o app e vê a **trilha** da matéria: os tópicos em ordem, com o status de cada um.
4. Toca num tópico e conversa. O tutor usa o conteúdo do PDF do professor e continua sem
   entregar a resposta.
5. O aluno volta para a trilha: o tópico está *em andamento*. Em outro aparelho, com a mesma
   conta, o status é o mesmo.
6. O aluno marca o tópico como *dominado*.
7. Um aluno de outra turma não vê essa matéria nem esse material.

## 2. Entregas

| Entrega | Descrição | Pasta | Responsável proposto |
|---|---|---|---|
| Matéria e tópicos | Tabelas e rotas para o professor criar, ordenar e listar | `materiais/` | Flávio |
| Envio de PDF | Recebe o arquivo, confere tipo e tamanho, extrai o texto com `pypdf` e guarda o texto ligado ao tópico | `materiais/` | Giordano |
| Chat por tópico | `POST /api/chat` aceita `topico_id`; o texto do material entra no prompt, com limite de tamanho medido contra o teto de US$ 3/mês | `chat/` | Thales |
| Progresso | Status por aluno e tópico guardado no servidor | `materiais/` | Anna Beatriz |
| Bateria anti-cola com material | As perguntas-armadilha rodam em script, agora com material no prompt (inclusive material que tenta dar ordens à IA) | `chat/testes/` | Gustavo |
| Trilha do aluno | Caminho visual com os tópicos e o progresso | `app/(aluno)/` | Iagor |
| Matéria e material no app | Telas do professor para criar matéria, tópicos e enviar o PDF | `app/(professor)/` | Antonio |
| Ping agendado, Release e ficha | GitHub Actions chamando `/health` das 7h às 23h, para o Render não dormir e o Supabase não pausar | `.github/workflows/` | João |

A matriz de review é montada junto com os responsáveis, no formato da Sprint #3.

**Release 4** = roteiro da seção 1 passando inteiro na URL pública. Fecha as 4 sprints.

## 3. Depois: refinamento (02/nov–16/nov)

Fase prevista no plano de ensino para refinar o produto antes da banca técnica (23 e 30/nov) e
do Demo Day (07/dez).

| Entrega | Descrição |
|---|---|
| Painel do professor | Em que tópico a turma mais trava e em quê. Ao fim da conversa, a IA resume a dificuldade do aluno e o painel soma por tópico |
| Aluno pede questões | O tutor propõe exercícios do tópico e corrige guiando |
| Visual do aluno | Acabamento da trilha e do chat para o público do fundamental |
| Checklist de véspera de demo | Crédito da IA, chave válida, créditos do Netlify, servidor acordado, banco ativo, contas de demonstração |
| Testes ponta a ponta | O roteiro inteiro, do login ao painel, contra os serviços publicados |
