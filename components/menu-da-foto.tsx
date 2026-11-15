/**
 * O + que abre "Tirar foto da questão" / "Escolher da galeria" (opção B do Design, 15/11).
 * Fica no chat e no início do aluno, por isso mora aqui.
 */
import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { FontesHorizonte } from '@/constants/theme';
import { type Cores, useCores, useEstilos } from '@/hooks/use-tema';

export type OrigemDaFoto = 'camera' | 'galeria';

const MAIS = 'M12 5v14M5 12h14';
export const FECHAR = 'M6 6l12 12M18 6L6 18';
const CAMERA = 'M4 8h3l2-3h6l2 3h3v11H4zM15.5 13a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0';
const GALERIA = 'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2M21 16l-5-5-9 9M11 10a2 2 0 1 1-4 0a2 2 0 0 1 4 0';

export function BotaoFoto({
  aberto,
  desabilitado,
  ocupado,
  aoTocar,
}: {
  aberto: boolean;
  desabilitado?: boolean;
  /** Preparando a foto escolhida. */
  ocupado?: boolean;
  aoTocar: () => void;
}) {
  const cores = useCores();
  const styles = useEstilos(criarEstilos);
  return (
    <Pressable
      style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
      onPress={aoTocar}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={aberto ? 'Fechar o menu de foto' : 'Anexar foto da questão'}
      accessibilityState={{ expanded: aberto, disabled: desabilitado, busy: ocupado }}
    >
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d={aberto ? FECHAR : MAIS} stroke={cores.text} strokeWidth={2.2} strokeLinecap="round" />
      </Svg>
    </Pressable>
  );
}

export function MenuDaFoto({ aoEscolher, style }: { aoEscolher: (origem: OrigemDaFoto) => void; style?: StyleProp<ViewStyle> }) {
  const cores = useCores();
  const styles = useEstilos(criarEstilos);
  return (
    <View style={[styles.menu, style]}>
      {(['camera', 'galeria'] as const).map((origem) => (
        <Pressable
          key={origem}
          style={({ pressed }) => [styles.item, pressed && styles.pressionado]}
          onPress={() => aoEscolher(origem)}
          accessibilityRole="button"
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d={origem === 'camera' ? CAMERA : GALERIA}
              stroke={cores.action}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.texto}>{origem === 'camera' ? 'Tirar foto da questão' : 'Escolher da galeria'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Texto do aviso quando escolherFoto falha. */
export function erroDaFoto(e: unknown): string {
  return e instanceof Error && e.message === 'sem-permissao'
    ? 'Libere a câmera nas configurações do celular para tirar a foto.'
    : 'Não deu para abrir essa foto. Tente outra.';
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    pressionado: { opacity: 0.85 },
    botao: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: cores.hairline,
    },
    menu: {
      width: 260,
      padding: 6,
      borderWidth: 1,
      borderColor: cores.hairline,
      borderRadius: 16,
      backgroundColor: cores.surface,
    },
    item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 12, borderRadius: 10 },
    texto: { fontFamily: FontesHorizonte.corpo, fontSize: 16, color: cores.text },
  });
