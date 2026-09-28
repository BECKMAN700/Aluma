# Guia da Sprint 2 — Iagor

_sub_ Tela de chat do Aluma · seus prazos: **24/09** e **26/09** · entrega da sprint: **segunda, 28/09**

## Você pode começar hoje

Sua parte não depende de ninguém. O backend ainda nem existe, e mesmo assim você constrói a
tela inteira: ela funciona com mensagens guardadas na memória do app, e só no fim liga no
servidor de verdade. Quem espera é o backend, não você.

Sua tela é a que o professor vai usar na apresentação. É o rosto do projeto.

## O que você entrega

| Issue | Entrega | Até |
|---|---|---|
| A | Navegação: botão na tela inicial que leva à tela de chat | seg 21/09 |
| B | Tela de chat com layout em flexbox, sem altura fixa | qui 24/09 |
| C | Balões de mensagem alinhados com `alignSelf` | sáb 26/09 |

## A regra que o professor vai cobrar: flexbox

O professor de Web/Mobile apresentou flexbox e pediu uso no projeto. Leia
`docs/layout-flexbox.md` no repositório antes de escrever a primeira linha — ele é o critério
do review, então quem revisar o seu PR vai conferir item por item.

O resumo do que mais importa para a sua tela:

- **Nenhuma altura fixa.** Nada de `height: 600`. Quem ocupa o espaço que sobra usa `flex: 1`.
- **Texto dentro de `row` leva `flexShrink: 1`.** No React Native o padrão é não encolher, então
  mensagem longa vaza para fora da tela em vez de quebrar linha.
- **`position: absolute` só para decoração**, nunca para estrutura.
- **Espaço entre itens com `gap`**, não com margem em cada filho.

## O esqueleto da tela

Este é o padrão que resolve sozinho o problema mais chato do chat, que é o teclado abrindo e
empurrando tudo:

```
View (flex: 1)                 a tela inteira, eixo vertical
 ├── FlatList (flex: 1)        a lista come todo o espaco que sobra
 └── View (flexDirection row)  a barra de digitar, altura natural
      ├── TextInput (flex: 1)  o campo estica
      └── Pressable            o botao fica do tamanho dele
```

Repare que a barra de digitar **não** leva `flex`. Ela não precisa: a lista acima dela é quem
tem `flex: 1` e engole todo o espaço livre, então sobra para a barra exatamente a altura do
conteúdo dela. É o flexbox fazendo a conta, não você.

Envolva tudo em `KeyboardAvoidingView` para o campo não ficar escondido atrás do teclado no
celular.

## Passo a passo

### 1. Rodar o projeto

```
git checkout develop
git pull
npm install
npx expo start
```

Aperte `w` para abrir no navegador. É assim que o professor vai testar.

### 2. Issue A — navegação

Crie a branch `feat/navegacao-chat`. O projeto usa **expo-router**: cada arquivo dentro de
`app/` vira uma rota automaticamente, sem você registrar nada.

- Crie `app/chat.tsx` com um texto qualquer só para existir.
- Na tela inicial, adicione o botão **Conversar com o tutor** que navega para `/chat`.
- Use o componente `Link` do `expo-router`, ou `router.push('/chat')`.

Abra o PR, com `closes` da issue A. Esta entrega é pequena de propósito: ela destrava o teste
de navegação para todo mundo logo no começo da semana.

### 3. Issue B — a tela de chat

Branch `feat/tela-chat`. Monte o esqueleto acima. Nesta etapa as mensagens vivem num
`useState` dentro da tela: array de objetos com autor e texto.

Enquanto o `services/chat.ts` do Antonio não existir, faça a resposta ser local e temporária.
Marque isso no código de forma que ninguém esqueça de tirar:

```tsx
// TEMPORARIO: remover ao integrar com services/chat.ts
```

A regra 5 do projeto proíbe dado falso no caminho de produção. Enquanto está marcado e some
antes do fim da sprint, está tudo certo — o que não pode é chegar na apresentação assim.

Use `FlatList`, não `ScrollView` com `map`. A `FlatList` só renderiza o que está na tela, e o
alvo do projeto é celular fraco.

### 4. Issue C — os balões

Branch `feat/baloes-mensagem`. Crie `components/balao-mensagem.tsx`.

```tsx
const styles = StyleSheet.create({
  balaoAluno: { alignSelf: 'flex-end', maxWidth: '80%' },
  balaoTutor: { alignSelf: 'flex-start', maxWidth: '80%' },
  texto: { flexShrink: 1 },
});
```

Por que `alignSelf` e não `justifyContent`: a lista é uma coluna, então o eixo principal é o
vertical e o horizontal é o eixo cruzado. `justifyContent` moveria **todos** os balões juntos;
`alignSelf` move **um** balão, que é o que você quer — aluno à direita, tutor à esquerda.

As cores estão em `constants/theme.ts`. Não invente hexadecimal novo.

### 5. Testar antes do PR

1. No navegador, estreite a janela até 320px de largura. Nada pode ser cortado, e não pode
   aparecer barra de rolagem horizontal.
2. No celular, com o Expo Go, abra o teclado e confira se o campo continua visível.
3. Mande uma mensagem bem longa, de umas 40 palavras, e veja se ela quebra linha dentro do
   balão em vez de vazar.

O item 1 é o passo 8 do roteiro de aceite da release. Se falhar, a entrega não passa.

## Os seus reviews obrigatórios

Você revisa dois PRs: o do **João** (verificação de disponibilidade do backend) e o do
**Antonio** (`services/chat.ts`). A ficha de avaliação exige ao menos um review técnico por
pessoa, e ele vale 10 pontos da sua nota.

"LGTM" e "ok" valem **zero**. Precisa de pelo menos 3 linhas técnicas, apontando um problema
concreto e sugerindo a correção. No PR do Antonio, olhe se o tratamento de erro cobre servidor
fora do ar e resposta demorada — são os passos 3 e 7 do roteiro.

## Prompt base para usar com a sua IA

```
Contexto: sou estudante e estou construindo um app de tutor educacional chamado Aluma,
em React Native com Expo e TypeScript, usando expo-router. O app roda no navegador e no
celular com o mesmo codigo. O publico e aluno de 9º ano, com celular fraco e internet ruim.

Minha tarefa: a tela de chat do tutor.

Regras de layout que nao posso quebrar (o professor cobra flexbox no projeto):
1. Nenhuma altura ou largura fixa em elemento de estrutura. Quem ocupa o espaco que
   sobra usa flex: 1.
2. Todo Text dentro de um container com flexDirection row leva flexShrink: 1, porque no
   React Native o padrao e flexShrink 0 e o texto vaza da tela.
3. position absolute so para decoracao, nunca para estrutura.
4. Espacamento com gap, nao com margem em cada filho.
5. Nada de "as any" no TypeScript.
6. Texto da interface em portugues; nomes de variaveis e funcoes em ingles.

Estrutura que eu quero:
  View flex 1 -> FlatList flex 1 + View flexDirection row com TextInput flex 1 e botao.
  Tudo dentro de KeyboardAvoidingView.
  Baloes usando alignSelf flex-end (aluno) e flex-start (tutor), maxWidth 80%.

Me explique cada decisao de layout enquanto escreve, e me diga onde eu erraria se
copiasse um exemplo de CSS da web, porque ja sei que o React Native tem defaults
diferentes. Nao me entregue tudo de uma vez: um arquivo por vez.
```

## Se travar

Fale no grupo. E lembre: o Antonio faz o `services/chat.ts`, que é a peça que liga sua tela ao
servidor. Combinem no primeiro dia o formato da função, algo como `enviarMensagem(texto)`
devolvendo a resposta ou um erro. Sem esse acerto, um vai ficar esperando o outro.
