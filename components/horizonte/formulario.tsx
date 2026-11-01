/**
 * Peças do Design System para as telas de formulário: moldura, título, cabeçalhos, campos,
 * botão, link e avisos. Substituem as de components/auth conforme as telas migram.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { IconeOlho } from '@/components/auth/icone-olho';
import { CeuEstrelado, Surgir } from '@/components/horizonte/ceu';
import { FontesHorizonte, Horizonte } from '@/constants/theme';

// O foco já é mostrado na caixa: sem isto, a web desenha um retângulo em volta do input.
// O tipo do React Native não aceita 'none', mas a web aceita.
export const SEM_CONTORNO_WEB ={ outlineStyle: 'none' } as object;

/** Moldura das telas de formulário: céu, área segura, teclado e coluna de até 480px. */
export function TelaFormulario({
  topo = 12,
  rodape = 36,
  children,
}: {
  topo?: number;
  rodape?: number;
  children: React.ReactNode;
}) {
  const margens = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <CeuEstrelado />

      <ScrollView
        style={styles.rolagem}
        contentContainerStyle={[
          styles.conteudo,
          {
            paddingTop: margens.top + topo,
            paddingBottom: margens.bottom + rodape,
            paddingHorizontal: Math.max(20, (width - 480) / 2),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function TituloTela({
  titulo,
  subtitulo,
  falaDaLuma = false,
  style,
}: {
  titulo: string;
  subtitulo?: string;
  /** O subtítulo é uma fala da Luma: ganha a cor dela. */
  falaDaLuma?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Surgir style={[styles.camada, style]}>
      <Text style={styles.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      {!!subtitulo && <Text style={falaDaLuma ? styles.falaDaLuma : styles.subtitulo}>{subtitulo}</Text>}
    </Surgir>
  );
}

export function CabecalhoSair({
  legenda,
  comMarca = false,
  aoSair,
}: {
  legenda?: string;
  /** Mostra "Aluma" ao lado do logo, em vez da legenda. */
  comMarca?: boolean;
  aoSair: () => void;
}) {
  return (
    <View style={styles.cabecalhoSair}>
      <Image
        source={require('../../assets/images/aluma_logo.jpg')}
        style={styles.logo}
        accessibilityLabel="Logo do Aluma"
      />
      <Text style={comMarca ? styles.marcaPequena : styles.legenda} numberOfLines={1}>
        {comMarca ? 'Aluma' : legenda}
      </Text>
      <Pressable
        style={({ pressed }) => [styles.sair, pressed && styles.pressionado]}
        onPress={aoSair}
        accessibilityRole="button"
        accessibilityLabel="Sair da conta"
      >
        <Text style={styles.legenda}>Sair</Text>
      </Pressable>
    </View>
  );
}

export function BotaoPartida({ texto, aoTocar }: { texto: string; aoTocar: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.partida, pressed && styles.pressionado]}
      onPress={aoTocar}
      accessibilityRole="button"
      accessibilityLabel={texto}
    >
      <Text style={styles.partidaTexto}>{texto}</Text>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M9 5l7 7-7 7" stroke={Horizonte.luma} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

export function CabecalhoMarca() {
  return (
    <View style={styles.marca}>
      <Image
        source={require('../../assets/images/aluma_logo.jpg')}
        style={styles.marcaLogo}
        accessibilityLabel="Logo do Aluma"
      />
      <Text style={styles.marcaTexto}>Aluma</Text>
    </View>
  );
}

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

const CELULAS_DO_CODIGO = [0, 1, 2, 3, 4, 5];

/**
 * Seis células para o código da turma. Um único campo invisível fica por cima e recebe a digitação:
 * o teclado e o leitor de tela enxergam um campo só, e o toque vale para o grupo inteiro.
 */
export function CodigoTurma({
  rotulo,
  valor,
  erro,
  aoMudar,
  aoEnviar,
  editavel,
}: {
  rotulo: string;
  valor: string;
  erro?: string | null;
  aoMudar: (texto: string) => void;
  aoEnviar: () => void;
  editavel: boolean;
}) {
  const [emFoco, setEmFoco] = useState(false);
  const atual = Math.min(valor.length, CELULAS_DO_CODIGO.length - 1);

  return (
    <View style={styles.campoCodigo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={styles.celulas}>
        {CELULAS_DO_CODIGO.map((i) => {
          const naVez = emFoco && i === atual;
          return (
            <View
              key={i}
              style={[styles.celula, naVez && styles.celulaFoco, !!erro && styles.celulaErro]}
            >
              <Text style={[styles.celulaTexto, naVez && !valor[i] && styles.celulaCursor]}>
                {valor[i]?.toUpperCase() ?? (naVez ? '|' : '')}
              </Text>
            </View>
          );
        })}
        <TextInput
          style={[styles.codigoInvisivel, Platform.OS === 'web' && SEM_CONTORNO_WEB]}
          value={valor}
          onChangeText={aoMudar}
          onFocus={() => setEmFoco(true)}
          onBlur={() => setEmFoco(false)}
          onSubmitEditing={aoEnviar}
          accessibilityLabel={rotulo}
          accessibilityHint={erro ?? undefined}
          maxLength={CELULAS_DO_CODIGO.length}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          returnKeyType="send"
          editable={editavel}
        />
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
  textoOcupado = texto,
  rotulo,
  ocupado = false,
  alto = false,
  compacto = false,
  aoTocar,
}: {
  texto: string;
  textoOcupado?: string;
  /** Para o leitor de tela, quando o texto sozinho não diz o que o botão faz. */
  rotulo?: string;
  ocupado?: boolean;
  /** 60px em vez de 56px: só em "Conversar com o tutor". */
  alto?: boolean;
  /** 52px, para ficar ao lado de outro botão. */
  compacto?: boolean;
  aoTocar: () => void;
}) {
  const atual = ocupado ? textoOcupado : texto;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.botao,
        alto && styles.botaoAlto,
        compacto && styles.botaoCompacto,
        pressed && styles.pressionado,
        ocupado && styles.botaoOcupado,
      ]}
      onPress={aoTocar}
      disabled={ocupado}
      accessibilityRole="button"
      accessibilityLabel={rotulo ?? atual}
      accessibilityState={{ disabled: ocupado, busy: ocupado }}
    >
      <Text style={[styles.botaoTexto, compacto && styles.botaoCompactoTexto]}>{atual}</Text>
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

export function AvisoCarregando({ texto }: { texto: string }) {
  return (
    <View style={styles.carregando} accessibilityLiveRegion="polite">
      <ActivityIndicator color={Horizonte.textMuted} />
      <Text style={styles.carregandoTexto}>{texto}</Text>
    </View>
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

/** Aviso que não é erro, como "Conta criada!": sem a cor de erro. */
export function AvisoInfo({ mensagem }: { mensagem: string }) {
  return (
    <View style={[styles.aviso, styles.avisoInfo]}>
      <Text style={[styles.avisoTexto, styles.avisoInfoTexto]} accessibilityRole="alert" accessibilityLiveRegion="polite">
        {mensagem}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pressionado: { opacity: 0.85 },

  tela: { flex: 1, overflow: 'hidden', backgroundColor: Horizonte.bg },
  rolagem: { flex: 1 },
  // overflow: a curva do planeta passa do fim da tela e não pode criar rolagem vazia na web.
  conteudo: { flexGrow: 1, overflow: 'hidden' },
  camada: { zIndex: 1 },

  titulo: {
    fontFamily: FontesHorizonte.display,
    fontSize: 31,
    lineHeight: 37,
    letterSpacing: -0.5,
    color: Horizonte.text,
  },
  subtitulo: { fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, color: Horizonte.textMuted },

  falaDaLuma: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 16, lineHeight: 23, color: Horizonte.luma },

  cabecalhoSair: { flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: -8 },
  legenda: { fontFamily: FontesHorizonte.corpoForte, fontSize: 14, lineHeight: 20, color: Horizonte.textMuted, flexShrink: 1 },
  marcaPequena: { flexShrink: 1, fontFamily: FontesHorizonte.display, fontSize: 18, lineHeight: 24, color: Horizonte.text },
  carregando: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  carregandoTexto: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, textAlign: 'center', color: Horizonte.textMuted },
  sair: { minWidth: 44, minHeight: 44, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },

  partida: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 48,
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 16,
    borderWidth: 1.5,
    borderColor: Horizonte.luma,
    borderRadius: 24,
    backgroundColor: Horizonte.surface,
  },
  partidaTexto: { flex: 1, minWidth: 0, fontFamily: FontesHorizonte.corpoMedio, fontSize: 15, lineHeight: 22, color: Horizonte.text },

  marca: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 44 },
  marcaLogo: { width: 40, height: 40, borderRadius: 20 },
  marcaTexto: { fontFamily: FontesHorizonte.display, fontSize: 19, color: Horizonte.text },

  campoCodigo: { gap: 8 },
  celulas: { flexDirection: 'row', gap: 6, height: 60 },
  celula: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Horizonte.fieldBorder,
    borderRadius: 14,
    backgroundColor: Horizonte.fieldBg,
  },
  // Só a cor muda: uma borda mais grossa empurraria as células vizinhas a cada letra digitada.
  celulaFoco: { borderColor: Horizonte.action },
  celulaErro: { borderColor: Horizonte.error },
  celulaTexto: { fontFamily: FontesHorizonte.display, fontSize: 22, color: Horizonte.text },
  celulaCursor: { color: Horizonte.action },
  // Fonte de 16px: abaixo disso, o iPhone dá zoom na tela ao tocar no campo.
  codigoInvisivel: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, fontSize: 16 },

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
  botaoAlto: { minHeight: 60, borderRadius: 30 },
  botaoCompacto: { minHeight: 52, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 26 },
  botaoCompactoTexto: { fontSize: 15, lineHeight: 22 },
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
  avisoInfo: { borderColor: Horizonte.fieldBorder },
  avisoInfoTexto: { color: Horizonte.text },
});
