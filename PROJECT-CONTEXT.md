# Aluma — Contexto do Projeto

> Documento vivo. É a **constituição** do projeto: o que vale hoje.
> Antes de abrir qualquer discussão sobre "e se a gente fizesse...", consulte aqui.
> Este arquivo é carregado em toda sessão de IA: mantenha curto. O porquê de cada decisão fica
> em [`docs/decisoes.md`](docs/decisoes.md); o desenho técnico, em
> [`docs/arquitetura.md`](docs/arquitetura.md).
>
> Versão 0.2 — 07/10/2026 — o projeto passa a ter login, banco de dados, turma e material.

---

## 1. Problema e usuário

**Dor (aluno):** o aluno não tem um guia que entenda *o que especificamente* ele não entendeu. Muitos também não sabem **o que** estudar nem **como** estudar — e é dessa falta de direção que nasce o desinteresse. As alternativas atuais são o ChatGPT (que a maioria não sabe usar, e que entrega a resposta pronta) ou professor particular (que custa dinheiro).

**Dor (escola):** a escola hoje ou proíbe a IA ou finge que ela não existe. Nos dois casos o aluno usa mesmo assim, sem supervisão, para copiar resposta. A escola não tem controle, não tem visibilidade e não tem dado sobre onde a turma está travando.

**Usuário que paga:** a escola (rede privada) ou a secretaria de educação (rede pública).
**Usuário que usa:** aluno e professor.
**Etapa de ensino:** fundamental primeiro; médio depois.

## 2. Proposta de valor

Para o **aluno**: um tutor que nunca entrega a resposta. Ele mostra o que estudar, como estudar, dá exemplos e obriga o aluno a pensar até chegar sozinho.

Para o **professor**: ele alimenta o conteúdo da matéria, vê o desempenho da turma, recebe da IA o mapa de onde cada aluno travou e dicas do que reforçar em aula.

Para a **escola**: controle sobre a IA que os alunos já usam de qualquer jeito — com uso restrito a fins educacionais, resistência à cola por construção, e conformidade com LGPD para menores.

**A frase do pitch (rascunho a lapidar):** *"Seus alunos já usam IA para copiar resposta. O Aluma é a IA que a escola controla — e que se recusa a dar a resposta."*

## 3. Escopo

### Dentro da V1

| # | Funcionalidade | Quando |
|---|---|---|
| 1 | Login por e-mail e senha, papéis aluno/professor/admin | Sprint 3 |
| 2 | Professor cria turma; aluno entra por código | Sprint 3 |
| 3 | Chat de tutoria socrática, com a conversa salva | Feito na Sprint 2; salvo na Sprint 3 |
| 4 | Professor cadastra matéria, tópicos e o material (PDF) de cada tópico | Sprint 4 |
| 5 | Trilha do aluno: tópicos com status (não iniciado / em andamento / dominado) | Sprint 4 |
| 6 | Chat ligado ao tópico, usando o material do professor | Sprint 4 |
| 7 | Painel do professor: onde a turma está travando | Refinamento |
| 8 | Aluno pede questões e o tutor corrige guiando | Refinamento |

O detalhe de cada sprint está em [`docs/sprints.md`](docs/sprints.md).

### Fora da V1 (roadmap, aparecem no pitch como visão)

Gamificação/XP, notificações, relatório para coordenação, painel do responsável, correção de
redação, resumos e flashcards, modo offline, streaming da resposta, chat entre alunos (esse
último está fora **permanentemente**).

### Recorte de conteúdo

Público: ensino fundamental. Demonstração com **Matemática, 9º ano**: currículo BNCC bem
documentado, é onde a tutoria socrática mais brilha, e é fácil de mostrar em vídeo. A matéria e
os tópicos são cadastrados pelo professor, então o produto não fica preso a esse recorte.

## 4. Stack

A ementa de Desenvolvimento Webmobile (UFT/Palmas, Prof. Jackson Gomes) define o app. O resto é
decisão da equipe.

| Camada | Tecnologia | Origem |
|---|---|---|
| App (web + mobile, mesmo código) | **React Native + Expo**, **TypeScript**, Expo Router | Exigido pela ementa |
| Testes + CI | Lint e testes a cada PR, GitHub Actions | Ementa, encontros 15–16 |
| Backend | **Python + FastAPI**, em `backend/`, hospedado no Render (gratuito) | Decisão da equipe |
| Banco de dados e login | **Supabase** (Postgres + Auth), plano gratuito | Decisão da equipe |
| IA | **Claude Haiku 4.5**, teto de US$ 3/mês, com **Google Gemini** gratuito de reserva | Decisão da equipe |
| App web publicado | **Netlify**, plano gratuito | Decisão da equipe |

**Distribuição:** aplicação universal — roda no navegador e no celular a partir do mesmo
código. **Web primeiro, loja fica para depois.**

## 5. Arquitetura em uma imagem mental

```
App Expo ── e-mail e senha ──> Supabase Auth ──> devolve um token
App Expo ── token em toda chamada ──> FastAPI (Render) ──> Postgres (Supabase)
                                            └──> Claude (Gemini de reserva)
```

Três regras que definem tudo:

1. **A chave da API de IA nunca fica no app.** Toda chamada de IA passa pelo servidor.
2. **O app não decide regra de negócio.** Quem pode ver o quê é decidido no servidor, sempre.
3. **O app fala com o Supabase só para login.** Todo dado passa pelo FastAPI.

O mapa completo — pastas, tabelas, rotas e quem pode chamar cada uma — está em
[`docs/arquitetura.md`](docs/arquitetura.md).

## 6. Decisões fechadas

Uma linha por decisão, só o que vale hoje. O porquê, a data e as alternativas descartadas estão
em [`docs/decisoes.md`](docs/decisoes.md).

| Decisão | Escolha |
|---|---|
| Tutoria | **Nunca entrega a resposta pronta.** Guia, exemplifica, pergunta de volta. É o diferencial e a defesa anti-cola |
| Escopo de assunto | Só assunto educacional; fora disso, recusa |
| Login | E-mail e senha, pelo Supabase. Sem e-mail de confirmação e sem "esqueci a senha" na fase de apresentação |
| Papéis | Quem cria conta pelo app é aluno. Conta de professor e escola são criadas pela equipe |
| Turmas | Aluno entra por código e pertence a **uma** turma; professor tem **várias** |
| Visibilidade do professor | Vê **resumo** do desempenho, não a conversa crua |
| Isolamento | Professor **jamais** vê aluno de outra turma ou de outra escola |
| Histórico | A conversa do aluno fica salva no servidor |
| Material do professor | PDF ligado a um tópico; só o texto daquele tópico vai para a IA |
| Falha da IA | Erro explícito e claro. Nunca inventar |
| Offline e recursos do aparelho | Fora da V1 (sem câmera, microfone, push) |
| Acessibilidade | Básico: teclado, contraste, rótulo para leitor de tela |
| Peso do app | O mais leve possível; precisa abrir em 3G e celular fraco |
| Infra | R$ 0/mês, só camada gratuita; subdomínio grátis na demo |
| Interface | Duas linguagens visuais: sóbria para professor, viva para o aluno |
| Modelo de receita | Licença por escola por ano |
| Métrica de sucesso | Aluno ativo por semana |
| Dados de demonstração | Script de seed com escola, professor e turma fictícios, isolado do caminho de produção |
| Divisão do trabalho | Fatias verticais por funcionalidade, não por camada |
| Decisão final | João Pedro Beckman |
| Modo de trabalho com a IA assistente | A IA implementa a solução inteira, em nível sênior, e explica o porquê; quem commita precisa saber explicar o código |
| Backend | Python + FastAPI, no mesmo repositório, organizado por assunto. No Render gratuito (dorme após 15 min) |
| Banco de dados | Postgres no Supabase. Todo dado passa pelo FastAPI; tabelas trancadas com RLS |
| App web | Netlify gratuito. Produção publica a `main`; a `develop` e cada PR ganham link de teste |
| IA principal | Claude Haiku 4.5 (`claude-haiku-4-5-20251001`), versão fixa, crédito pré-pago com teto de US$ 3/mês |
| IA de reserva | Google Gemini (`gemini-3.5-flash-lite`), versão fixa, tier gratuito |
| LangChain e busca por similaridade | Não usar |
| Limite de requisições | Por usuário |
| Streaming | Cortado |
| LGPD | Suspensa na fase de apresentação (ver §7, regra 8) |

## 7. Regras invioláveis

1. Ninguém trabalha direto na `main` nem na `develop`. Tudo por branch + PR revisado.
2. Chave de API, senha ou segredo **nunca** no código, no commit, na URL ou no log.
3. Toda entrada do usuário é hostil até prova em contrário: valide no servidor.
4. Em erro ou dúvida sobre permissão: **negue e pare**. Nunca "deixa passar por enquanto".
5. Nada de dado falso ou mock no caminho de produção. Seed é isolado e sinalizado.
6. A IA nunca entrega a resposta do exercício. É requisito de produto, não preferência.
7. Nenhum dado de aluno cruza a fronteira da turma/escola.
8. **Suspensa na fase de apresentação (decisão do João, 07/10/2026):** LGPD com regra dura para
   menores, consentimento dos pais e exclusão sob pedido. A demonstração usa contas fictícias.
   Volta a valer, e precisa ser cumprida, antes de qualquer uso com aluno real.

## 8. Riscos conhecidos

| Risco | Gravidade | Como estamos tratando |
|---|---|---|
| Escopo maior que o prazo | **Alta** | Três fatias em ordem de dependência (§3). Cada release é um roteiro que precisa passar inteiro |
| Zero validação com escola ou aluno real | **Alta** | Adiada por decisão do João (28/09). Ver §10 |
| Três serviços gratuitos podem cair na demo (Render, Supabase, Netlify) | **Alta** | Ping agendado, checklist de véspera de demo, Gemini de reserva para a IA |
| Equipe aprendendo Supabase e SQL enquanto entrega | Alta | Contrato escrito em `docs/arquitetura.md`; mesmo formato em toda pasta do backend |
| Teto de US$ 3/mês da IA: cerca de 500 mensagens com material | Média | Limite de tamanho do material; serve para demonstração, não para turma usando todo dia |
| Cold start do Render (cerca de 1 min) | Média | O app avisa que o tutor está acordando; ping agendado das 7h às 23h |
| Supabase pausa o projeto após 7 dias sem uso | Média | O mesmo ping toca o banco |
| Sem recuperação de senha | Baixa na demo | Contas de demonstração; ligar exige domínio próprio |
| IA alucinar em conteúdo escolar | Média | Restringir ao material do professor; bateria anti-cola a cada mudança de prompt |
| Material do professor tentar dar ordens à IA | Média | O material entra como conteúdo, não como instrução; caso de teste na bateria |
| LGPD suspensa | **Alta se houver uso real** | Só contas fictícias até a regra 8 voltar |
| Tier gratuito do Gemini pode usar os prompts para treinar modelos | Baixa na demo | O Gemini é reserva e só recebe conversa quando o Claude falha |

## 9. Pendências

**Para o professor de Desenvolvimento Webmobile:**

1. Há restrição de linguagem ou framework no servidor? (Python/FastAPI e Supabase foram escolha
   da equipe.)
2. A UFT oferece infraestrutura própria para publicar o app?

**Para o professor de Projeto de Sistemas:**

3. Quais artefatos além do Supernova serão cobrados (documento de requisitos, UML, cronograma)?
4. A apresentação da Release 3 é em 19/10?

**Da equipe:**

5. Criar o projeto no Supabase e conferir os limites atuais do plano gratuito.
6. Confirmar que a Anna Beatriz consegue trabalhar em Python.
7. Enviar a logo provisória.

## 10. Ação urgente — validação

O Supernova avalia validação, e hoje ela é **zero**: nenhuma conversa com aluno, professor ou diretor. Os módulos vão de 28/08 a 08/10 e a entrega do pitch fecha em 22/10. A janela para conseguir evidência é **agora**.

Meta mínima para as próximas duas semanas:
- Formulário respondido por **30+ alunos** do fundamental/médio (dá para rodar em grupo de WhatsApp de escola, primo, vizinho)
- **3 conversas** de 20 minutos com professores
- **1 conversa** com um coordenador ou diretor

Isso é barato, cabe no fim de semana, e é a diferença entre "achamos que" e "perguntamos para 34 pessoas e 71% disseram".

## 11. Equipe

A equipe não é a mesma nas duas disciplinas. Quem está nas duas carrega tanto o
código quanto os artefatos da Supernova; quem está só em uma responde por aquela frente.

| Nome | Função | GitHub | Web/Mobile | Projeto de Sistemas |
|---|---|---|---|---|
| João Pedro Beckman | Responsável pelo projeto, decisão final | @BECKMAN700 | sim | sim |
| Giordano Bruno de Moura Fragoso Santos | Desenvolvedor | @GiordanOBru | sim | sim |
| Thales Rafael | Desenvolvedor | @thalesrafael10 | sim | sim |
| Antonio Carlos | Desenvolvedor | @Acgsop | sim | não |
| Iagor | Desenvolvedor | @iagorlrnc | sim | não |
| Flávio | Desenvolvedor | @flaviohen16 | não | sim |
| Gustavo Bringel | Desenvolvedor | @GustavoBringel | não | sim |
| Anna Beatriz Moura de Oliveira | Desenvolvedora | @bibimoura | não | sim |

Anna Beatriz entrou em 07/10/2026, durante a Sprint #3.

Ferramentas: GitHub (código, Issues, PR) + Trello (cronograma).

## 12. Calendário

> 🔄 **Atualizado em 12/09/2026** com o plano de ensino oficial de Projeto de Sistemas
> 2026-2 (Prof. Edeilson Milhomem). As datas de pitch (09/10–22/10) e banca (26/10–16/11) da
> versão anterior deste documento pareciam superadas por esse plano de ensino, mais recente e
> específico — foram substituídas pelas datas abaixo. Se havia um motivo para manter as datas
> antigas, vale a equipe confirmar antes da próxima revisão.

| Data | Marco |
|---|---|
| 26/08 | Supernova — evento de boas-vindas |
| Encontro 2 da disciplina | Descoberta: problema, personas, backlog, repositório configurado |
| Encontro 7 | MVP navegável com dados locais |
| 24/ago–13/set | Sprint #1 → Release 1 (definição de projeto/equipe, BMC, escopo) |
| 14/set–27/set | Sprint #2 → Release 2 |
| Encontro 13 | Integração com API real (alinha com a Sprint #3, ver `docs/sprints.md`) |
| 28/set–18/out | Sprint #3 → Release 3 |
| 19/out–01/nov | Sprint #4 → Release 4 |
| 09/11 e 16/11 | Refinamento do produto e preparação das apresentações finais |
| 23/11 e 30/11 | Banca de apresentação final — parte técnica |
| Encontro 16 | Entrega final: demo, distribuição, documentação, retrospectiva |
| 07/12 | Startup-SE Demo Day — banca final de pitch, banca externa |

O detalhamento sprint a sprint — o que cada uma entrega e quem responde por cada item — está
em [`docs/sprints.md`](docs/sprints.md).

## 13. Referências externas

Material oficial da disciplina de Desenvolvimento Webmobile (Prof. Jackson Gomes de Souza,
UFT/Palmas). Antes de assumir o que a ementa exige ou não exige — versão de ferramenta, formato
de entrega, restrição de stack — acesse o link e confira; não decida de memória.

| Referência | Link |
|---|---|
| Site/material da disciplina | https://jacksongomesbr.github.io/uft-cc-dwm/ |
| Repositório fonte do material | https://github.com/jacksongomesbr/uft-cc-dwm |
| App de exemplo do professor ("Mini Mural", cobre os primeiros encontros, em branches por capítulo) | https://github.com/jacksongomesbr/uft-cc-dwm-mini-mural |

O "Mini Mural" é o jeito mais confiável de saber contra qual versão de Expo/React Native/
TypeScript o professor está ensinando **no momento** — o `package.json` dele mostra a versão de
referência atual, que pode mudar ao longo do semestre.