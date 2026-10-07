import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MessageBubble } from '@/components/balao-mensagem';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Night } from '@/constants/theme';
import { BackendStatus, useBackendStatus } from '@/hooks/use-backend-status';
import { sendMessage } from '@/services/api';
import type { ChatApiAuthor } from '@/types/api';

// Passo 3 do roteiro de aceite: servidor dormindo não pode parecer tela travada.
const BACKEND_STATUS_MESSAGE: Record<Exclude<BackendStatus, 'pronto'>, string> = {
  checando: 'Conectando ao tutor…',
  acordando: 'Acordando o tutor, isso pode levar até um minuto.',
  indisponivel: 'O tutor está fora do ar agora. Tente de novo mais tarde.',
};

// Poucas e estáticas: é fundo de leitura, não pode competir com o texto.
const CHAT_STARS = [
  { top: '12%', left: '86%', size: 2, opacity: 0.5, color: Night.starlight },
  { top: '28%', left: '5%', size: 1.5, opacity: 0.45, color: Night.guide },
  { top: '46%', left: '93%', size: 2, opacity: 0.35, color: Night.spark },
  { top: '61%', left: '10%', size: 1.5, opacity: 0.4, color: Night.starlight },
  { top: '74%', left: '72%', size: 2, opacity: 0.35, color: Night.guide },
  { top: '20%', left: '42%', size: 1, opacity: 0.5, color: Night.starlight },
] as const;

interface Message {
  id: string;
  author: ChatApiAuthor;
  text: string;
}

export default function ChatScreen() {
  const [backendStatus, tentarNovamente] = useBackendStatus();
  const isBackendReady = backendStatus === 'pronto';
  const listRef = useRef<FlatList<Message>>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      author: 'tutor',
      text: 'Olá! Sou o orientador de estudos do Aluma. Qual tópico você gostaria de explorar hoje?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const canSend = isBackendReady && !isSending;

  // Mensagem nova ou teclado abrindo (a lista encolhe): a última fala continua à vista.
  const scrollToLatest = () => listRef.current?.scrollToEnd({ animated: true });

  const handleSendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || !canSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      author: 'aluno',
      text: trimmedText,
    };

    // Histórico é o que veio ANTES desta mensagem; o backend corta os 10 mais recentes.
    const historico = messages.map((message) => ({ autor: message.author, texto: message.text }));

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setSendError(null);
    setIsSending(true);

    const result = await sendMessage(trimmedText, historico);

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

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.stars} pointerEvents="none">
          {CHAT_STARS.map((star, index) => (
            <View
              key={index}
              style={{
                position: 'absolute',
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                backgroundColor: star.color,
                opacity: star.opacity,
              }}
            />
          ))}
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
              <Pressable onPress={tentarNovamente} accessibilityRole="button">
                <Text style={styles.retryText}>Tentar de novo</Text>
              </Pressable>
            )}
          </View>
        )}
        {sendError && (
          <Text style={[styles.statusBanner, styles.bannerText]} accessibilityLiveRegion="polite">
            {sendError}
          </Text>
        )}

        <FlatList
          ref={listRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          data={messages}
          keyExtractor={(item) => item.id}
          onContentSizeChange={scrollToLatest}
          onLayout={scrollToLatest}
          renderItem={({ item }) => <MessageBubble author={item.author} text={item.text} />}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Escreva sua dúvida"
            placeholderTextColor={Night.dust}
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              setSendError(null);
            }}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            multiline={false}
          />
          <Pressable
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel={isSending ? 'Enviando mensagem' : 'Enviar mensagem'}
            accessibilityState={{ disabled: !canSend, busy: isSending }}
          >
            <IconSymbol name="paperplane.fill" size={20} color={Night.sky} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Regra 1: Nenhuma altura fixa. Ocupa 100% da tela disponível pelo flexbox do pai.
    flex: 1,
  },
  container: {
    // Regra 1: Eixo vertical principal. flex: 1 engloba a lista e a barra de input.
    flex: 1,
    backgroundColor: Night.sky,
  },
  stars: {
    // Regra 3: absolute só na decoração, atrás de tudo.
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  privacyNotice: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    textAlign: 'center',
    color: Night.dust,
  },
  statusBanner: {
    // Altura natural, como a barra de digitar: a lista abaixo absorve o resto.
    paddingHorizontal: 16,
    paddingVertical: 10,
    textAlign: 'center',
  },
  statusBannerRow: {
    // Mesma altura natural do statusBanner, mas em row pra caber o botão de retry ao lado.
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerText: {
    // Regra 2: texto em row encolhe em vez de vazar.
    flexShrink: 1,
    minWidth: 0,
    fontSize: 14,
    textAlign: 'center',
    color: Night.starlight,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    color: Night.guide,
  },
  messageList: {
    // Regra 1: a lista come o espaço que sobra; com o teclado aberto, ela é quem encolhe.
    flex: 1,
  },
  messageListContent: {
    // Regra 4: Espaçamento entre os balões utilizando gap no container em vez de margens individuais.
    padding: 16,
    gap: 14,
  },
  inputBar: {
    // A barra de digitar NÃO leva flex: altura natural, a FlatList acima absorve o espaço livre.
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Regra 4: gap entre o input e o botão.
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  input: {
    // Estica e preenche o espaço horizontal livre da row.
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(124, 137, 166, 0.35)',
    backgroundColor: 'rgba(231, 236, 245, 0.05)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Night.starlight,
  },
  sendButton: {
    // Tamanho fixo por natureza (é um ícone), exceção da regra 1; 44px é o alvo mínimo de toque.
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Night.spark,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
