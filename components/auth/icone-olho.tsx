import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface IconeOlhoProps {
  /** true = olho aberto (senha visível); false = olho riscado (senha oculta). */
  aberto: boolean;
  cor: string;
  tamanho?: number;
}

export function IconeOlho({ aberto, cor, tamanho = 22 }: IconeOlhoProps) {
  return (
    <View aria-hidden>
      <Svg
        width={tamanho}
        height={tamanho}
        viewBox="0 0 24 24"
        fill="none"
        stroke={cor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {aberto ? (
          <>
            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <Circle cx={12} cy={12} r={3} />
          </>
        ) : (
          <>
            <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <Line x1={1} y1={1} x2={23} y2={23} />
          </>
        )}
      </Svg>
    </View>
  );
}
