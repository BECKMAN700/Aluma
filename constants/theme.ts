// Direção visual Horizonte, valores do Design System.
export const Horizonte = {
  bg: '#04060D',
  surface: '#071120',
  fieldBg: '#0A1626',
  fieldBorder: '#6D88A6',
  hairline: '#2B3D55',
  text: '#F4F6FB',
  textMuted: '#C4CEE2',
  action: '#FFC766',
  onAction: '#0A0D16',
  luma: '#8BE3FF',
  lumaText: '#BDEEFF',
  studentBubble: '#2A2110',
  studentText: '#FFF3DC',
  star: '#FFF6E0',
  error: '#FFB4A8',
} as const;

// No celular, o peso da fonte faz parte do nome da família: não combinar com fontWeight.
export const FontesHorizonte = {
  display: 'Sora_700Bold',
  displayMedio: 'Sora_600SemiBold',
  corpo: 'Figtree_400Regular',
  corpoMedio: 'Figtree_500Medium',
  corpoForte: 'Figtree_600SemiBold',
} as const;
