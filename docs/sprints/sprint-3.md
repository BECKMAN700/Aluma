# Sprint #3 (28/set–18/out) — Release 3: entrar

> Sprint atual. Índice em [`../sprints.md`](../sprints.md). O desenho técnico (tabelas, rotas,
> permissões) está em [`../arquitetura.md`](../arquitetura.md): **leia antes de codar**.

Até a Release 2 o Aluma era um chat aberto: sem conta, sem turma, sem professor. A Sprint #3
coloca a base que faltava para o produto existir: **banco de dados, login, papéis e turma**.
Sem isso não há material do professor, nem trilha, nem painel.

Plano fechado em 07/10, no dia 10 dos 21 da sprint. Até aqui só entraram correções do tutor
(PRs #77 a #83). Sobram 11 dias, e a equipe agora tem oito pessoas.

**Trade-offs aceitos (decisão do João, 07/10):**

- A trilha de tópicos, que estava proposta para esta sprint, vai para a Sprint #4. Login e
  turma vêm antes porque todo o resto depende deles.
- O streaming foi cortado do projeto: a resposta tem de 3 a 5 linhas e chega em 1 a 2 segundos.
- Sem e-mail de confirmação e sem "esqueci a senha": o envio gratuito do Supabase só alcança
  e-mails da própria equipe.
- A conta do professor é criada pela equipe, não pelo app (ver `arquitetura.md` §4).

Continua de fora: matéria, tópicos, material, trilha, exercícios e painel do professor.

## 1. Roteiro de demonstração (critério de aceite da Release 3)

1. O professor abre a URL pública, entra com a conta que a equipe criou e cai na **área do
   professor**.
2. Cria a turma "9º A" e recebe um **código** de seis caracteres.
3. Em outro navegador, um aluno toca em **Criar conta**, informa nome, e-mail e senha.
4. O aluno digita o código da turma e entra nela. Código errado mostra erro claro.
5. O aluno conversa com o tutor, que continua sem entregar a resposta.
6. O aluno fecha e reabre o app: continua logado e a conversa está lá.
7. O professor atualiza a tela e vê o aluno na lista da turma. Não vê a conversa.
8. O aluno tenta abrir o endereço da área do professor: é mandado de volta para a área dele.
9. Os testes automáticos mostram que o professor de uma escola não enxerga a turma de outra.
10. Tudo acima a 320px de largura, sem corte nem rolagem lateral
    ([`../layout-flexbox.md`](../layout-flexbox.md)).

## 2. Backend

| Entrega | Descrição | Pasta | Responsável |
|---|---|---|---|
| Banco no ar | Projeto no Supabase, tabelas da Sprint 3, conexão do backend, contas de demonstração (uma escola, um professor), variáveis no Render | `migrations/`, `nucleo/db.py` | João |
| Quem é você | Conferir o token do Supabase e montar o `Usuario` (id, papel, escola); criar o perfil de aluno no primeiro acesso | `nucleo/auth.py` | Giordano |
| Chat logado e salvo | `POST /api/chat` exige login e grava as mensagens; `GET /api/conversas/atual` devolve a conversa em andamento | `chat/` | Giordano |
| Permissões | `exige_professor`, `exige_dono_da_turma`, `exige_aluno`; testes tentando furar (aluno em rota de professor, professor de outra escola) | `nucleo/permissoes.py` | Gustavo |
| Limite por usuário | O limite de requisições passa a contar por conta, não por IP: uma turma inteira no Wi-Fi da escola sai por um IP só | `nucleo/rate_limit.py` | Gustavo |
| Postgres no CI | O CI sobe um Postgres temporário e aplica as migrations, para os testes rodarem contra SQL de verdade | `.github/workflows/ci.yml` | Gustavo |
| Turmas do professor | Criar turma (gera o código), listar as minhas turmas, ver os alunos de uma turma | `turmas/` | Flávio |
| Entrar na turma | `POST /api/matriculas` com o código, tratando código errado e aluno que já tem turma; `GET /api/me` devolvendo perfil e turma | `turmas/` | Anna Beatriz |
| Persona do tutor | O tutor ganha nome e um jeito de falar para o fundamental, sem perder a regra socrática; a bateria anti-cola roda de novo | `chat/prompt.py` | Thales |

## 3. App

| Entrega | Descrição | Pasta | Responsável |
|---|---|---|---|
| Login no app | Cliente do Supabase, sessão salva no aparelho, `entrar`, `criarConta`, `sair`; o token vai em toda chamada ao backend | `services/auth.ts`, `services/api.ts` | Antonio |
| Telas por papel | O layout raiz lê a sessão e o `GET /api/me` e manda cada um para o seu grupo de telas: sem login, aluno sem turma, aluno, professor | `app/_layout.tsx` | Antonio |
| Entrar e criar conta | Duas telas, com validação dos campos e erro claro (senha fraca, e-mail já usado, sem internet) | `app/(auth)/` | Iagor |
| Código da turma e início do aluno | Tela para digitar o código; início do aluno com o nome da turma e a entrada para o tutor | `app/(aluno)/` | Iagor |
| Área do professor | Lista de turmas, criar turma, tela da turma com o código em destaque e a lista de alunos | `app/(professor)/` | Thales |
| GitHub Release e ficha | Release publicada com o roteiro acima, a URL e o que ficou de fora | — | João |

## 4. Divisão do trabalho, peso e dependências

Nota individual nas duas disciplinas: todo mundo entrega código próprio que consegue defender.
Peso de 1 (pequeno) a 4 (difícil).

| Pessoa | Disciplina | Tarefas | Peso |
|---|---|---|---|
| João | as duas | Banco no ar (4), Release e ficha (1) | 5 |
| Giordano | as duas | Quem é você (3), chat logado e salvo (3) | 6 |
| Gustavo | Proj. Sistemas | Permissões e testes de isolamento (3), limite por usuário (1), Postgres no CI (1) | 5 |
| Flávio | Proj. Sistemas | Turmas do professor (3), testes (1) | 4 |
| Anna Beatriz | Proj. Sistemas | Entrar na turma (2), `GET /api/me` (1), testes (1) | 4 |
| Thales | as duas | Área do professor (3), persona do tutor (2) | 5 |
| Antonio | Web/Mobile | Login no app (3), telas por papel (2) | 5 |
| Iagor | Web/Mobile | Entrar e criar conta (3), código da turma e início do aluno (2) | 5 |

A Anna entra no backend, numa fatia pequena e fechada, porque está só em Projeto de Sistemas e
chega com a sprint andando. Suposição a confirmar: ela consegue trabalhar em Python.

**O que destrava quem:**

- **O `arquitetura.md` é o contrato.** Tabelas, rotas e o formato do `Usuario` estão escritos
  lá. Cada um programa contra o que está escrito, sem esperar o PR do outro.
- **qui 08/10 — PR de organização do repositório mergeado.** Ele move os arquivos do backend
  para as pastas novas. Ninguém abre branch de código antes dele, senão todo mundo conflita.
- **sex 09/10 — banco no ar com as tabelas (João).** Até lá, Flávio, Anna e Gustavo escrevem as
  consultas e os testes contra as tabelas do `arquitetura.md`.
- **seg 12/10 — `nucleo/auth.py` na `develop` (Giordano).** Flávio, Anna e Gustavo não esperam:
  nos testes, o `usuario_atual` é substituído por um usuário de mentira (ver `arquitetura.md` §6).
- **Antonio e Iagor combinam no primeiro dia** o que `services/auth.ts` devolve em caso de erro.
  O Thales usa o mesmo serviço nas telas do professor.
- **Thales e Gustavo:** se a bateria anti-cola acusar furo depois da persona nova, o prompt
  volta atrás no mesmo dia.

| Dia | Backend | App | Processo |
|---|---|---|---|
| qua 07 – qui 08 | Todos leem o `arquitetura.md` · João: projeto Supabase | Antonio e Iagor: contrato do `services/auth.ts` | **PR de organização mergeado** · milestone e issues |
| sex 09 | **Banco no ar** | Iagor: telas de entrar e criar conta | — |
| sáb 10 – seg 12 | Giordano: auth · Flávio: turmas · Anna: matrícula · Gustavo: permissões | Antonio: login e telas por papel · Thales: área do professor | — |
| ter 13 | Giordano: chat salvo · Gustavo: limite e CI | Iagor: código da turma e início | Thales: persona e bateria |
| qua 14 | **Fluxo inteiro na `develop`** | **Fluxo inteiro na `develop`** | — |
| qui 15 – sex 16 | Correções | Correções | **Teste do roteiro inteiro, time todo** |
| sáb 17 – dom 18 | — | — | João: Release e ficha |
| seg 19 | **Apresentação** (data a confirmar com o professor) | | |

## 5. Review, issues e pontuação

A ficha do Prof. Edeilson ([`sprint-2.md`](sprint-2.md) §5.7) continua valendo, agora para
**seis** pessoas: João, Giordano, Thales, Flávio, Gustavo e Anna Beatriz. Antonio e Iagor são
avaliados em Web/Mobile e seguem a mesma prática.

A Anna entrou em 07/10 e a ficha não tem regra para quem chega no meio: ela precisa, **nesta
sprint**, de 1 PR relevante, 1 code review com pelo menos 3 linhas técnicas e 3 evidências de
engajamento (issue finalizada, reunião registrada em [`../reunioes.md`](../reunioes.md),
resposta técnica em PR de colega, tarefa no Trello).

**Matriz de review obrigatório.** Cada pessoa revisa exatamente um PR:

| PR | Autor | Revisor obrigatório |
|---|---|---|
| Banco no ar | João | Giordano |
| Quem é você + chat logado e salvo | Giordano | Gustavo |
| Permissões + limite por usuário + Postgres no CI | Gustavo | Flávio |
| Turmas do professor | Flávio | Anna Beatriz |
| Entrar na turma + `GET /api/me` | Anna Beatriz | João |
| Área do professor + persona do tutor | Thales | Antonio |
| Login no app + telas por papel | Antonio | Iagor |
| Entrar, criar conta, código da turma, início do aluno | Iagor | Thales |

O João revisa a Anna para acompanhar de perto o primeiro PR dela. A Anna revisa o Flávio porque
a matrícula dela lê a turma e o código que as rotas dele criam: é o PR que ela consegue
criticar com propriedade.

**Cada tarefa vira uma Issue** no marco Release 3, com responsável, e o PR escreve `closes #N`.

**Release 3** = roteiro da seção 1 passando inteiro na URL pública.
