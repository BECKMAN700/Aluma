# Aluma — Requisitos Funcionais

## 1. Objetivo e escopo do documento

Este documento especifica os Requisitos Funcionais (RF) para a versão 1.0 (V1) da plataforma **Aluma**. Os requisitos funcionais descrevem o comportamento observável do sistema — o que a plataforma faz em resposta a entradas e eventos —, estabelecendo as regras de negócio e os critérios de aceitação testáveis que guiarão o desenvolvimento e a validação do produto.

As especificações contidas neste documento derivam diretamente da constituição do projeto (`PROJECT-CONTEXT.md`) e da modelagem de domínio tipada (`types/aluma.ts`).

---

## 2. Atores

| Ator | Descrição |
|---|---|
| **Aluno** | Usuário final estudante (foco inicial: 9º ano do Ensino Fundamental). Utiliza a plataforma para acompanhar sua trilha de aprendizagem, interagir com o tutor socrático via IA e realizar exercícios. É vinculado à turma pelo professor e não possui autocadastro. |
| **Professor** | Usuário docente responsável pela gestão pedagógica das turmas. Cadastra conteúdos, vincula alunos às turmas, acompanha relatórios agregados de desempenho e identifica defasagens de aprendizagem da turma. |
| **Administrador** | Usuário responsável pela gestão institucional, cadastro e controle de acesso das escolas na plataforma. |

---

## 3. Como ler um requisito

Cada requisito funcional é apresentado através de uma ficha padronizada composta pelos seguintes campos:

- **ID e Título**: Identificador único prefixado por `RF` e nome sucinto da funcionalidade.
- **Atores**: Tipos de usuários que interagem com ou se beneficiam da funcionalidade.
- **Prioridade**: Grau de essencialidade para o funcionamento e proposta de valor da V1.
- **Origem**: Rastreabilidade direta para a seção e item correspondente no `PROJECT-CONTEXT.md`.
- **Regras de negócio**: Códigos das regras de negócio que governam a funcionalidade.
- **Caso de uso**: Identificador do caso de uso detalhado.
- **Descrição**: Explicação comportamental do que o sistema executa (sem descrever elementos de interface gráfica, cores ou layout).
- **Critérios de aceite**: Lista de condições objetivas e testáveis que definem se o requisito foi atendido.
- **Observações**: Riscos, decisões de arquitetura ou planos de contingência associados.

---

## 4. Requisitos funcionais

### RF01 — Autenticação por e-mail institucional e controle de papéis

| Campo | Valor |
|---|---|
| **Atores** | Aluno, Professor, Administrador |
| **Prioridade** | Essencial — sem isso nada mais funciona |
| **Origem** | `PROJECT-CONTEXT.md` §3 item 1; decisão de login em §6 |
| **Regras de negócio** | RN01, RN03 |
| **Caso de uso** | UC01 |

**Descrição.** O sistema autentica a pessoa pelo e-mail institucional fornecido pela escola e, a partir do papel associado à conta, libera funcionalidades distintas para aluno, professor e administrador. O aluno não se cadastra sozinho: é o professor quem o coloca na turma.

**Critérios de aceite.**

- [ ] O sistema aceita autenticação apenas de e-mail pertencente a uma escola cadastrada.
- [ ] Cada conta tem exatamente um papel entre aluno, professor e administrador.
- [ ] Uma conta de aluno só acessa funcionalidades de aluno; o mesmo vale para os demais papéis.
- [ ] Tentativa de acesso a funcionalidade de outro papel é negada, e a negação é registrada em log (ver RNF09).
- [ ] Não existe autocadastro de aluno.

**Observações.** O `PROJECT-CONTEXT.md` §8 registra o risco de aluno de escola pública não ter e-mail institucional. O plano B previsto é código de turma. Enquanto a validação de campo não confirmar, o requisito permanece como está.

---

### RF02 — Professor cadastra turma e vincula alunos

| Campo | Valor |
|---|---|
| **Atores** | Professor, Administrador |
| **Prioridade** | Essencial |
| **Origem** | `PROJECT-CONTEXT.md` §3 item 2; decisões de turma em §6 |
| **Regras de negócio** | RN02, RN04 |
| **Caso de uso** | UC02 |

**Descrição.** O sistema permite que o professor cadastre turmas associadas à sua escola e série/disciplina, e vincule os alunos pertencentes a cada turma utilizando seus identificadores institucionais. O sistema mantém o vínculo de dados entre a turma (`Classroom`), o professor responsável (`teacherId`), a escola (`schoolId`) e a lista de alunos matriculados (`studentIds`).

**Critérios de aceite.**

- [ ] O sistema permite ao professor cadastrar uma turma informando nome, série e escola.
- [ ] O sistema permite ao professor vincular alunos a uma turma existente através do e-mail/identificador institucional do aluno.
- [ ] Cada aluno só pode estar vinculado a exatamente uma turma na V1.
- [ ] O professor pode gerenciar múltiplas turmas, mas nenhum aluno pode pertencer a múltiplas turmas.
- [ ] O sistema impede a inclusão de alunos pertencentes a outra escola na turma de um professor.
- [ ] O sistema impede que alunos criem, editem ou removam vínculos de turma.

---

### RF03 — Professor cadastra o conteúdo da matéria

| Campo | Valor |
|---|---|
| **Atores** | Professor |
| **Prioridade** | Essencial |
| **Origem** | `PROJECT-CONTEXT.md` §3 item 2; Recorte de conteúdo em §3; §6 |
| **Regras de negócio** | RN05 |
| **Caso de uso** | UC03 |

**Descrição.** O sistema permite ao professor cadastrar, estruturar e editar o plano de tópicos pedagógicos da sua disciplina (ex.: ementa de Matemática do 9º ano alinhada à BNCC). O conteúdo cadastrado funciona como delimitador oficial do escopo de conhecimento utilizado pelo tutor socrático de IA e pelo gerador de exercícios.

**Critérios de aceite.**

- [ ] O sistema permite ao professor cadastrar tópicos e conteúdos programáticos vinculados à sua disciplina (`Subject`).
- [ ] O sistema restringe o escopo de atuação da IA estritamente ao conteúdo pedagógico cadastrado pelo professor.
- [ ] O sistema permite ao professor editar, reordenar ou desativar tópicos do programa de estudos de sua turma.
- [ ] O conteúdo cadastrado fica associado à disciplina e visível aos alunos matriculados nas turmas daquela disciplina.

---

### RF04 — Trilha do aluno: tópicos com status (não iniciado / em andamento / dominado)

| Campo | Valor |
|---|---|
| **Atores** | Aluno, Professor |
| **Prioridade** | Essencial |
| **Origem** | `PROJECT-CONTEXT.md` §3 item 3 |
| **Regras de negócio** | RN06 |
| **Caso de uso** | UC04 |

**Descrição.** O sistema exibe para o aluno sua trilha individual de aprendizagem dividida nos tópicos da disciplina. O sistema controla e atualiza automaticamente o estado de progresso de cada tópico entre três status possíveis: "não iniciado", "em andamento" e "dominado".

**Critérios de aceite.**

- [ ] Todo tópico recém-cadastrado na disciplina assume o status inicial de "não iniciado" para o aluno.
- [ ] O sistema transiciona o status do tópico para "em andamento" assim que o aluno realiza a primeira interação no chat socrático ou responde a um exercício referente àquele tópico.
- [ ] O sistema transiciona o status do tópico para "dominado" quando o aluno atinge a taxa mínima exigida de acerto e desempenho nos exercícios do tópico.
- [ ] O sistema permite ao aluno consultar o seu progresso geral e o status de cada tópico em sua trilha.
- [ ] O professor pode consultar o status de cada aluno da turma nos tópicos da disciplina.

---

### RF05 — Chat de tutoria socrática sobre um tópico

| Campo | Valor |
|---|---|
| **Atores** | Aluno |
| **Prioridade** | Essencial — diferencial do produto |
| **Origem** | `PROJECT-CONTEXT.md` §3 item 4; decisões de tutoria e escopo em §6; Regra inviolável 6 em §7 |
| **Regras de negócio** | RN07, RN08, RN09 |
| **Caso de uso** | UC05 |

**Descrição.** O sistema disponibiliza uma interface de chat de tutoria orientada pela metodologia socrática. Ao interagir com o aluno sobre um determinado tópico (`Question` e `Message`), a IA atua como tutora encorajando a reflexão, fazendo perguntas investigativas e oferecendo pistas ou exemplos, recusando-se terminantemente a fornecer respostas prontas ou resolver trabalhos escolares.

**Critérios de aceite.**

- [ ] O sistema permite ao aluno iniciar e dar continuidade a uma sessão de tutoria socrática vinculada a um tópico específico da trilha.
- [ ] O tutor de IA nunca entrega a resposta final de uma questão ou exercício, nem fornece a solução pronta.
- [ ] O tutor de IA recusa e interrompe interações sobre conteúdos não escolares ou fora do escopo da disciplina cadastrada.
- [ ] As mensagens trocadas são armazenadas com identificação de autor (`student` ou `tutor`) e data/hora em ISO 8601 (`sentAt`).
- [ ] O histórico de conversas do aluno é mantido até o encerramento do ano letivo / mudança de turma, e o aluno não tem permissão para apagar ou alterar mensagens registradas.

---

### RF06 — Exercícios com correção e explicação do erro

| Campo | Valor |
|---|---|
| **Atores** | Aluno |
| **Prioridade** | Essencial |
| **Origem** | `PROJECT-CONTEXT.md` §3 item 5; decisões de falha da IA em §6 |
| **Regras de negócio** | RN10, RN11 |
| **Caso de uso** | UC06 |

**Descrição.** O sistema disponibiliza exercícios práticos associados aos tópicos de estudo, avalia as respostas submetidas pelo aluno e provê feedback imediato detalhando o motivo do erro e orientando o raciocínio correto, sem entregar a resposta pronta de maneira passiva.

**Critérios de aceite.**

- [ ] O sistema apresenta exercícios pertinentes ao tópico selecionado pelo aluno na trilha.
- [ ] Em caso de resposta incorreta, o sistema exibe uma explicação pedagógica sobre o erro cometido, orientando os conceitos que precisam ser revisados.
- [ ] O resultado obtido pelo aluno nos exercícios alimenta a atualização de status da trilha (RF04) e os relatórios do painel do professor (RF07).
- [ ] Em situações de indisponibilidade ou falha do serviço de IA, o sistema alterna automaticamente para um repositório de exercícios estáticos de reserva, mantendo o funcionamento contínuo.

---

### RF07 — Painel do professor: diagnóstico de onde a turma trava

| Campo | Valor |
|---|---|
| **Atores** | Professor |
| **Prioridade** | Essencial |
| **Origem** | `PROJECT-CONTEXT.md` §3 item 6; visibilidade e isolamento em §6; Regra inviolável 7 em §7 |
| **Regras de negócio** | RN12, RN13 |
| **Caso de uso** | UC07 |

**Descrição.** O sistema disponibiliza ao professor um painel de diagnóstico consolidado indicando o progresso da turma, sinalizando graficamente os tópicos em que os alunos travam ou encontram maiores dificuldades, e indicando pontos recomendados para reforço em sala de aula.

**Critérios de aceite.**

- [ ] O painel apresenta indicadores resumidos e estatísticos sobre o aproveitamento da turma por tópico e por aluno.
- [ ] O sistema destaca automaticamente os tópicos que apresentam alta taxa de erro ou retenção nos exercícios.
- [ ] O sistema preserva a privacidade do aluno: o professor visualiza relatórios agregados e tópicos com dificuldades, mas não tem acesso à íntegra das conversas privadas do chat socrático.
- [ ] O sistema aplica isolamento rigoroso de dados: um professor só pode visualizar relatórios de suas próprias turmas e da sua escola vinculada.

---

## 5. Fora do escopo da V1

Conforme estabelecido no `PROJECT-CONTEXT.md` §3, os seguintes recursos foram declarados explicitamente fora do escopo da versão 1.0 (V1) e não serão desenvolvidos nesta etapa:

- **Gamificação e pontos de experiência (XP)**;
- **Notificações push e por e-mail**;
- **Relatório executivo para coordenação pedagógica**;
- **Painel de acesso do responsável (pais/tutores)**;
- **Módulo de correção automática de redação**;
- **Gerador automático de resumos e flashcards**;
- **Modo de funcionamento offline**;
- **Chat e interação direta entre alunos** (excluído permanentemente por diretriz do produto).

---

## 6. Pendências

- **Consentimento de menores (LGPD)**: Definir e validar o mecanismo operacional para coleta e registro de consentimento dos pais/responsáveis para menores de idade (`PROJECT-CONTEXT.md` §6 e §9).
- **Validação de e-mail de alunos em escolas públicas**: Confirmar em testes de campo se alunos da rede pública possuem e-mail institucional ativo ou se haverá necessidade de acionar o plano B (autenticação via código de turma) (`PROJECT-CONTEXT.md` §8).
- **Alinhamento com ementa acadêmica**: Aguardar retorno formal dos professores das disciplinas de Desenvolvimento Webmobile e Projeto de Sistemas quanto ao provimento da API REST e entregáveis exigidos (`PROJECT-CONTEXT.md` §9).
