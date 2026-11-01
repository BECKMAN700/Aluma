/**
 * Fundo da direção Horizonte: céu estrelado, curva do planeta e estrela-guia.
 * Desenhado com react-native-svg porque o Metro não importa .svg como imagem sem configuração extra.
 */

import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
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

// Posição da linha do horizonte dentro do desenho de 320 × 720.
const LINHA_DO_HORIZONTE = 222;

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

/** Estrela de quatro pontas com a curva do planeta atrás, alinhada ao centro da estrela. */
export function EstrelaNoHorizonte({ tamanho }: { tamanho: number }) {
  const { width } = useWindowDimensions();
  const escala = width / 320;

  return (
    <View style={{ width: tamanho, height: tamanho, alignSelf: 'center' }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: tamanho / 2 - LINHA_DO_HORIZONTE * escala,
          left: tamanho / 2 - width / 2,
          width,
          height: 720 * escala,
        }}
      >
        <Svg width="100%" height="100%" viewBox="0 0 320 720">
          <Defs>
            <RadialGradient id="sol" gradientUnits="userSpaceOnUse" cx="160" cy="222" r="170">
              <Stop offset="0" stopColor="#FFC766" stopOpacity={0.75} />
              <Stop offset="0.3" stopColor="#FF9E45" stopOpacity={0.28} />
              <Stop offset="1" stopColor="#FF9E45" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="atm" gradientUnits="userSpaceOnUse" cx="160" cy="640" r="470">
              <Stop offset="0.893" stopColor="#3CCBFF" stopOpacity={0.5} />
              <Stop offset="1" stopColor="#3CCBFF" stopOpacity={0} />
            </RadialGradient>
            <LinearGradient id="chao" gradientUnits="userSpaceOnUse" x1="0" y1="220" x2="0" y2="620">
              <Stop offset="0" stopColor="#0B2236" />
              <Stop offset="0.45" stopColor={Horizonte.surface} />
              <Stop offset="1" stopColor={Horizonte.bg} />
            </LinearGradient>
            <LinearGradient id="borda" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="320" y2="0">
              <Stop offset="0" stopColor="#3CCBFF" />
              <Stop offset="0.42" stopColor="#FFE1A3" />
              <Stop offset="0.58" stopColor="#FFE1A3" />
              <Stop offset="1" stopColor="#3CCBFF" />
            </LinearGradient>
          </Defs>
          <Circle cx="160" cy="640" r="470" fill="url(#atm)" />
          <Circle cx="160" cy="222" r="170" fill="url(#sol)" />
          <Circle cx="160" cy="640" r="420" fill="url(#chao)" />
          <Circle cx="160" cy="640" r="420" fill="none" stroke="url(#borda)" strokeWidth={Math.min(1.6, 2 / escala)} />
        </Svg>
      </View>
      {/* A View garante a estrela acima da curva na web, onde um svg solto fica atrás do que é absolute. */}
      <View>
        <Svg width={tamanho} height={tamanho} viewBox="0 0 56 56">
          <Path d="M28 0C30 18 38 26 56 28C38 30 30 38 28 56C26 38 18 30 0 28C18 26 26 18 28 0Z" fill={Horizonte.star} />
        </Svg>
      </View>
    </View>
  );
}

/** Versão para tela larga: céu, planeta e estrela em um desenho só. Preenche o container pai. */
export function CeuLargo() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 1280 800" preserveAspectRatio="xMidYMax slice">
        <Defs>
          <RadialGradient id="sol-largo" gradientUnits="userSpaceOnUse" cx="640" cy="470" r="520">
            <Stop offset="0" stopColor="#FFC766" stopOpacity={0.7} />
            <Stop offset="0.25" stopColor="#FF9E45" stopOpacity={0.26} />
            <Stop offset="1" stopColor="#FF9E45" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="atm-largo" gradientUnits="userSpaceOnUse" cx="640" cy="1570" r="1190">
            <Stop offset="0.924" stopColor="#3CCBFF" stopOpacity={0.5} />
            <Stop offset="1" stopColor="#3CCBFF" stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id="chao-largo" gradientUnits="userSpaceOnUse" x1="0" y1="470" x2="0" y2="800">
            <Stop offset="0" stopColor="#0B2236" />
            <Stop offset="1" stopColor={Horizonte.bg} />
          </LinearGradient>
          <LinearGradient id="borda-largo" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1280" y2="0">
            <Stop offset="0" stopColor="#3CCBFF" />
            <Stop offset="0.42" stopColor="#FFE1A3" />
            <Stop offset="0.58" stopColor="#FFE1A3" />
            <Stop offset="1" stopColor="#3CCBFF" />
          </LinearGradient>
        </Defs>
        <Estrelas lista={ESTRELAS_LARGAS} cor="#FFFFFF" />
        <Circle cx="640" cy="1570" r="1190" fill="url(#atm-largo)" />
        <Circle cx="640" cy="470" r="520" fill="url(#sol-largo)" />
        <Circle cx="640" cy="1570" r="1100" fill="url(#chao-largo)" />
        <Circle cx="640" cy="1570" r="1100" fill="none" stroke="url(#borda-largo)" strokeWidth={2} />
        <Path d="M640 430C643 456 654 467 680 470C654 473 643 484 640 510C637 484 626 473 600 470C626 467 637 456 640 430Z" fill={Horizonte.star} />
      </Svg>
    </View>
  );
}
