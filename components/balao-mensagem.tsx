import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import type { ChatApiAuthor } from '@/types/api';

// A Luma fala direto no céu: o espaço e a cor já mostram quem fala, e cada linha ganha largura em 320px.
export function MessageBubble({ author, text }: { author: ChatApiAuthor; text: string }) {
  if (author !== 'aluno') return <Text style={styles.falaLuma}>{text}</Text>;
  return (
    <View style={styles.balaoAluno}>
      <Text style={styles.textoAluno}>{text}</Text>
    </View>
  );
}

/** A resposta leva de 2 a 7 segundos: sem este aviso a tela parece travada. */
export function LumaPensando() {
  const giro = useSharedValue(0);

  // withTiming respeita o movimento reduzido do aparelho: a órbita fica parada e o texto continua.
  useEffect(() => {
    giro.set(withRepeat(withTiming(360, { duration: 1600, easing: Easing.linear }), -1));
  }, [giro]);

  const estilo = useAnimatedStyle(() => ({ transform: [{ rotate: `${giro.get()}deg` }] }));

  return (
    <View style={styles.pensando} accessibilityLiveRegion="polite">
      <Animated.View style={estilo}>
        <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
          <Circle cx="13" cy="13" r="10" stroke={Horizonte.luma} strokeOpacity={0.45} strokeWidth={1.5} />
          <Circle cx="13" cy="3" r="3" fill={Horizonte.luma} />
        </Svg>
      </Animated.View>
      <Text style={styles.pensandoTexto}>Luma está pensando…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  falaLuma: {
    paddingRight: 20,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 15,
    lineHeight: 22,
    color: Horizonte.lumaText,
  },
  balaoAluno: {
    // A lista é uma coluna: o horizontal é o eixo cruzado, então alignSelf move um balão só.
    alignSelf: 'flex-end',
    maxWidth: '84%',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: Horizonte.action,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    backgroundColor: Horizonte.studentBubble,
  },
  textoAluno: {
    // Sem flexShrink o texto longo vaza da tela em vez de quebrar a linha.
    flexShrink: 1,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 15,
    lineHeight: 22,
    color: Horizonte.studentText,
  },
  pensando: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 28 },
  pensandoTexto: {
    flexShrink: 1,
    fontFamily: FontesHorizonte.corpoMedio,
    fontSize: 15,
    lineHeight: 22,
    color: Horizonte.luma,
  },
});
