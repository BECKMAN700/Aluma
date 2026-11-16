/**
 * A IA escreve conta em LaTeX entre \( \) (na frase) ou \[ \] (sozinha na linha), como manda
 * backend/chat/prompt.py. Cifrão fica de fora de propósito: "R$ 20" quebraria a separação.
 */
export type Peca = { formula: false; texto: string } | { formula: true; latex: string; bloco: boolean };

const DELIMITADORES = /\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g;

export function separarFormulas(texto: string): Peca[] {
  const pecas: Peca[] = [];
  let inicio = 0;
  for (const achado of texto.matchAll(DELIMITADORES)) {
    if (achado.index > inicio) pecas.push({ formula: false, texto: texto.slice(inicio, achado.index) });
    const bloco = achado[1] !== undefined;
    pecas.push({ formula: true, latex: (bloco ? achado[1] : achado[2]).trim(), bloco });
    inicio = achado.index + achado[0].length;
  }
  if (inicio < texto.length) pecas.push({ formula: false, texto: texto.slice(inicio) });
  return pecas;
}

const SIMBOLOS: Record<string, string> = {
  pm: '±', cdot: '·', times: '×', div: '÷', Delta: 'Δ', pi: 'π', leq: '≤', geq: '≥',
  neq: '≠', approx: '≈', infty: '∞', alpha: 'α', beta: 'β', theta: 'θ',
};

/**
 * Fórmula legível sem KaTeX: o app nativo e o instante antes de o KaTeX carregar na web.
 * shortcut: cobre só os comandos de escola (fração, raiz, potência, símbolos); se o app nativo
 * virar alvo, trocar por um renderizador de verdade.
 */
export function formulaEmTexto(latex: string): string {
  let t = latex.replace(/\\left|\\right/g, '');
  let antes;
  do {
    antes = t;
    t = t
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^{}]*)\}/g, '√($1)');
  } while (t !== antes);
  return t
    .replace(/\^\{?2\}?/g, '²')
    .replace(/\^\{?3\}?/g, '³')
    .replace(/\\([a-zA-Z]+)/g, (cmd, nome: string) => SIMBOLOS[nome] ?? nome)
    .replace(/[{}]/g, '')
    .replace(/\\[,;! ]/g, ' ');
}
