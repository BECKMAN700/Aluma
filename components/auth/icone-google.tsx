import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export function IconeGoogle({ tamanho = 20 }: { tamanho?: number }) {
  return (
    <View aria-hidden>
      <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
        <Path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
        />
        <Path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24z"
        />
        <Path
          fill="#FBBC05"
          d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l4.01-3.09z"
        />
        <Path
          fill="#EA4335"
          d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4.01 3.09C6.23 6.86 8.88 4.75 12 4.75z"
        />
      </Svg>
    </View>
  );
}