# Aluma

Tutoria com Inteligência Artificial vinculada à turma real da escola.

Seus alunos já usam IA para copiar resposta. O Aluma é a IA que a escola controla — e que se
recusa a dar a resposta. Ele mostra ao aluno **o que** estudar e **como** estudar, pergunta de
volta, dá exemplos e o obriga a chegar sozinho. Para o professor, transforma isso em um mapa de
onde a turma travou.

O nome vem de *aluno* + *lumina* (luz): iluminar o caminho, não andar por ele.

## Contexto acadêmico

Projeto do curso de Ciência da Computação da Universidade Federal do Tocantins — Campus Palmas,
desenvolvido ao longo de um semestre em duas disciplinas:

- **Desenvolvimento Webmobile** — implementação do aplicativo. A stack é definida pela ementa.
- **Projeto de Sistemas** — modelagem e viabilidade, com participação na competição Sebrae Supernova.

## Status

Em definição. A stack está fechada e o repositório configurado (branch protegida, CODEOWNERS,
fluxo de Pull Request). O código da aplicação ainda não foi iniciado.

Decisões, riscos e pendências ficam em [`PROJECT-CONTEXT.md`](PROJECT-CONTEXT.md) — é a fonte da
verdade do projeto. Antes de propor mudança de rumo, consulte lá.

## O que a V1 entrega

| # | Funcionalidade |
|---|---|
| 1 | Login por e-mail institucional, com papéis de aluno, professor e administrador |
| 2 | Professor cadastra turma, alunos e o conteúdo da matéria |
| 3 | Trilha do aluno: tópicos com status de não iniciado, em andamento ou dominado |
| 4 | Chat de tutoria socrática sobre um tópico |
| 5 | Exercícios com correção e explicação do erro |
| 6 | Painel do professor com o mapa de onde a turma está travando |

Recorte da V1: uma disciplina e uma série.

**Fora da V1**, no roadmap: gamificação, notificações, relatório para coordenação, painel do
responsável, correção de redação, resumos e flashcards, modo offline. Chat entre alunos está fora
permanentemente.

## Arquitetura

```
[App Expo — aluno]        [App Expo — professor]
         \                        /
          →  API REST (contrato tipado)  ←
                       |
               +-------+-------+
               |               |
          Banco de dados   Serviço de IA
```

Duas regras definem o desenho:

1. **A chave da API de IA nunca fica no app.** Toda chamada de IA passa pelo servidor. Chave no
   app é chave pública, e chave pública é conta zerada por terceiros.
2. **O app não decide regra de negócio.** Quem pode ver o quê é decidido no servidor, sempre.

## Stack

| Camada | Tecnologia |
|---|---|
| App (web e mobile, mesmo código) | React Native + Expo |
| Linguagem | TypeScript |
| Navegação | Expo Router |
| API | REST, com contrato tipado e documentado |
| Testes e CI | Lint e testes a cada push, via GitHub Actions |
| IA | Provedor em camada trocável, começando pelo plano gratuito |

**Distribuição:** aplicação universal — roda no navegador e no celular a partir do mesmo código.
Web primeiro; publicação em loja fica para depois.

**Alvo:** celular modesto em rede instável. Tela pequena primeiro, payload leve, o app precisa
abrir em 3G.

## Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) LTS (20 ou superior), Git e, para testar em
aparelho real, o [Expo Go](https://expo.dev/go) instalado no celular.

```bash
git clone https://github.com/BECKMAN700/aluma.git
cd aluma
npm install
npx expo start
```

O Expo exibe um QR Code no terminal: leia com o Expo Go para abrir no celular, ou tecle `w` para
abrir no navegador.

## Fluxo de trabalho

**Ninguém trabalha direto na `main`.** Ela é a versão estável e protegida — só entra código
revisado e aprovado por Pull Request.

```bash
git checkout main
git pull

git checkout -b feature/nome-da-tarefa
# ... suas alterações ...
git add .
git commit -m "adiciona tela de login"

git push -u origin feature/nome-da-tarefa
# abra o Pull Request no GitHub e aguarde a revisão
```

Nomes de branch: `feature/...` para funcionalidade nova, `correcao/...` para conserto de erro,
`docs/...` para documentação.

Commits em português, no imperativo e curtos: `corrige validação do e-mail`.

O trabalho é dividido em **fatias verticais por funcionalidade, não por camada** — assim ninguém
fica bloqueado esperando o outro. Tarefas ficam nas Issues do GitHub; o cronograma, no Trello.

## Convenções de código

- Componentes em `src/components/`, telas em `src/app/`, chamadas de API isoladas em `src/services/`.
- Nomes de código em inglês; texto de interface em português.
- Nada de `any` em TypeScript sem um comentário justificando.

## Regras invioláveis

O público do Aluma é formado por menores de idade, e a LGPD se aplica com rigor. Nada abaixo é
negociável:

1. Ninguém trabalha direto na `main`. Tudo por branch e Pull Request revisado.
2. Chave de API, senha ou segredo nunca entram no código, no commit, na URL ou no log.
3. Toda entrada de usuário é hostil até prova em contrário: valide no servidor.
4. Em erro ou dúvida sobre permissão, negue e pare. Nunca "deixa passar por enquanto".
5. Nada de dado falso ou mock no caminho de produção. O seed é isolado e sinalizado.
6. A IA nunca entrega a resposta do exercício. É requisito de produto, não preferência.
7. Nenhum dado de aluno cruza a fronteira da sua turma ou escola.
8. Coleta mínima: sem CPF, sem foto. Exclusão sob pedido.

## Equipe

| Nome | Função | GitHub |
|---|---|---|
| João Pedro Beckman | Responsável pelo projeto, decisão final | [@BECKMAN700](https://github.com/BECKMAN700) |
| Giordano Bruno de Moura Fragoso Santos | Desenvolvedor | [@GiordanOBru](https://github.com/GiordanOBru) |
| Flávio | Desenvolvedor | [@flaviohen16](https://github.com/flaviohen16) |
| Gustavo Bringel | Desenvolvedor | [@GustavoBringel](https://github.com/GustavoBringel) |
| Iago | Desenvolvedor | [@iagorlrnc](https://github.com/iagorlrnc) |
| Thales Rafael | Desenvolvedor | [@thalesrafael10](https://github.com/thalesrafael10) |
