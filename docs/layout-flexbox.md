# Aluma — Regras de layout (flexbox)

> Critério objetivo para o review de qualquer tela. Quem revisa não discute gosto: aponta a
> regra aqui. Referência do plano em [`sprints.md`](sprints.md) §5.3.

## Por que existe

React Native **só** tem flexbox. Não há `display: block`, `float` nem grid: toda `View` já
nasce um flex container, e quem calcula a posição de tudo é o Yoga, o motor de layout em C++
embutido no RN. Então "usar flexbox" não é adotar tecnologia nova — é parar de posicionar
elemento na mão e deixar o Yoga fazer a conta.

O alvo é celular ruim e tela pequena. Layout com medida fixa quebra no aparelho de 320px que
o aluno da escola pública tem no bolso.

## As três diferenças para o CSS da web

Todo exemplo copiado do CSS-Tricks precisa passar por este filtro:

| Propriedade | Web | React Native | Efeito de esquecer |
|---|---|---|---|
| `flexDirection` | `row` | **`column`** | O exemplo copiado aparece deitado |
| `flexShrink` | `1` | **`0`** | O texto não encolhe: vaza para fora da tela |
| `flex` | aceita `1 1 auto` | **só um número** | Erro de tipo no TypeScript |

## Regras

### 1. Nenhuma altura ou largura fixa em elemento de estrutura

Tela, lista, cabeçalho e barra de digitar não levam `height` nem `width` em número. Quem ocupa
o espaço que sobra usa `flex: 1`; quem tem altura própria não declara nada.

Exceção: elemento de tamanho realmente fixo por natureza — avatar, ícone, logo.

```tsx
// errado: quebra em tela pequena e com teclado aberto
<View style={{ height: 600 }}>
  <FlatList style={{ height: 520 }} />
  <View style={{ height: 80 }} />
</View>

// certo: a lista come o que sobra, a barra tem a altura do conteúdo
<View style={{ flex: 1 }}>
  <FlatList style={{ flex: 1 }} />
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }}>
    <TextInput style={{ flex: 1 }} />
    <Pressable />
  </View>
</View>
```

### 2. Texto dentro de `row` leva `flexShrink: 1` e `minWidth: 0`

Como no RN o padrão é não encolher, texto longo ao lado de outro elemento empurra o layout
para fora da tela. O `minWidth: 0` desliga o tamanho mínimo automático, que senão impede o
item de encolher abaixo do tamanho do próprio conteúdo.

```tsx
// errado: a mensagem longa some no lado direito
<View style={{ flexDirection: 'row' }}>
  <Avatar />
  <Text>mensagem longa do tutor…</Text>
</View>

// certo
<View style={{ flexDirection: 'row', gap: 8 }}>
  <Avatar />
  <Text style={{ flexShrink: 1, minWidth: 0 }}>mensagem longa do tutor…</Text>
</View>
```

### 3. `position: 'absolute'` só para decoração, nunca para estrutura

Fundo, brilho e enfeite podem ser absolutos. Conteúdo que o usuário lê ou toca, não. No RN o
absoluto ancora **sempre no pai direto** (não existe `position: fixed`, e ele não sobe
procurando ancestral posicionado como na web), então layout absoluto encadeado vira armadilha.

### 4. Espaçamento com `gap`, não com margem em cada filho

`gap` aplica o espaço só *entre* os itens, sem sobra nas pontas. Evita a margem do último
filho empurrando a borda.

### 5. Alinhar: `justifyContent` para o grupo, `alignSelf` para o individual

- `justifyContent` age no eixo principal e move o **grupo** inteiro.
- `alignItems` / `alignSelf` agem no eixo cruzado, item a item.

Não existe `justifySelf`: no eixo principal um item não se move sem empurrar os vizinhos.
É por isso que o balão de mensagem usa `alignSelf`:

```tsx
const styles = StyleSheet.create({
  balaoAluno: { alignSelf: 'flex-end', maxWidth: '80%' },
  balaoTutor: { alignSelf: 'flex-start', maxWidth: '80%' },
});
```

### 6. Percentual em string nunca com `as any`

`maxWidth: '80%'` é válido e tipado. Se o TypeScript reclamar de um valor, o valor está errado
— `as any` é proibido pela convenção do projeto sem justificativa escrita.

## Checklist de review de tela

- [ ] Existe algum `height:` ou `width:` numérico em elemento de estrutura?
- [ ] Todo `Text` dentro de um `row` tem `flexShrink: 1`?
- [ ] Algum `position: 'absolute'` segurando conteúdo, e não decoração?
- [ ] Espaçamento feito com `gap` em vez de margem repetida?
- [ ] A tela foi aberta a 320px de largura e com o teclado aberto (passo 8 do roteiro)?
- [ ] Nenhum `as any` novo?

## Para estudar

- [Guia interativo do Josh Comeau](https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/) — o modelo mental. Leia primeiro.
- [Guia do CSS-Tricks](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) — tabela de consulta.
- [Flexbox no React Native](https://reactnative.dev/docs/flexbox) — as diferenças da tabela acima.
- [Yoga playground](https://www.yogalayout.dev/playground) — testar layout sem rodar o app.
