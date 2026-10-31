# Aluma — Contexto do Projeto

> Documento vivo. É a **constituição** do projeto: o que vale hoje.
> Antes de abrir qualquer discussão sobre "e se a gente fizesse...", consulte aqui.
> Este arquivo é carregado em toda sessão de IA: mantenha curto. O porquê de cada decisão fica
> em [`docs/decisoes.md`](docs/decisoes.md); o desenho técnico, em
> [`docs/arquitetura.md`](docs/arquitetura.md).
>
> Versão 0.3 — 28/10/2026 — registra o Sebrae Supernova (BMC e pitch entregues), o preço e a
> saída da Anna. Detalhe do Supernova em [`docs/sebrae-supernova.md`](docs/sebrae-supernova.md).

---

## 1. Problema e usuário

**Dor (aluno):** o aluno não tem um guia que entenda *o que especificamente* ele não entendeu. Muitos também não sabem **o que** estudar nem **como** estudar — e é dessa falta de direção que nasce o desinteresse. As alternativas atuais são o ChatGPT (que a maioria não sabe usar, e que entrega a resposta pronta) ou professor particular (que custa dinheiro).

**Dor (escola):** a escola hoje ou proíbe a IA ou finge que ela não existe. Nos dois casos o aluno usa mesmo assim, sem supervisão, para copiar resposta. A escola não tem controle, não tem visibilidade e não tem dado sobre onde a turma está travando.

**Usuário que paga:** escola particular do ensino fundamental, começando por Palmas/TO como
piloto (hipótese). Na fase 2, secretaria de educação.
**Usuário que usa:** aluno do 6º ao 9º ano, em qualquer disciplina, e professor. O piloto é
Matemática, 9º ano.
**Etapa de ensino:** fundamental primeiro; médio depois.

**O dado do problema:** só 16,5% dos alunos do 9º ano têm aprendizado adequado em Matemática
(Saeb 2023); 70% dos alunos do ensino médio usam IA para tarefa e só 19% receberam orientação da
escola (TIC Educação 2024).

## 2. Proposta de valor

Para o **aluno**: um tutor que nunca entrega a resposta. Ele mostra o que estudar, como estudar, dá exemplos e obriga o aluno a pensar até chegar sozinho.

Para o **professor**: ele cria a turma e alimenta o conteúdo da matéria. Com o painel (ainda
não construído), vai ver um **resumo** de onde a turma trava e o que reforçar em aula, sem ler a
conversa do aluno.

Para a **escola**: controle sobre a IA que os alunos já usam de qualquer jeito — com uso restrito a fins educacionais e resistência à cola testada (10 de 10 ataques na [bateria](docs/bateria-anti-cola.md)). Adequação à LGPD e ao ECA Digital antes de qualquer uso com aluno real.

**Diferencial:** "não dar a resposta", sozinho, não é diferencial (Khanmigo e Auvien também são
socráticos). O argumento é o conjunto: privacidade (resumo em vez de conversa crua), controle da
escola, anti-cola testada, simplicidade, preço e suporte local.

**Honestidade no pitch:** o que não existe no app se diz no futuro ("vai acompanhar", nunca
"acompanha"). O regulamento do Supernova desclassifica por informação falsa.

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
| Modelo de receita | Licença anual **por escola**, cobrada por aluno ativo: **R$ 10 por aluno/mês** com limite de uso (hipótese, a validar com coordenadores) |
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
| Custo de IA por aluno não medido (estimativa de R$ 2 a 9/mês, com 25 mil tokens por conversa) | Média | A margem do preço depende disso; medir no painel da Anthropic com conversas reais |
| Painel do professor prometido no pitch ainda não existe | **Alta** | Sempre falar no futuro; construir antes do Demo Day |
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
**Da equipe:**

4. Criar o projeto no Supabase e conferir os limites atuais do plano gratuito.
5. Enviar a logo provisória.
6. Supernova: confirmar a entrega na plataforma e a data do resultado (lista em
   [`docs/sebrae-supernova.md`](docs/sebrae-supernova.md) §6).

## 10. Validação de campo

A validação segue em **zero**: nenhuma resposta de formulário, entrevistas aguardando resposta
(ver [`docs/validacao-de-campo.md`](docs/validacao-de-campo.md)). Ela foi adiada por decisão do
João em 28/09, e o BMC e o pitch do Supernova saíram sem ela. É o ponto mais fraco nos critérios
"Conhecimento do problema" e "Viabilidade técnica" (protótipo testado com o público).

A meta continua valendo para a banca técnica e o Demo Day:
- Formulário respondido por **30+ alunos** do fundamental/médio
- **3 conversas** de 20 minutos com professores (há mensagem pronta para o professor Melk,
  Escola Almirante Tamandaré)
- **1 conversa** com um coordenador ou diretor

Sem resposta real, nenhum número de validação aparece em pitch ou documento.

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

Anna Beatriz (@bibimoura) entrou em 07/10/2026, durante a Sprint #3, e saiu do grupo em
outubro/2026; o PR #104 (matrícula e `/api/me`) é dela.

**No Sebrae Supernova** (limite de 4 por equipe), os inscritos são João, Giordano, Flávio e
Thales. Gustavo ajudou no BMC mas não está inscrito. A equipe não tem professor orientador.

Ferramentas: GitHub (código, Issues, PR) + Trello (cronograma).

## 12. Calendário

> Duas fontes: o plano de ensino de Projeto de Sistemas 2026-2 (Prof. Edeilson Milhomem) e o
> Sebrae Supernova. As datas do Supernova tinham saído desta tabela em 12/09, confundidas com as
> da disciplina; voltaram em 28/10.

| Data | Marco |
|---|---|
| 26/08 | Supernova — evento de boas-vindas |
| 20/10 | Supernova — prazo do BMC (entregue) |
| 22/10 | Supernova — prazo do vídeo pitch (entregue) |
| 16/11 | Supernova — resultado previsto (**confirmar na plataforma**) |
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
| 07/12 | Startup-SE Demo Day — banca final de pitch, banca externa (da disciplina, não do Supernova) |

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