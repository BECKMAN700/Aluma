/**
 * Primeira tela do app (rota "/"): o usuário escolhe o perfil, Aluno ou Professor.
 * Ao tocar em um card, vai para /entrar levando o perfil como parâmetro.
 * O perfil só muda textos da interface; o papel real vem do backend (nucleo/auth.py).
 */

import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { CeuEstrelado, EstrelaNoHorizonte, HorizonteLargoFixo, Surgir } from '@/components/horizonte/ceu';
import { useTelaDividida } from '@/constants/auth-theme';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import type { Perfil } from '@/services/auth';

const PERFIS: { id: Perfil; titulo: string; descricao: string }[] = [
  { id: 'aluno', titulo: 'Aluno', descricao: 'Estude com um tutor que te ajuda a pensar.' },
  { id: 'professor', titulo: 'Professor', descricao: 'Crie turmas e acompanhe seus alunos.' },
];

export default function EscolherPerfilScreen() {
  const router = useRouter();
  const largo = useTelaDividida();
  const margens = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <View style={styles.tela}>
      <StatusBar style="light" />
      <CeuEstrelado />
      {largo && <HorizonteLargoFixo />}

      <ScrollView
        style={styles.rolagem}
        contentContainerStyle={[
          styles.conteudo,
          {
            paddingTop: margens.top + 20,
            paddingBottom: margens.bottom + (largo ? 28 : 36),
            // Coluna de até 480px no celular grande e no tablet, sem cortar a curva do planeta.
            paddingHorizontal: largo ? 24 : Math.max(20, (width - 480) / 2),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Surgir style={[styles.marca, largo && styles.marcaLarga]}>
          <Image
            source={require('../../assets/images/aluma_logo.jpg')}
            style={largo ? styles.logoLargo : styles.logo}
            accessibilityLabel="Logo do Aluma"
          />
          <Text style={[styles.marcaTexto, largo && styles.marcaTextoLargo]}>Aluma</Text>
        </Surgir>

        <Surgir style={[styles.textos, largo && styles.textosLargos]}>
          <Text style={[styles.titulo, largo && styles.tituloLargo]} accessibilityRole="header">
            Qual é o seu perfil?
          </Text>
          <Text style={[styles.subtitulo, largo && styles.subtituloLargo]}>
            Escolha o seu módulo para entrar com a sua conta.
          </Text>
        </Surgir>

        <View style={[styles.espaco, styles.espacoEstrela]}>
          {!largo && <EstrelaNoHorizonte tamanho={56} />}
        </View>

        <Surgir style={[styles.cartoes, largo && styles.cartoesLargos]}>
          {PERFIS.map((perfil) => {
            const aluno = perfil.id === 'aluno';
            return (
              <Pressable
                key={perfil.id}
                style={({ pressed }) => [
                  styles.cartao,
                  aluno ? styles.cartaoAluno : styles.cartaoProfessor,
                  largo && styles.cartaoLargo,
                  pressed && styles.pressionado,
                ]}
                onPress={() => router.push({ pathname: '/entrar', params: { perfil: perfil.id } })}
                accessibilityRole="button"
                accessibilityLabel={`${perfil.titulo}. ${perfil.descricao}`}
              >
                <View style={styles.cartaoTextos}>
                  <Text style={[styles.cartaoTitulo, largo && styles.cartaoTituloLargo, aluno && styles.textoSobreAcao]}>
                    {perfil.titulo}
                  </Text>
                  <Text
                    style={[
                      styles.cartaoDescricao,
                      largo && styles.cartaoDescricaoLarga,
                      aluno && styles.cartaoDescricaoAluno,
                    ]}
                  >
                    {perfil.descricao}
                  </Text>
                </View>
                {largo && (
                  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M9 5l7 7-7 7"
                      stroke={aluno ? Horizonte.onAction : Horizonte.luma}
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </Pressable>
            );
          })}
        </Surgir>

        <View style={largo ? styles.espacoFraseLargo : [styles.espaco, styles.espacoFrase]} />
        <Surgir>
          <Text style={[styles.frase, largo && styles.fraseLarga]}>Aprender é descobrir a própria luz.</Text>
        </Surgir>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, overflow: 'hidden', backgroundColor: Horizonte.bg },
  rolagem: { flex: 1 },
  // overflow: a curva do planeta passa do fim da tela e não pode criar rolagem vazia na web.
  conteudo: { flexGrow: 1, overflow: 'hidden' },

  marca: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, zIndex: 1 },
  marcaLarga: { height: 48, gap: 12, paddingHorizontal: 24, marginTop: 8 },
  logo: { width: 40, height: 40, borderRadius: 20 },
  logoLargo: { width: 48, height: 48, borderRadius: 24 },
  marcaTexto: { fontFamily: FontesHorizonte.display, fontSize: 19, color: Horizonte.text },
  marcaTextoLargo: { fontSize: 22 },

  textos: { marginTop: 24, gap: 10, zIndex: 1 },
  textosLargos: { marginTop: 40, gap: 12, alignItems: 'center' },
  titulo: {
    fontFamily: FontesHorizonte.display,
    fontSize: 31,
    lineHeight: 37,
    letterSpacing: -0.5,
    color: Horizonte.text,
  },
  tituloLargo: { fontSize: 52, lineHeight: 60, letterSpacing: -1, textAlign: 'center' },
  subtitulo: { fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, color: Horizonte.textMuted },
  subtituloLargo: { fontSize: 18, lineHeight: 26, textAlign: 'center' },

  // Os dois espaços crescem juntos: a estrela fica acima dos cartões em qualquer altura de tela.
  espaco: { flexGrow: 1 },
  espacoEstrela: { flexBasis: 136, justifyContent: 'flex-end', paddingBottom: 28 },
  espacoFrase: { flexBasis: 32 },
  // Na tela larga, a estrela faz parte do desenho do céu: os cartões descem para ficar abaixo dela.
  espacoFraseLargo: { height: 28 },

  cartoes: { gap: 12, zIndex: 1 },
  cartoesLargos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 780,
    alignSelf: 'center',
  },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 92,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  cartaoLargo: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 300,
    minHeight: 108,
    paddingVertical: 16,
    paddingLeft: 28,
    paddingRight: 22,
    borderRadius: 36,
  },
  cartaoAluno: { backgroundColor: Horizonte.action },
  cartaoProfessor: { borderWidth: 1.5, borderColor: Horizonte.luma, backgroundColor: Horizonte.surface },
  pressionado: { opacity: 0.85 },
  cartaoTextos: { flex: 1, minWidth: 0, gap: 2 },
  cartaoTitulo: { fontFamily: FontesHorizonte.display, fontSize: 21, lineHeight: 27, color: Horizonte.text },
  cartaoTituloLargo: { fontSize: 24, lineHeight: 30 },
  textoSobreAcao: { color: Horizonte.onAction },
  cartaoDescricao: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: Horizonte.textMuted },
  cartaoDescricaoLarga: { fontSize: 15, lineHeight: 21 },
  cartaoDescricaoAluno: { fontFamily: FontesHorizonte.corpoMedio, color: Horizonte.onAction },

  frase: {
    fontFamily: FontesHorizonte.displayMedio,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: Horizonte.textMuted,
    zIndex: 1,
  },
  fraseLarga: { fontSize: 16, lineHeight: 24 },
});
