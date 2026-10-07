# Aluma

Plataforma de tutoria com IA vinculada à turma real da escola. Projeto acadêmico da UFT,
duas disciplinas: Projeto de Sistemas (competição Sebrae Supernova) e Desenvolvimento Web/Mobile.
Equipe de oito: cinco em Web/Mobile, seis em Projeto de Sistemas. Prazo de semestre.

O contexto completo — problema, escopo, decisões, riscos e calendário — está em
@PROJECT-CONTEXT.md. Ele é a fonte da verdade: antes de propor mudança de rumo, consulte lá.

## Stack

- App: React Native + Expo, TypeScript. Um código só, roda no navegador e no celular.
- Backend: Python + FastAPI, em `backend/`, organizado por assunto. Banco e login no Supabase.
- O app é **cliente**: fala com o Supabase só para login; todo dado passa pela API REST.
- Alvo: celular ruim, internet instável. Tela pequena primeiro, payload leve.
- Antes de mexer em tabela, rota ou permissão, leia `docs/arquitetura.md`: é o mapa do projeto.
  Para a tarefa da vez, leia só o arquivo da sprint atual em `docs/sprints/`.

<!-- Confirmar com o professor se a API é fornecida ou se a equipe constrói (pendência nº 1 do PROJECT-CONTEXT) -->

## Como trabalhar comigo

- Trabalhe em nível dev sênior: proponha e implemente a solução inteira. Não segure a entrega
  esperando alguém digitar.
- Antes de codar, peça o contexto, os dados e os acessos que faltam. Não adivinhe requisito.
- Ao falar comigo (João), aplique a skill `professor-dev`: entregue o trabalho **e** explique o
  porquê e como funciona por trás, em linguagem que eu acompanhe. Ensinar é comigo, não é
  condição para escrever o código.
- Entregue em fatias verticais pequenas e funcionais, não por camada.
- Declare suposição em voz alta antes de codar em cima dela.
- Ao decidir arquitetura, apresente o trade-off — nunca só a conclusão.
- Português do Brasil.

## Regras invioláveis

1. Ninguém trabalha direto na `main` nem na `develop`. Tudo por branch + PR revisado.
2. Chave de API, senha ou segredo nunca no código, no commit, na URL ou no log.
3. Toda entrada do usuário é hostil até prova em contrário: valide no servidor.
4. Em erro ou dúvida sobre permissão: negue e pare. Nunca "deixa passar por enquanto".
5. Nada de dado falso ou mock no caminho de produção. Seed é isolado e sinalizado.
6. A IA nunca entrega a resposta do exercício. É requisito de produto, não preferência.
7. Nenhum dado de aluno cruza a fronteira da turma/escola.
8. **Suspensa na fase de apresentação (decisão do João, 07/10/2026):** LGPD para menores,
   consentimento dos pais e exclusão sob pedido. Não trate como bloqueio. A demonstração usa
   contas fictícias; a regra volta antes de qualquer uso com aluno real.

## Comandos

<!-- Preencher quando o projeto Expo estiver criado. Ex.: npx expo start / npm test / npm run lint -->

- App — instalar: `npm install` · rodar: `npx expo start` · lint: `npm run lint`
- Backend (dentro de `backend/`) — instalar: `pip install -r requirements-dev.txt` ·
  rodar: `uvicorn main:app --reload` · testes: `pytest`
- Testes do app: _(definir)_

## Convenções

- Estrutura na raiz, sem `src/` — é o padrão do expo-router e é o que o projeto usa:
  telas em `app/`, componentes em `components/`, chamadas de API isoladas em `services/`,
  tema e constantes em `constants/`, hooks em `hooks/`, tipos do domínio em `types/`.
- Import sempre pelo alias `@/`, que aponta para a raiz (`tsconfig.json`):
  `@/components/card`, nunca `../../components/card`.
- Nada de `any` em TypeScript sem comentário justificando.
- Texto de interface em português, nomes de código em inglês.
- Commit em português, imperativo, curto: `adiciona tela de login`.

## Equipe

Duas disciplinas, times parcialmente sobrepostos. Ver `PROJECT-CONTEXT.md` §11.

| Nome | GitHub | Disciplina |
|---|---|---|
| João Pedro Beckman — responsável, decisão final | @BECKMAN700 | Web/Mobile + Projeto de Sistemas |
| Giordano Bruno de Moura Fragoso Santos | @GiordanOBru | Web/Mobile + Projeto de Sistemas |
| Thales Rafael | @thalesrafael10 | Web/Mobile + Projeto de Sistemas |
| Antonio Carlos | @Acgsop | Web/Mobile |
| Iagor | @iagorlrnc | Web/Mobile |
| Flávio | @flaviohen16 | Projeto de Sistemas |
| Gustavo Bringel | @GustavoBringel | Projeto de Sistemas |
| Anna Beatriz Moura de Oliveira | @bibimoura | Projeto de Sistemas |

Ferramentas: GitHub (código, Issues, PR) + Trello (cronograma).
