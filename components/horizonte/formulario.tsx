/**
 * Peças do Design System para as telas de formulário: cabeçalho com Voltar, campo, botão,
 * link e aviso de erro. Substituem as de components/auth conforme as telas migram.
 */

import React, { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { IconeOlho } from '@/components/auth/icone-olho';
import { FontesHorizonte, Horizonte } from '@/constants/theme';

// O foco já é mostrado na caixa: sem isto, a web desenha um retângulo em volta do input.
// O tipo do React Native não aceita 'none', mas a web aceita.
const SEM_CONTORNO_WEB = { outlineStyle: 'none' } as object;

export function CabecalhoVoltar({ texto, aoVoltar }: { texto: string; aoVoltar: () => void }) {
  return (
    <View style={styles.cabecalho}>
      <Pressable
        style={({ pressed }) => [styles.voltar, pressed && styles.pressionado]}
        onPress={aoVoltar}
        accessibilityRole="button"
        accessibilityLabel={texto}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 5l-7 7 7 7"
            stroke={Horizonte.textMuted}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={styles.voltarTexto}>{texto}</Text>
      </Pressable>
      <Image
        source={require('../../assets/images/aluma_logo.jpg')}
        style={styles.logo}
        accessibilityLabel="Logo do Aluma"
      />
    </View>
  );
}

interface CampoTextoProps extends Omit<TextInputProps, 'style'> {
  rotulo: string;
  erro?: string | null;
  /** Mostra o olho para exibir/ocultar a senha e controla secureTextEntry. */
  senha?: boolean;
  inputRef?: React.Ref<TextInput>;
}

export function CampoTexto({ rotulo, erro, senha = false, inputRef, onFocus, onBlur, ...props }: CampoTextoProps) {
  const [visivel, setVisivel] = useState(false);
  const [emFoco, setEmFoco] = useState(false);

  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={[styles.caixa, emFoco && styles.caixaFoco, !!erro && styles.caixaErro]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, senha && styles.inputSenha, Platform.OS === 'web' && SEM_CONTORNO_WEB]}
          placeholderTextColor="#A9B6CC"
          accessibilityLabel={rotulo}
          accessibilityHint={erro ?? undefined}
          secureTextEntry={senha && !visivel}
          autoCapitalize="none"
          onFocus={(e) => { setEmFoco(true); onFocus?.(e); }}
          onBlur={(e) => { setEmFoco(false); onBlur?.(e); }}
          {...props}
        />
        {senha && (
          <Pressable
            style={styles.olho}
            onPress={() => setVisivel((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
            accessibilityState={{ checked: visivel }}
          >
            <IconeOlho aberto={visivel} cor={Horizonte.textMuted} />
          </Pressable>
        )}
      </View>
      {!!erro && (
        <Text style={styles.erro} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {erro}
        </Text>
      )}
    </View>
  );
}

export function BotaoPrincipal({
  texto,
  textoOcupado,
  ocupado = false,
  aoTocar,
}: {
  texto: string;
  textoOcupado: string;
  ocupado?: boolean;
  aoTocar: () => void;
}) {
  const atual = ocupado ? textoOcupado : texto;
  return (
    <Pressable
      style={({ pressed }) => [styles.botao, pressed && styles.pressionado, ocupado && styles.botaoOcupado]}
      onPress={aoTocar}
      disabled={ocupado}
      accessibilityRole="button"
      accessibilityLabel={atual}
      accessibilityState={{ disabled: ocupado, busy: ocupado }}
    >
      <Text style={styles.botaoTexto}>{atual}</Text>
    </Pressable>
  );
}

export function LinkTexto({ texto, rotulo, aoTocar }: { texto: string; rotulo: string; aoTocar: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.link, pressed && styles.pressionado]}
      onPress={aoTocar}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
    >
      <Text style={styles.linkTexto}>{texto}</Text>
    </Pressable>
  );
}

export function AvisoErro({ mensagem }: { mensagem: string }) {
  return (
    <View style={styles.aviso}>
      <Text style={styles.avisoTexto} accessibilityRole="alert" accessibilityLiveRegion="polite">
        {mensagem}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pressionado: { opacity: 0.85 },

  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  voltar: { flexDirection: 'row', flexShrink: 1, alignItems: 'center', gap: 4, minHeight: 44, marginLeft: -8, paddingRight: 8 },
  voltarTexto: { flexShrink: 1, fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: Horizonte.textMuted },
  logo: { width: 36, height: 36, borderRadius: 18 },

  campo: { gap: 6 },
  rotulo: { fontFamily: FontesHorizonte.corpoForte, fontSize: 14, lineHeight: 20, color: Horizonte.text },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: Horizonte.fieldBorder,
    borderRadius: 26,
    backgroundColor: Horizonte.fieldBg,
  },
  caixaFoco: { borderWidth: 2, borderColor: Horizonte.action },
  caixaErro: { borderColor: Horizonte.error },
  // Fonte de 16px: abaixo disso, o iPhone dá zoom na tela ao tocar no campo.
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    paddingHorizontal: 20,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 16,
    color: Horizonte.text,
  },
  inputSenha: { paddingRight: 0 },
  olho: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  erro: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: Horizonte.error },

  botao: {
    minHeight: 56,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Horizonte.action,
  },
  botaoOcupado: { opacity: 0.6 },
  botaoTexto: {
    fontFamily: FontesHorizonte.display,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    color: Horizonte.onAction,
  },

  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  linkTexto: {
    fontFamily: FontesHorizonte.corpoForte,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: Horizonte.action,
  },

  aviso: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Horizonte.error,
    borderRadius: 18,
    backgroundColor: Horizonte.fieldBg,
  },
  avisoTexto: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: Horizonte.error },
});
