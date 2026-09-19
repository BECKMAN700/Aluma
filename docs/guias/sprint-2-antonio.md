# Guia da Sprint 2 — Antonio

_sub_ Ligação com o servidor e refatoração da tela inicial · entrega da sprint: **segunda, 28/09**

## O seu papel nesta sprint

Você tem duas frentes bem diferentes. Uma é a **ponte entre o app e o servidor**: o arquivo que
todo mundo vai usar para falar com o backend. A outra é a **refatoração da tela inicial**, que é
o "antes e depois" de flexbox que o professor de Web/Mobile vai querer ver.

A refatoração parece só arrumação, mas é a entrega de maior valor da sua sprint: "refatoração
significativa documentada" é um dos critérios de PR relevante da ficha de avaliação.

## O que você entrega

| Issue | Entrega | Até |
|---|---|---|
| A | Refatoração da tela inicial para flexbox | qua 23/09 |
| B | `services/chat.ts`: a única camada que fala com o servidor | qui 24/09 |
| C | Estados de espera e de erro no chat | sex 25/09 |
| D | Aviso de privacidade no chat | sáb 26/09 |

> **Atenção à ordem.** O Iagor entrega o botão da tela inicial na segunda (21/09), mexendo no
> mesmo `app/(tabs)/index.tsx` que você vai refatorar. **Só comece a issue A depois que o PR
> dele entrar na `develop`.** Se vocês dois editarem o arquivo ao mesmo tempo, o merge conflita
> e alguém perde trabalho.

## Issue A — refatorar a tela inicial

Hoje o `app/(tabs)/index.tsx` tem 412 linhas, **14 `position: absolute`** e **98 estrelas** com
coordenadas fixas em porcentagem, além de dois `as any` nas linhas 122 e 123 para calar o
TypeScript. É layout calculado na mão, o oposto do que a disciplina está pedindo.

Leia `docs/layout-flexbox.md` antes de começar. Ele é o critério do review.

O que fazer:

- Trocar a estrutura absoluta por containers com `flex`, `gap` e `alignItems`.
- Manter o visual. Isto é refatoração, não redesenho: a tela deve continuar parecida.
- Decoração de fundo (o brilho, as estrelas) **pode** continuar absoluta — é enfeite, não
  estrutura. Mas reduza o número: 98 elementos desenhados é peso morto em celular fraco, e o
  público-alvo tem celular fraco. Umas 20 resolvem o mesmo efeito.
- Matar os dois `as any`. Percentual em string é válido e tipado no React Native
  (`maxWidth: '80%'` funciona). Quando o TypeScript reclama de um valor de estilo, quase sempre
  é o valor que está errado, não o compilador.

No PR, escreva quantas linhas saíram e quantos `absolute` foram removidos. Esse número é o que
transforma "mexi na tela" em "refatoração documentada" na hora da avaliação.

## Issue B — `services/chat.ts`

É a **única** parte do app que conhece o endereço do servidor. As telas não falam com o
servidor: falam com você. Se amanhã o endereço mudar, muda num arquivo só.

### O contrato, combinado com o Giordano

```
POST /api/chat
envia -> {"mensagem": "...", "historico": [{"autor": "aluno"|"tutor", "texto": "..."}]}
200   -> {"resposta": "..."}
422   -> {"erro": "mensagem vazia"}
429   -> {"erro": "muitas perguntas seguidas"}
503   -> {"erro": "tutor indisponivel"}

GET /health -> {"status": "ok"}
```

### A URL não é segredo, a chave é

O endereço do servidor vai numa variável de ambiente chamada `EXPO_PUBLIC_API_URL`. O prefixo
`EXPO_PUBLIC_` existe porque o Expo embute essa variável no código que roda no celular do
usuário — ou seja, **qualquer pessoa consegue ler**. Por isso ele só pode carregar coisa
pública, como a URL.

A chave do Gemini **nunca** entra no app, em variável nenhuma. Ela fica só no servidor. É a
regra 2 do projeto: chave dentro do app é chave pública, e conta zerada por terceiros.

### Tratar o servidor dormindo

O Render desliga o servidor grátis depois de 15 minutos sem uso, e ele leva de 30 a 50 segundos
para acordar. Então:

- Use `AbortController` para dar um limite de tempo generoso à requisição, uns 60 segundos.
  Sem isso, a promessa fica pendurada para sempre se a rede cair.
- Traduza cada erro para uma mensagem em português que a tela possa mostrar. O usuário é um
  aluno do 9º ano: "Failed to fetch" não diz nada a ele.
- Nunca registre o texto das conversas em log. Usuários são menores de idade.

Os tipos do que entra e do que sai ficam em `types/aluma.ts`, que o Giordano já criou.

## Issue C — estados de espera e de erro

São os passos 3 e 7 do roteiro de aceite da release, ou seja, o professor vai testar os dois.

- **Servidor acordando:** mensagem dizendo que o tutor está acordando e que pode levar até um
  minuto. A tela não pode parecer travada.
- **Servidor fora do ar:** erro claro, com um botão de tentar de novo. E **nunca** uma resposta
  inventada — em caso de falha, o app diz que falhou.

Combine com o Iagor onde esses estados aparecem na tela dele.

## Issue D — aviso de privacidade

Um texto curto e discreto no chat: *"não escreva seu nome nem dados pessoais"*.

Não é firula. A camada gratuita do Gemini pode usar as conversas para treinar os modelos do
Google, e nossos usuários são menores de idade. Como não temos orçamento para o plano pago,
avisar é a proteção possível — e mostra à banca que a equipe conhece o risco em vez de ignorá-lo.

## Testar antes de cada PR

1. Tela inicial refatorada: estreite o navegador a 320px. Nada cortado, sem rolagem lateral.
2. `services/chat.ts`: teste com o backend desligado e confira se o erro aparece bonitinho.
3. Rode `npm run lint` antes de abrir o PR.

## O seu review obrigatório

Você revisa o PR do **Iagor** (tela de chat, balões e navegação). A ficha exige um review
técnico por pessoa, valendo 10 pontos da sua nota individual.

"LGTM" vale zero. Precisa de 3 linhas técnicas, um problema concreto e a sugestão de correção.
O que olhar: alguma altura fixa sobrou? Todo `Text` dentro de `row` tem `flexShrink: 1`? A
resposta temporária está marcada para sair?

## Prompt base para usar com a sua IA

```
Contexto: sou estudante e trabalho no app Aluma, um tutor educacional em React Native
com Expo e TypeScript, estrutura na raiz (sem pasta src), imports pelo alias @/.
O publico e aluno de 9º ano com celular fraco e internet instavel.

Tenho duas tarefas.

TAREFA 1 - camada de servico services/chat.ts, a unica parte do app que conhece a URL
do backend. Contrato:
  POST {EXPO_PUBLIC_API_URL}/api/chat
    envia {"mensagem": string, "historico": [{"autor": "aluno"|"tutor", "texto": string}]}
    responde 200 {"resposta": string}, 422, 429 ou 503 com {"erro": string}
  GET {EXPO_PUBLIC_API_URL}/health -> {"status": "ok"}
Requisitos:
  - tipos em types/aluma.ts, nada de "as any"
  - timeout com AbortController de 60s, porque o servidor gratuito do Render demora
    ate 50s para acordar depois de 15 min parado
  - cada erro vira uma mensagem em portugues pronta para a tela
  - nunca logar o texto das mensagens: os usuarios sao menores de idade
  - a chave da IA NAO existe no app, ela fica no servidor

TAREFA 2 - refatorar uma tela que hoje usa 14 position absolute e 98 elementos com
coordenadas fixas em porcentagem, trocando por layout flexbox. Regras:
  - sem altura ou largura fixa em elemento de estrutura
  - todo Text dentro de flexDirection row leva flexShrink: 1
  - position absolute so para decoracao
  - espacamento com gap
  - manter o visual parecido: e refatoracao, nao redesenho

Me explique cada decisao enquanto escreve, e no final me diga quantas linhas saíram e o
que melhorou em desempenho. Um arquivo por vez, nao tudo de uma vez.
```

## Se travar

Avise no grupo. E combine com o Iagor logo no primeiro dia o formato da função de envio, algo
como `enviarMensagem(texto)` devolvendo a resposta ou um erro. Sem esse acerto, um fica
esperando o outro.
