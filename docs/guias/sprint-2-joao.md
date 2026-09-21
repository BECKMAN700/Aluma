# Guia da Sprint 2 — João

_sub_ Fechamento da release, publicação e apresentação · entrega da sprint: **segunda, 28/09**

## O seu papel é diferente

Os outros seis entregam peças. Você entrega **a release**: a coisa inteira funcionando numa URL
que o professor abre no celular dele. Se uma peça atrasar, quem remaneja é você.

Além disso, você tem código próprio para escrever. Isso não é detalhe: a ficha de avaliação
exige 1 PR relevante por pessoa, e quem só coordena fica limitado a 14 pontos de 50. Coordenar
não conta como contribuição técnica.

## O que você entrega

| Issue | Entrega | Até |
|---|---|---|
| A | Verificação de disponibilidade do backend | qui 24/09 |
| B | Publicação da versão web | sex 25/09 |
| C | GitHub Release 2, com notas e roteiro | dom 27/09 |
| D | Ficha de autoavaliação preenchida com evidências | dom 27/09 |

O `docs/layout-flexbox.md`, que também era seu, já está pronto no PR #27.

## Issue A — verificação de disponibilidade

Esta é a sua entrega de código, e resolve um problema real da apresentação.

O servidor do Render dorme depois de 15 minutos parado e leva de 30 a 50 segundos para acordar.
Se o professor abrir o app e mandar a primeira pergunta, ele fica olhando uma tela parada quase
um minuto e conclui que está quebrado.

O que fazer: antes de abrir a tela de chat, o app consulta `GET /health`. Se responder rápido,
segue normal. Se demorar ou falhar, o app mostra "acordando o tutor, isso pode levar até um
minuto" e tenta de novo a cada poucos segundos, até responder.

Detalhes que importam:

- `/health` **não** gasta cota do Gemini. É de graça chamar, por isso ela existe.
- Use a camada `services/` do Antonio, não `fetch` solto na tela.
- Combine com ele onde a mensagem aparece: os estados visuais são a issue dele.

## Issue B — publicação da versão web

```
npx expo export -p web
```

Isso gera uma pasta `dist/` com um site estático. Falta escolher onde hospedar:

| Opção | A favor | Contra |
|---|---|---|
| **Netlify** | Arrastar a pasta no navegador e está no ar. Sem configuração | Conta nova |
| **Vercel** | Publica do GitHub, atualiza sozinho a cada push | Um pouco mais de configuração |
| **GitHub Pages** | Já temos o repositório | As rotas do expo-router exigem ajuste, e é onde dá problema |

**Recomendo o Netlify** para esta release: você tem sexta-feira e não pode gastar a tarde
depurando roteamento. Na Sprint 3 dá para migrar para algo com publicação automática.

Antes de publicar, configure `EXPO_PUBLIC_API_URL` com a URL do Render que o Thales mandar.
Sem isso o app sobe apontando para lugar nenhum.

Depois de publicar, **abra o link no seu próprio celular, com dados móveis, não no Wi-Fi de
casa**. É o cenário do professor. Se travar no 4G, trava na apresentação.

## Issue C — a GitHub Release

Na Sprint 1, a release foi só uma marcação no histórico do Git, sem nenhuma explicação — e o
professor recusou. Desta vez:

1. No GitHub, *Releases* → *Draft a new release*.
2. Tag `v0.2.0`, alvo na `main` (a `develop` entra na `main` primeiro).
3. Título: **Release 2 — tutor socrático publicado**.
4. Corpo com quatro blocos:
   - **O que dá para fazer:** o roteiro dos 8 passos, numerado.
   - **A URL** do app e a do `/health`.
   - **O que ficou de fora e por quê:** login, turma, histórico salvo, streaming, trilha,
     exercícios, painel do professor.
   - **Limitação conhecida:** o servidor gratuito dorme e demora a acordar na primeira pergunta.

Dizer o que ficou de fora não é confessar fraqueza: é o que separa "não deu tempo" de "cortamos
de propósito para entregar estável". A ficha pontua decisões de projeto justamente aí.

## Issue D — a ficha de autoavaliação

A ficha do professor Edeilson é preenchida pelo time e validada por ele. Ela pede evidência
verificável por pessoa, e o rastro tem que existir **antes** de domingo.

Para cada um dos cinco de Projeto de Sistemas (você, Giordano, Thales, Flávio, Gustavo):

| O que a ficha pede | Onde buscar |
|---|---|
| PR relevante | link do PR no GitHub |
| Code review técnico | link do comentário, não "fez review" |
| Impacto | o que quebraria sem aquilo |
| Engajamento (mínimo 3 evidências) | issue finalizada, tarefa no board, resposta a PR de colega, reunião registrada |

Atenção ao detalhe que derruba nota: impacto acima de 12, ou total acima de 45, **exige
justificativa técnica escrita** respondendo qual problema foi resolvido, qual o impacto, qual
artefato comprova e qual a complexidade. Sem isso, o professor corta.

Antes de domingo, confirme que cada pessoa tem PR **e** review. Quem não tiver review, ainda dá
tempo: peça para revisar um PR aberto com comentário técnico de verdade.

## A semana, dia a dia

| Dia | O que você faz |
|---|---|
| **dom 21** | Manda os sete guias no grupo. Confere se o Iagor entregou a navegação |
| **seg 22** | Cobra o marco: esqueleto do backend no ar. Três pessoas dependem dele |
| **ter 23** | Flávio, Gustavo e Thales começam. Confere se todos conseguiram rodar o backend |
| **qua 24** | Sua issue A. Confere a refatoração do Antonio |
| **qui 25** | Deploy do Thales. Assim que a URL sair, sua issue B |
| **sáb 26** | **Teste do roteiro inteiro, os 8 passos, com todo mundo junto** |
| **dom 27** | Release, ficha, correções. Ensaio da apresentação |
| **seg 28** | Apresentação |

O sábado é o dia mais importante dessa tabela. É quando dá para descobrir que algo não encaixa
e ainda ter um domingo para consertar.

## O dia da apresentação

- **Acorde o servidor 5 minutos antes.** Abra a URL do `/health` no celular. Se o Render estiver
  dormindo, o professor pega os 50 segundos de espera logo na primeira pergunta.
- **Tenha um vídeo do roteiro gravado no sábado.** Se a internet da faculdade falhar, você
  apresenta o vídeo em vez de não apresentar nada.
- **Os sete precisam estar presentes.** Presença vale 10 pontos individuais, e faltou, perdeu.
- **Quem fala o quê:** cada um apresenta a própria parte, em 1 minuto. Quem escreveu, explica.
  Essa é a pergunta que a banca faz.
- **Abra pelo roteiro dos 8 passos,** na ordem. Ele foi desenhado para ser demonstrado.

## Os seus reviews

Você revisa o PR do **Antonio** (refatoração para flexbox) e os PRs que tocarem segurança e
infraestrutura, que são os caminhos listados no `.github/CODEOWNERS`: `rate_limit.py`, a
configuração de CI e o plano da sprint.

Os outros PRs têm revisor próprio na matriz. Não entre na fila deles: com sete PRs chegando
juntos na quinta e na sexta, você vira o gargalo bem na hora em que precisa publicar.

## Pendências suas que ainda estão abertas

1. **Preencher presentes e ausentes** na ata de 15/09, em `docs/reunioes.md`. Está com
   `[preencher]` e vai junto no merge do PR #27.
2. **Mergear o PR #27.** Enquanto ele não entra, `layout-flexbox.md` e os guias não estão na
   `develop`, e o CODEOWNERS antigo continua valendo.
3. **Decidir sobre proteger a branch `develop`**, exigindo 1 aprovação para mergear. Hoje a
   regra 1 do projeto é só combinado: qualquer um pode mergear sem revisão.
4. **Corrigir o `PROJECT-CONTEXT.md`:** ele cita a biblioteca `google-generativeai`, que o
   Google descontinuou. A correta é `google-genai`. **Feito em 21/09**, junto com a troca do modelo.

## Prompt base para usar com a sua IA

```
Contexto: sou o responsavel por um projeto academico chamado Aluma, um tutor educacional
com IA. Stack: React Native + Expo + TypeScript no app, FastAPI + Gemini no backend
hospedado no Render (plano gratuito, que dorme apos 15 min).

Tenho duas tarefas tecnicas.

1) Verificacao de disponibilidade: antes de abrir a tela de chat, o app consulta
   GET /health. Se demorar ou falhar, mostra "acordando o tutor, pode levar ate um
   minuto" e tenta de novo periodicamente ate responder. Precisa usar a camada
   services/ ja existente, nao fetch solto na tela, e nao pode gastar cota da IA.

2) Publicar a versao web gerada por "npx expo export -p web" num host gratuito,
   configurando a variavel EXPO_PUBLIC_API_URL com a URL do backend.

Me ajude a implementar a primeira explicando as decisoes (intervalo entre tentativas,
o que fazer se nunca responder, como evitar ficar tentando para sempre), e me de o passo
a passo da segunda para Netlify, apontando os erros comuns com rotas de single page
application.
```

## Se algo desandar

A sprint tem folga de exatamente um dia: o domingo. Se o backend não estiver no ar até sexta,
corte escopo em vez de empurrar o prazo — o passo 8 do roteiro (teste a 320px) e o aviso de
privacidade são os primeiros a sair, porque não quebram a demonstração principal.

O que **não** pode ser cortado é o tutor recusando dar a resposta. É o produto inteiro.
