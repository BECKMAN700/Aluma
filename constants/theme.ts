/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#F5A623';
const tintColorDark = '#FFD54F';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
} as const;

// Identidade noturna do Aluma: o chat usa as mesmas cores da tela inicial, sem modo claro.
// Ciano é sempre a voz do tutor e âmbar sempre a ação do aluno; não misturar no mesmo elemento.
export const Night = {
  sky: '#000208',
  guide: '#38BDF8',
  spark: '#F5A623',
  starlight: '#E7ECF5',
  dust: '#7C89A6',
} as const;

// Direção visual Horizonte, valores do Design System. As telas migram para cá uma de cada vez.
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

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});