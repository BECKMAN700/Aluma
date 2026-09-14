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

Sprint 1, em andamento. A stack está fechada, o repositório configurado (branch protegida,
CODEOWNERS, fluxo de Pull Request) e o aplicativo Expo já roda: o template de demonstração foi
removido, os tipos do domínio existem em `types/aluma.ts` e a tela de boas-vindas, o tema e os
dados de exemplo estão em revisão. A integração com API e com IA ainda não começou — depende de
uma pendência aberta descrita no `PROJECT-CONTEXT.md` §9.

O acompanhamento sprint a sprint fica em [`docs/sprints.md`](docs/sprints.md).

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

O projeto usa **Git Flow com duas branches de longa duração**:

- **`develop`** — onde o trabalho do dia a dia se integra. É daqui que você sai e é para cá que
  o seu Pull Request aponta.
- **`main`** — só recebe versão entregue e apresentável, vinda da `develop`.

**Ninguém trabalha direto em nenhuma das duas.** Sem exceção, inclusive o responsável pelo
projeto. Só entra código revisado e aprovado por Pull Request.

```bash
git checkout develop
git pull

git checkout -b feature/nome-da-tarefa
# ... suas alterações ...
git add .
git commit -m "adiciona tela de login"

git push -u origin feature/nome-da-tarefa
# abra o Pull Request no GitHub, com base na develop, e aguarde a revisão
```

Nomes de branch: `feature/...` para funcionalidade nova, `fix/...` para conserto de erro,
`docs/...` para documentação, `chore/...` para manutenção e configuração.

**Depois que o seu PR for mergeado, apague a branch.** O botão aparece no próprio PR. Continuar
commitando numa branch já mergeada gera conflito — foi o que aconteceu no PR #11.

Commits em português, no imperativo e curtos: `corrige validação do e-mail`.

O trabalho é dividido em **fatias verticais por funcionalidade, não por camada** — assim ninguém
fica bloqueado esperando o outro. Tarefas ficam nas Issues do GitHub; o cronograma, no Trello.

## Convenções de código

- Estrutura na raiz, sem `src/` — é o padrão do expo-router e é o que o projeto usa: telas em
  `app/`, componentes em `components/`, chamadas de API isoladas em `services/`, tema e
  constantes em `constants/`, hooks em `hooks/`, tipos do domínio em `types/`.
- Import sempre pelo alias `@/`, que aponta para a raiz: `@/components/card`, nunca
  `../../components/card`.
- Nomes de código em inglês; texto de interface em português.
- Nada de `any` em TypeScript sem um comentário justificando.

## Regras invioláveis

O público do Aluma é formado por menores de idade, e a LGPD se aplica com rigor. Nada abaixo é
negociável:

1. Ninguém trabalha direto na `main` nem na `develop`. Tudo por branch e Pull Request revisado.
2. Chave de API, senha ou segredo nunca entram no código, no commit, na URL ou no log.
3. Toda entrada de usuário é hostil até prova em contrário: valide no servidor.
4. Em erro ou dúvida sobre permissão, negue e pare. Nunca "deixa passar por enquanto".
5. Nada de dado falso ou mock no caminho de produção. O seed é isolado e sinalizado.
6. A IA nunca entrega a resposta do exercício. É requisito de produto, não preferência.
7. Nenhum dado de aluno cruza a fronteira da sua turma ou escola.
8. Coleta mínima: sem CPF, sem foto. Exclusão sob pedido.

## Equipe

A equipe não é a mesma nas duas disciplinas. Quem está nas duas carrega tanto o código
quanto os artefatos da Supernova; quem está só em uma responde por aquela frente.

| Nome | Função | GitHub | Web/Mobile | Projeto de Sistemas |
|---|---|---|---|---|
| João Pedro Beckman | Responsável pelo projeto, decisão final | [@BECKMAN700](https://github.com/BECKMAN700) | sim | sim |
| Giordano Bruno de Moura Fragoso Santos | Desenvolvedor | [@GiordanOBru](https://github.com/GiordanOBru) | sim | sim |
| Thales Rafael | Desenvolvedor | [@thalesrafael10](https://github.com/thalesrafael10) | sim | sim |
| Antonio Carlos | Desenvolvedor | [@Acgsop](https://github.com/Acgsop) | sim | não |
| Iagor | Desenvolvedor | [@iagorlrnc](https://github.com/iagorlrnc) | sim | não |
| Flávio | Desenvolvedor | [@flaviohen16](https://github.com/flaviohen16) | não | sim |
| Gustavo Bringel | Desenvolvedor | [@GustavoBringel](https://github.com/GustavoBringel) | não | sim |
