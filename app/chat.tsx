import React, { useEffect, useEffectEvent, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LumaPensando, MessageBubble } from '@/components/balao-mensagem';
import { CAMINHO_ESTRELA, CeuEstrelado, EstrelaNoHorizonte, Surgir } from '@/components/horizonte/ceu';
import { AvisoErro, LinkTexto, SEM_CONTORNO_WEB } from '@/components/horizonte/formulario';
import { textoDaPartida } from '@/constants/partidas';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { BackendStatus, useBackendStatus } from '@/hooks/use-backend-status';
import { buscarConversaAtual, sendMessage } from '@/services/api';
import type { ChatApiAuthor } from '@/types/api';

// Passo 3 do roteiro de aceite: servidor dormindo não pode parecer tela travada.
const BACKEND_STATUS_MESSAGE: Record<Exclude<BackendStatus, 'pronto'>, string> = {
  checando: 'Conectando ao tutor…',
  acordando: 'Acordando o tutor, isso pode levar até um minuto.',
  indisponivel: 'O tutor está fora do ar agora. Tente de novo mais tarde.',
};

interface Message {
  id: string;
  author: ChatApiAuthor;
  text: string;
}

// Só na tela: não é gravada nem vai para o servidor.
const SAUDACAO: Message = {
  id: 'saudacao',
  author: 'tutor',
  text: 'Oi, eu sou a Luma! Qual dúvida você quer pensar comigo hoje?',
};

export default function ChatScreen() {
  const router = useRouter();
  const margens = useSafeAreaInsets();
  const { partida } = useLocalSearchParams<{ partida?: string }>();
  const [backendStatus, tentarNovamente] = useBackendStatus();
  const isBackendReady = backendStatus === 'pronto';
  const listRef = useRef<FlatList<Message>>(null);

  const [messages, setMessages] = useState<Message[]>([SAUDACAO]);
  const [inputText, setInputText] = useState('');
  const [emFoco, setEmFoco] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [conversa, setConversa] = useState<'carregando' | 'erro' | 'pronta'>('carregando');
  const [tentativaConversa, setTentativaConversa] = useState(0);

  // Abre de onde o aluno parou: a conversa vem do servidor, não do aparelho.
  useEffect(() => {
    let ativo = true;
    buscarConversaAtual().then((r) => {
      if (!ativo) return;
      if (!r.ok) {
        setConversa('erro');
        return;
      }
      const salvas = r.dados.mensagens.map((m, i) => ({ id: `salva-${i}`, author: m.autor, text: m.texto }));
      setMessages([SAUDACAO, ...salvas]);
      setConversa('pronta');
    });
    return () => {
      ativo = false;
    };
  }, [tentativaConversa]);

  const recarregarConversa = () => {
    setConversa('carregando');
    setTentativaConversa((t) => t + 1);
  };

  // Só envia com a conversa carregada: senão a resposta nova chegaria antes das antigas.
  const canSend = isBackendReady && !isSending && conversa === 'pronta';

  // Mensagem nova ou teclado abrindo (a lista encolhe): a última fala continua à vista.
  // Pelo ScrollView de baixo, não pela FlatList: ela calcula o fim pelas alturas que já mediu e,
  // no web, parava antes da última fala. O ScrollView usa a altura real do conteúdo.
  // O tipo também admite View, mas a FlatList sempre rola dentro de um ScrollView.
  const scrollToLatest = () =>
    (listRef.current?.getNativeScrollRef() as ScrollView | null | undefined)?.scrollToEnd({
      animated: true,
    });

  const enviarTexto = async (texto: string) => {
    const trimmedText = texto.trim();
    if (!trimmedText || !canSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      author: 'aluno',
      text: trimmedText,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setSendError(null);
    setIsSending(true);

    const result = await sendMessage(trimmedText);

    if (result.ok) {
      const tutorReply: Message = {
        id: (Date.now() + 1).toString(),
        author: 'tutor',
        text: result.resposta,
      };
      setMessages((prevMessages) => [...prevMessages, tutorReply]);
    } else {
      // Nunca uma resposta inventada em caso de falha: só o aviso de erro.
      setSendError(result.erro);
    }

    setIsSending(false);
  };

  const handleSendMessage = () => enviarTexto(inputText);

  // Aberto direto pelo endereço, na web, não há tela anterior para voltar.
  const voltar = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  // Veio de um atalho do início: envia a frase assim que o tutor e a conversa estiverem prontos.
  // Tira o atalho do endereço para recarregar a página não enviar de novo.
  const textoPartida = textoDaPartida(partida);
  const enviarPartida = useEffectEvent((texto: string) => {
    router.setParams({ partida: undefined });
    enviarTexto(texto);
  });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- é o envio ao servidor, um efeito de verdade; acontece uma vez só.
    if (textoPartida && canSend) enviarPartida(textoPartida);
  }, [textoPartida, canSend]);

  return (
    <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <CeuEstrelado />
      {/* Fora da lista: o horizonte fica parado enquanto as falas rolam. */}
      <View style={[styles.horizonte, { top: margens.top + 64 }]} pointerEvents="none">
        <EstrelaNoHorizonte tamanho={0} />
      </View>

      <Surgir
        style={[
          styles.coluna,
          {
            paddingTop: margens.top + 4,
            paddingBottom: margens.bottom,
          },
        ]}
      >
        <View style={styles.cabecalho}>
          <Pressable
            style={({ pressed }) => [styles.voltar, pressed && styles.pressionado]}
            onPress={voltar}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 5l-7 7 7 7"
                stroke={Horizonte.text}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
          <Svg width={22} height={22} viewBox="0 0 56 56">
            <Path d={CAMINHO_ESTRELA} fill={Horizonte.luma} />
          </Svg>
          <Text style={styles.titulo} accessibilityRole="header">
            Luma
          </Text>
        </View>

        <Text style={styles.privacyNotice}>
          Não escreva seu nome nem outros dados pessoais durante a conversa.
        </Text>
        {backendStatus !== 'pronto' && (
          <View style={styles.statusBannerRow}>
            <Text style={styles.bannerText} accessibilityLiveRegion="polite">
              {BACKEND_STATUS_MESSAGE[backendStatus]}
            </Text>
            {backendStatus === 'indisponivel' && (
              <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={tentarNovamente} />
            )}
          </View>
        )}
        {isBackendReady && conversa === 'carregando' && (
          <Text style={[styles.statusBanner, styles.bannerText]} accessibilityLiveRegion="polite">
            Carregando sua conversa…
          </Text>
        )}
        {conversa === 'erro' && (
          <View style={styles.statusBannerRow}>
            <Text style={styles.bannerText} accessibilityLiveRegion="polite">
              Não deu para carregar sua conversa.
            </Text>
            <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={recarregarConversa} />
          </View>
        )}
        {sendError && (
          <View style={styles.statusBanner}>
            <AvisoErro mensagem={sendError} />
          </View>
        )}

        <FlatList
          ref={listRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          data={messages}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToLatest}
          onLayout={scrollToLatest}
          renderItem={({ item }) => <MessageBubble author={item.author} text={item.text} />}
          ListFooterComponent={isSending ? <LumaPensando /> : null}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={[styles.input, emFoco && styles.inputFoco, Platform.OS === 'web' && SEM_CONTORNO_WEB]}
            placeholder="Escreva sua dúvida"
            placeholderTextColor="#A9B6CC"
            accessibilityLabel="Escreva sua dúvida"
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              setSendError(null);
            }}
            onFocus={() => setEmFoco(true)}
            onBlur={() => setEmFoco(false)}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            multiline={false}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              !canSend && styles.sendButtonDisabled,
              pressed && styles.pressionado,
            ]}
            onPress={handleSendMessage}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel={isSending ? 'Enviando mensagem' : 'Enviar mensagem'}
            accessibilityState={{ disabled: !canSend, busy: isSending }}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7Z"
                stroke={canSend ? Horizonte.onAction : Horizonte.action}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </View>
      </Surgir>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Regra 1: Nenhuma altura fixa. Ocupa 100% da tela disponível pelo flexbox do pai.
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Horizonte.bg,
  },
  horizonte: { position: 'absolute', left: 0, right: 0 },
  coluna: {
    // Regra 1: Eixo vertical principal. flex: 1 engloba a lista e a barra de input.
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  pressionado: { opacity: 0.85 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 6, paddingRight: 12, minHeight: 48 },
  voltar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titulo: {
    marginLeft: 6,
    fontFamily: FontesHorizonte.display,
    fontSize: 18,
    lineHeight: 24,
    color: Horizonte.text,
  },
  privacyNotice: {
    marginTop: 26,
    paddingHorizontal: 20,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: Horizonte.textMuted,
  },
  statusBanner: {
    // Altura natural, como a barra de digitar: a lista abaixo absorve o resto.
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  statusBannerRow: {
    // Mesma altura natural do statusBanner, mas em row pra caber o botão de retry ao lado.
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  bannerText: {
    // Regra 2: texto em row encolhe em vez de vazar.
    flexShrink: 1,
    minWidth: 0,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: Horizonte.text,
  },
  messageList: {
    // Regra 1: a lista come o espaço que sobra; com o teclado aberto, ela é quem encolhe.
    flex: 1,
  },
  messageListContent: {
    // flexGrow e flex-end: com poucas falas, a conversa fica perto do campo de digitar.
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  inputBar: {
    // A barra de digitar NÃO leva flex: altura natural, a FlatList acima absorve o espaço livre.
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  input: {
    // Estica e preenche o espaço horizontal livre da row.
    flex: 1,
    minWidth: 0,
    height: 48,
    borderWidth: 1.5,
    borderColor: Horizonte.fieldBorder,
    backgroundColor: Horizonte.fieldBg,
    borderRadius: 24,
    paddingHorizontal: 18,
    fontFamily: FontesHorizonte.corpo,
    // 16px: abaixo disso, o iPhone dá zoom na tela ao tocar no campo.
    fontSize: 16,
    color: Horizonte.text,
  },
  inputFoco: { borderWidth: 2, borderColor: Horizonte.action },
  sendButton: {
    // Tamanho fixo por natureza (é um ícone), exceção da regra 1.
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Horizonte.action,
  },
  sendButtonDisabled: {
    // Escuro com contorno dourado: mostra que não aceita toque, sem perder o contraste.
    borderWidth: 1.5,
    borderColor: Horizonte.action,
    backgroundColor: Horizonte.studentBubble,
  },
});
