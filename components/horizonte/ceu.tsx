/**
 * Fundo da direção Horizonte: céu estrelado, curva do planeta e estrela-guia.
 * Desenhado com react-native-svg porque o Metro não importa .svg como imagem sem configuração extra.
 *
 * Movimento entre telas: cada tela desenha o próprio céu, igual ao da anterior, e a troca é sem
 * animação do Stack. Ao abrir, a curva e a estrela começam onde a tela anterior as deixou e
 * deslizam até o próprio lugar. Por isso o céu parece parado e só o horizonte anda.
 */

import React, { useCallback, useId, useRef } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { useTelaDividida } from '@/constants/auth-theme';
import { Horizonte } from '@/constants/theme';

type Estrela = readonly [cx: number, cy: number, r: number, opacidade: number];

const ESTRELAS_BRANCAS: readonly Estrela[] = [
  [24, 30, 1.2, 0.7], [72, 88, 0.8, 0.5], [118, 22, 1.6, 0.95], [176, 64, 0.8, 0.5], [238, 26, 1, 0.7],
  [292, 72, 1.6, 0.9], [16, 132, 1.4, 0.8], [96, 150, 0.7, 0.45], [214, 126, 1.1, 0.7], [306, 168, 0.8, 0.5],
  [48, 214, 0.8, 0.55], [148, 198, 1.3, 0.85], [262, 222, 1, 0.65], [20, 298, 1, 0.6], [110, 282, 0.7, 0.4],
  [302, 306, 1.3, 0.75], [204, 330, 0.7, 0.4], [64, 384, 1.2, 0.6], [278, 404, 0.8, 0.45], [12, 462, 0.8, 0.45],
  [172, 446, 0.7, 0.35], [308, 518, 1.1, 0.55], [84, 542, 0.8, 0.4], [226, 590, 1, 0.5], [30, 636, 1, 0.5],
  [134, 664, 0.7, 0.35], [288, 692, 0.9, 0.45],
];
const ESTRELAS_CIANAS: readonly Estrela[] = [[196, 102, 1.2, 0.85], [36, 346, 1, 0.6], [250, 474, 1, 0.55]];
const ESTRELAS_DOURADAS: readonly Estrela[] = [[60, 48, 1, 0.8], [272, 136, 1, 0.7], [126, 510, 0.9, 0.5]];

const ESTRELAS_LARGAS: readonly Estrela[] = [
  [80, 60, 1.5, 0.8], [210, 140, 1, 0.5], [330, 50, 2, 0.95], [470, 170, 1, 0.5], [600, 70, 1.4, 0.7],
  [760, 120, 1, 0.5], [880, 40, 1.8, 0.9], [1010, 150, 1.2, 0.6], [1180, 70, 1.6, 0.8], [130, 260, 1.2, 0.6],
  [300, 320, 1, 0.5], [1090, 290, 1.3, 0.6], [1230, 240, 1, 0.5], [50, 380, 1, 0.5], [920, 240, 1, 0.5],
];

// Linha do horizonte dentro de cada desenho: 320 × 720 no celular e 1280 × 800 na tela larga.
const LINHA_DO_HORIZONTE = 222;
const LINHA_DO_HORIZONTE_LARGA = 470;

const MOVIMENTO_HORIZONTE = { duration: 320, easing: Easing.bezier(0.2, 0.8, 0.2, 1) };
const MOVIMENTO_SURGIR = { duration: 260, easing: Easing.out(Easing.ease) };

// Onde a última tela deixou a estrela, na altura da janela: a próxima tela parte daqui.
// shortcut: guarda a posição de quando a tela abriu, sem a rolagem; se a pessoa rolar antes de
// sair, o movimento começa um pouco deslocado. Medir também na saída resolve, se incomodar.
let estrelaAnterior: { centroY: number; tamanho: number } | null = null;

/** Escala do desenho largo: é a mesma em todas as telas, para a curva não mudar de forma ao trocar. */
function escalaLarga(width: number, height: number) {
  return Math.max(width / 1280, height / 800);
}

function Estrelas({ lista, cor }: { lista: readonly Estrela[]; cor: string }) {
  return (
    <G fill={cor}>
      {lista.map(([cx, cy, r, opacidade]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} opacity={opacidade} />
      ))}
    </G>
  );
}

/** Estrelas paradas, atrás de tudo. Preenche o container pai. */
export function CeuEstrelado() {
  const { width } = useWindowDimensions();

  // O desenho de 320px esticado viraria bolas grandes, que aparecem atrás dos títulos.
  if (width >= 600) {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 1280 800" preserveAspectRatio="xMidYMin slice">
          <Estrelas lista={ESTRELAS_LARGAS} cor="#FFFFFF" />
        </Svg>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 320 720" preserveAspectRatio="xMidYMin slice">
        <Estrelas lista={ESTRELAS_BRANCAS} cor="#FFFFFF" />
        <Estrelas lista={ESTRELAS_CIANAS} cor="#8BE3FF" />
        <Estrelas lista={ESTRELAS_DOURADAS} cor="#FFD27A" />
      </Svg>
    </View>
  );
}

/**
 * Prefixo único para os gradientes de cada desenho. Na web, a tela anterior continua escondida na
 * página: com ids repetidos, a curva usaria o gradiente da tela escondida e não apareceria.
 */
function useIdGradiente() {
  return useId().replace(/[^a-zA-Z0-9]/g, '');
}

function CurvaCelular({ escala }: { escala: number }) {
  const id = useIdGradiente();

  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 720">
      <Defs>
        <RadialGradient id={`sol${id}`} gradientUnits="userSpaceOnUse" cx="160" cy="222" r="170">
          <Stop offset="0" stopColor="#FFC766" stopOpacity={0.75} />
          <Stop offset="0.3" stopColor="#FF9E45" stopOpacity={0.28} />
          <Stop offset="1" stopColor="#FF9E45" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`atm${id}`} gradientUnits="userSpaceOnUse" cx="160" cy="640" r="470">
          {/* Transparente por baixo do chão: senão, o brilho vaza como uma linha no fim do desenho. */}
          <Stop offset="0.87" stopColor="#3CCBFF" stopOpacity={0} />
          <Stop offset="0.893" stopColor="#3CCBFF" stopOpacity={0.5} />
          <Stop offset="1" stopColor="#3CCBFF" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id={`chao${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="220" x2="0" y2="620">
          <Stop offset="0" stopColor="#0B2236" />
          <Stop offset="0.45" stopColor={Horizonte.surface} />
          <Stop offset="1" stopColor={Horizonte.bg} />
        </LinearGradient>
        <LinearGradient id={`borda${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="320" y2="0">
          <Stop offset="0" stopColor="#3CCBFF" />
          <Stop offset="0.42" stopColor="#FFE1A3" />
          <Stop offset="0.58" stopColor="#FFE1A3" />
          <Stop offset="1" stopColor="#3CCBFF" />
        </LinearGradient>
      </Defs>
      <Circle cx="160" cy="640" r="470" fill={`url(#atm${id})`} />
      <Circle cx="160" cy="222" r="170" fill={`url(#sol${id})`} />
      <Circle cx="160" cy="640" r="420" fill={`url(#chao${id})`} />
      <Circle cx="160" cy="640" r="420" fill="none" stroke={`url(#borda${id})`} strokeWidth={Math.min(1.6, 2 / escala)} />
    </Svg>
  );
}

function CurvaLarga() {
  const id = useIdGradiente();

  return (
    <Svg width="100%" height="100%" viewBox="0 0 1280 1000">
      <Defs>
        <RadialGradient id={`sol${id}`} gradientUnits="userSpaceOnUse" cx="640" cy="470" r="520">
          <Stop offset="0" stopColor="#FFC766" stopOpacity={0.7} />
          <Stop offset="0.25" stopColor="#FF9E45" stopOpacity={0.26} />
          <Stop offset="1" stopColor="#FF9E45" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`atm${id}`} gradientUnits="userSpaceOnUse" cx="640" cy="1570" r="1190">
          <Stop offset="0.9" stopColor="#3CCBFF" stopOpacity={0} />
          <Stop offset="0.924" stopColor="#3CCBFF" stopOpacity={0.5} />
          <Stop offset="1" stopColor="#3CCBFF" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id={`chao${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="470" x2="0" y2="760">
          <Stop offset="0" stopColor="#0B2236" />
          <Stop offset="1" stopColor={Horizonte.bg} />
        </LinearGradient>
        <LinearGradient id={`borda${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1280" y2="0">
          <Stop offset="0" stopColor="#3CCBFF" />
          <Stop offset="0.42" stopColor="#FFE1A3" />
          <Stop offset="0.58" stopColor="#FFE1A3" />
          <Stop offset="1" stopColor="#3CCBFF" />
        </LinearGradient>
      </Defs>
      <Circle cx="640" cy="1570" r="1190" fill={`url(#atm${id})`} />
      <Circle cx="640" cy="470" r="520" fill={`url(#sol${id})`} />
      <Circle cx="640" cy="1570" r="1100" fill={`url(#chao${id})`} />
      <Circle cx="640" cy="1570" r="1100" fill="none" stroke={`url(#borda${id})`} strokeWidth={2} />
    </Svg>
  );
}

/** Estrela de quatro pontas com a curva do planeta atrás, alinhada ao centro da estrela. */
export function EstrelaNoHorizonte({ tamanho }: { tamanho: number }) {
  const { width, height } = useWindowDimensions();
  const largo = useTelaDividida();
  const semMovimento = useReducedMotion();

  const escala = largo ? escalaLarga(width, height) : width / 320;
  const larguraDesenho = (largo ? 1280 : 320) * escala;
  // No largo, 1000 e não 800: o brilho do sol vai até 990 e não pode ser cortado por baixo do chão.
  const alturaDesenho = (largo ? 1000 : 720) * escala;
  const linha = (largo ? LINHA_DO_HORIZONTE_LARGA : LINHA_DO_HORIZONTE) * escala;

  const caixa = useRef<View>(null);
  const deslocamento = useSharedValue(0);
  const escalaEstrela = useSharedValue(1);
  // Escondido até medir: sem isso, a curva pisca no lugar final antes de voltar para o início do movimento.
  const opacidade = useSharedValue(estrelaAnterior ? 0 : 1);

  useFocusEffect(
    useCallback(() => {
      caixa.current?.measureInWindow((_x, y) => {
        const centroY = y + tamanho / 2;
        // Calcula antes de atualizar: o React Compiler troca um apelido da variável do módulo pela
        // própria variável, e o valor lido depois já seria o novo.
        const inicioY = estrelaAnterior ? estrelaAnterior.centroY - centroY : 0;
        const inicioEscala = estrelaAnterior ? estrelaAnterior.tamanho / tamanho : 1;
        estrelaAnterior = { centroY, tamanho };
        opacidade.set(1);
        if (semMovimento) return;
        deslocamento.set(inicioY);
        escalaEstrela.set(inicioEscala);
        deslocamento.set(withTiming(0, MOVIMENTO_HORIZONTE));
        escalaEstrela.set(withTiming(1, MOVIMENTO_HORIZONTE));
      });
      return () => {
        opacidade.set(0);
      };
    }, [tamanho, semMovimento, deslocamento, escalaEstrela, opacidade]),
  );

  const estiloHorizonte = useAnimatedStyle(() => ({
    opacity: opacidade.get(),
    transform: [{ translateY: deslocamento.get() }],
  }));
  const estiloEstrela = useAnimatedStyle(() => ({ transform: [{ scale: escalaEstrela.get() }] }));

  return (
    <View ref={caixa} collapsable={false} style={{ width: tamanho, height: tamanho, alignSelf: 'center' }}>
      <Animated.View style={[StyleSheet.absoluteFill, estiloHorizonte]} pointerEvents="none">
        <View
          style={{
            position: 'absolute',
            top: tamanho / 2 - linha,
            left: tamanho / 2 - larguraDesenho / 2,
            width: larguraDesenho,
            height: alturaDesenho,
          }}
        >
          {largo ? <CurvaLarga /> : <CurvaCelular escala={escala} />}
        </View>
        {/* A View garante a estrela acima da curva na web, onde um svg solto fica atrás do que é absolute. */}
        <Animated.View style={estiloEstrela}>
          <Svg width={tamanho} height={tamanho} viewBox="0 0 56 56">
            <Path d="M28 0C30 18 38 26 56 28C38 30 30 38 28 56C26 38 18 30 0 28C18 26 26 18 28 0Z" fill={Horizonte.star} />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/** Horizonte da tela larga de perfil, preso ao fim da tela em vez de seguir o conteúdo. */
export function HorizonteLargoFixo() {
  const { width, height } = useWindowDimensions();
  const escala = escalaLarga(width, height);
  const tamanho = 80 * escala;
  const centroY = height - (800 - LINHA_DO_HORIZONTE_LARGA) * escala;

  return (
    <View style={{ position: 'absolute', top: centroY - tamanho / 2, left: 0, right: 0 }} pointerEvents="none">
      <EstrelaNoHorizonte tamanho={tamanho} />
    </View>
  );
}

/** Conteúdo da tela: aparece subindo de leve sempre que a tela abre. */
export function Surgir({ style, children }: { style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const semMovimento = useReducedMotion();
  const progresso = useSharedValue(semMovimento ? 1 : 0);

  useFocusEffect(
    useCallback(() => {
      if (semMovimento) return;
      progresso.set(0);
      progresso.set(withTiming(1, MOVIMENTO_SURGIR));
    }, [semMovimento, progresso]),
  );

  const estilo = useAnimatedStyle(() => ({
    opacity: progresso.get(),
    transform: [{ translateY: (1 - progresso.get()) * 10 }],
  }));

  return <Animated.View style={[style, estilo]}>{children}</Animated.View>;
}
