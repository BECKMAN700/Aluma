/**
 * Cores da marca da escola (decisão de 15/11): a principal sai de uma paleta pronta, para nenhuma
 * escola cair numa cor ilegível; os tons e as secundárias que combinam saem dela por conta.
 * O texto sobre cada cor (branco ou quase preto) é escolhido pelo contraste.
 */

export const PALETA_PRINCIPAL: readonly { nome: string; cor: string }[] = [
  { nome: 'Azul royal', cor: '#1e5bd8' },
  { nome: 'Azul-marinho', cor: '#1b3a6b' },
  { nome: 'Azul-celeste', cor: '#2e9be6' },
  { nome: 'Turquesa', cor: '#0e9f9e' },
  { nome: 'Verde', cor: '#1f9d55' },
  { nome: 'Verde-escuro', cor: '#166534' },
  { nome: 'Verde-limão', cor: '#7cb518' },
  { nome: 'Amarelo-ouro', cor: '#f5b301' },
  { nome: 'Laranja', cor: '#f26b1d' },
  { nome: 'Vermelho', cor: '#d62828' },
  { nome: 'Vinho', cor: '#8e1b3a' },
  { nome: 'Rosa', cor: '#e0457b' },
  { nome: 'Roxo', cor: '#6d3fd6' },
  { nome: 'Lilás', cor: '#9b7fe6' },
  { nome: 'Marrom', cor: '#8b5a2b' },
  { nome: 'Grafite', cor: '#3b4252' },
];

export type FormatoDaLogo = 'redondo' | 'quadrado' | 'livre';

type Hsl = [h: number, s: number, l: number];

function paraHsl(hex: string): Hsl {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function paraHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
}

/** Luminância relativa (WCAG): 0 é preto, 1 é branco. */
export function luminancia(hex: string): number {
  const canal = (i: number) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
}

export function ehClara(hex: string): boolean {
  return luminancia(hex) > 0.5;
}

/** Razão de contraste da WCAG entre duas cores (1 a 21). Texto comum precisa de 4,5. */
export function contraste(a: string, b: string): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

/** Branco ou quase preto: o que der mais contraste sobre a cor. */
export function textoSobre(hex: string): string {
  return contraste(hex, '#ffffff') >= contraste(hex, '#0a0d16') ? '#ffffff' : '#0a0d16';
}

/**
 * A mesma cor, clareada ou escurecida só o necessário para ler bem sobre o fundo (4,5:1).
 * Assim o azul da escola continua azul, mas um link azul-escuro não some no fundo escuro.
 */
export function legivelSobre(cor: string, fundo: string): string {
  const [h, s, l] = paraHsl(cor);
  const clarear = ehClara(fundo) ? -1 : 1;
  for (let passo = 0; passo <= 20; passo++) {
    const tentativa = paraHex(h, s, Math.min(0.95, Math.max(0.05, l + clarear * passo * 0.03)));
    if (contraste(tentativa, fundo) >= 4.5) return tentativa;
  }
  return ehClara(fundo) ? '#111318' : '#ffffff';
}

export function tons(principal: string): { escura: string; clara: string } {
  const [h, s, l] = paraHsl(principal);
  return { escura: paraHex(h, s, Math.max(0.12, l - 0.2)), clara: paraHex(h, s, l + (0.94 - l) * 0.8) };
}

/** Os básicos e três que combinam com a principal: a versão escura dela, a oposta e a vizinha. */
export function secundarias(principal: string): { nome: string; cor: string }[] {
  const [h, s, l] = paraHsl(principal);
  const media = Math.min(Math.max(l, 0.35), 0.5);
  return [
    { nome: 'Branco', cor: '#ffffff' },
    { nome: 'Cinza-claro', cor: '#e9ecf1' },
    { nome: 'Preto', cor: '#111318' },
    { nome: 'Escura da principal', cor: tons(principal).escura },
    { nome: 'Complementar', cor: paraHex(h + 180, Math.min(s, 0.6), media) },
    { nome: 'Vizinha', cor: paraHex(h + 35, Math.min(s, 0.7), media) },
  ];
}
