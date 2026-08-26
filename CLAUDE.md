# Aluma

Plataforma de tutoria com IA vinculada à turma real da escola. Projeto acadêmico da UFT,
duas disciplinas: Projeto de Sistemas (competição Sebrae Supernova) e Desenvolvimento Web/Mobile.
Equipe de dois, prazo de semestre.

O contexto completo — problema, escopo, decisões, riscos e calendário — está em
@PROJECT-CONTEXT.md. Ele é a fonte da verdade: antes de propor mudança de rumo, consulte lá.

## Stack

- React Native + Expo, TypeScript. Um código só, roda no navegador e no celular.
- O app é **cliente**: consome API REST. Não implementamos backend próprio sem decisão explícita.
- Alvo: celular ruim, internet instável. Tela pequena primeiro, payload leve.

<!-- Confirmar com o professor se a API é fornecida ou se a equipe constrói (pendência nº 1 do PROJECT-CONTEXT) -->

## Como trabalhar comigo

- Explique antes de escrever. É matéria de desenvolvimento: o objetivo é a equipe aprender,
  não receber código pronto. Proponha, mostre o porquê, e deixe a equipe digitar quando fizer sentido.
- Entregue em fatias verticais pequenas e funcionais, não por camada.
- Declare suposição em voz alta antes de codar em cima dela.
- Ao decidir arquitetura, apresente o trade-off — nunca só a conclusão.
- Português do Brasil.

## Regras invioláveis

1. Ninguém trabalha direto na `main`. Tudo por branch + PR revisado.
2. Chave de API, senha ou segredo nunca no código, no commit, na URL ou no log.
3. Toda entrada do usuário é hostil até prova em contrário: valide no servidor.
4. Em erro ou dúvida sobre permissão: negue e pare. Nunca "deixa passar por enquanto".
5. Nada de dado falso ou mock no caminho de produção. Seed é isolado e sinalizado.
6. A IA nunca entrega a resposta do exercício. É requisito de produto, não preferência.
7. Nenhum dado de aluno cruza a fronteira da turma/escola.
8. Usuários são menores de idade: LGPD com regra dura. Não colete dado que não é necessário
   (sem CPF, sem foto). Exclusão sob pedido.

## Comandos

<!-- Preencher quando o projeto Expo estiver criado. Ex.: npx expo start / npm test / npm run lint -->

- Instalar: `npm install`
- Rodar: `npx expo start`
- Testes: _(definir)_
- Lint/format: _(definir)_

## Convenções

- Componentes em `src/components/`, telas em `src/app/`, chamadas de API isoladas em `src/services/`.
- Nada de `any` em TypeScript sem comentário justificando.
- Texto de interface em português, nomes de código em inglês.
- Commit em português, imperativo, curto: `adiciona tela de login`.

## Equipe

- João Pedro Beckman (@BECKMAN700) — responsável, decisão final
- Giordano Bruno de Moura Fragoso Santos (@GiordanOBru) — desenvolvedor

Ferramentas: GitHub (código, Issues, PR) + Trello (cronograma).
