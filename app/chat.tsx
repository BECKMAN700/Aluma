import React, { useState } from 'react';
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
import { Colors } from '@/constants/theme';
import { BackendStatus, useBackendStatus } from '@/hooks/use-backend-status';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { sendMessage } from '@/services/api';
import type { ChatApiAuthor } from '@/types/aluma';

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

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const [backendStatus, tentarNovamente] = useBackendStatus();
  const isBackendReady = backendStatus === 'pronto';

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

  const handleSendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || !isBackendReady || isSending) return;

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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.privacyNotice, { color: theme.icon, borderBottomColor: theme.icon }]}>
          Não escreva seu nome nem outros dados pessoais durante a conversa.
        </Text>
        {backendStatus !== 'pronto' && (
          <View style={[styles.statusBannerRow, { borderBottomColor: theme.icon }]}>
            <Text style={[styles.statusBannerText, { color: theme.text }]} accessibilityLiveRegion="polite">
              {BACKEND_STATUS_MESSAGE[backendStatus]}
            </Text>
            {backendStatus === 'indisponivel' && (
              <Pressable onPress={tentarNovamente} accessibilityRole="button">
                <Text style={[styles.retryText, { color: theme.tint }]}>Tentar de novo</Text>
              </Pressable>
            )}
          </View>
        )}
        {sendError && (
          <Text
            style={[styles.statusBanner, { color: theme.text, borderBottomColor: theme.icon }]}
            accessibilityLiveRegion="polite"
          >
            {sendError}
          </Text>
        )}
        <FlatList
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isStudent = item.author === 'aluno';
            return (
              <View
                style={[
                  styles.bubble,
                  isStudent ? styles.studentBubble : styles.tutorBubble,
                  {
                    backgroundColor: isStudent ? theme.tint : theme.background,
                    borderColor: isStudent ? theme.tint : theme.icon,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    {
                      color: isStudent ? Colors.light.text : theme.text,
                    },
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            );
          }}
        />

        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.icon,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                borderColor: theme.icon,
              },
            ]}
            placeholder="Digite sua dúvida..."
            placeholderTextColor={theme.icon}
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              setSendError(null);
            }}
            multiline={false}
          />
          <Pressable
            style={[
              styles.sendButton,
              { backgroundColor: theme.tint },
              (!isBackendReady || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!isBackendReady || isSending}
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            accessibilityState={{ disabled: !isBackendReady || isSending }}
          >
            <Text style={[styles.sendButtonText, { color: Colors.light.text }]}>
              {isSending ? 'Enviando…' : 'Enviar'}
            </Text>
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
  statusBanner: {
    // Altura natural, como a barra de digitar: a lista abaixo absorve o resto.
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    textAlign: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statusBannerRow: {
    // Mesma altura natural do statusBanner, mas em row pra caber o botão de retry ao lado.
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statusBannerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  privacyNotice: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 12,
    textAlign: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  container: {
    // Regra 1: Eixo vertical principal. flex: 1 engloba a lista e a barra de input.
    flex: 1,
  },
  messageList: {
    // Regra 1: A lista tem flex: 1 para ocupar todo o espaço vertical disponível que sobra,
    // empurrando naturalmente a barra de digitar para a base.
    flex: 1,
  },
  messageListContent: {
    // Regra 4: Espaçamento entre os balões utilizando gap no container em vez de margens individuais.
    padding: 16,
    gap: 12,
  },
  bubble: {
    // Regra 5: alignSelf para posicionar o balão individualmente no eixo cruzado (horizontal).
    // Regra 6: maxWidth em porcentagem tipada sem `as any`.
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  studentBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  tutorBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    // Regra 2: flexShrink: 1 garante que textos longos não vazem da tela e quebrem linha normalmente.
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  inputBar: {
    // A barra de digitar NÃO leva flex. Ela adota sua altura natural baseada no conteúdo,
    // enquanto a FlatList acima absorve o espaço livre dinamicamente.
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Regra 4: gap entre o input e o botão.
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    // O TextInput recebe flex: 1 para esticar e preencher todo o espaço horizontal livre da row.
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendButton: {
    // O botão fica com seu tamanho intrínseco/natural baseado no conteúdo e no padding.
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    // Regra 2: Em containers de linha (row), flexShrink evita estouro de largura.
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
  },
});

