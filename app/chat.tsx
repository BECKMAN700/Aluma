import React, { useEffect, useEffectEvent, useRef, useState } from 'react';
import {
  FlatList,
  Image,
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
import { Surgir } from '@/components/horizonte/ceu';
import { AvisoErro, LinkTexto, SEM_CONTORNO_WEB } from '@/components/horizonte/formulario';
import { FontesHorizonte } from '@/constants/theme';
import { BackendStatus, useBackendStatus } from '@/hooks/use-backend-status';
import { AcoesDoTopico } from '@/components/acoes-do-topico';
import { useSessao } from '@/hooks/use-sessao';
import { buscarConversaAtual, sendMessage } from '@/services/api';
import { escolherFoto, type Foto, limparPartida, partidaComFoto } from '@/services/foto';
import { BotaoFoto, erroDaFoto, FECHAR, MenuDaFoto, type OrigemDaFoto } from '@/components/menu-da-foto';
import { mensagensDaConversa } from '@/services/projetos';
import { CascaDoAluno } from '@/components/casca-do-aluno';
import { useTelaDividida } from '@/constants/auth-theme';
import type { ChatApiAuthor } from '@/types/api';
import { type Cores, useCores, useEstilos } from '@/hooks/use-tema';

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
  /** uri local da foto enviada nesta sessão da tela. */
  foto?: string;
}

// Foto sem texto: o servidor exige mensagem, e a IA precisa saber o que o aluno quer.
const PEDIDO_DA_FOTO = 'Me ajuda com esta questão.';

// Só na tela: não é gravada nem vai para o servidor. O nome é o da IA da escola.
const ID_SAUDACAO = 'saudacao';
const saudacao = (ia: string): Message => ({
  id: ID_SAUDACAO,
  author: 'tutor',
  text: `Oi, eu sou a ${ia}! Qual dúvida você quer pensar comigo hoje?`,
});

export default function ChatScreen() {
  const cores = useCores();
  const styles = useEstilos(criarEstilos);
  const router = useRouter();
  const margens = useSafeAreaInsets();
  // `topico` vem da trilha: a conversa e o material passam a ser daquele tópico.
  // `conversa` é de um projeto do aluno; `mensagem` é a pergunta digitada no início.
  const { topico, nome, conversa: conversaDoProjeto, mensagem } = useLocalSearchParams<{
    topico?: string; nome?: string; conversa?: string; mensagem?: string;
  }>();
  const [backendStatus, tentarNovamente] = useBackendStatus();
  const isBackendReady = backendStatus === 'pronto';
  const listRef = useRef<FlatList<Message>>(null);

  const { sessao } = useSessao();
  const ia = (sessao.estado === 'pronto' && sessao.usuario.escola?.nome_da_ia) || 'Luma';
  const pc = useTelaDividida();
  const [messages, setMessages] = useState<Message[]>(() => [saudacao(ia)]);
  const [inputText, setInputText] = useState(() => partidaComFoto()?.texto ?? '');
  const [emFoco, setEmFoco] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [foto, setFoto] = useState<Foto | null>(() => partidaComFoto()?.foto ?? null);
  // Lida no useState acima; limpa depois, para outra conversa não abrir com a mesma foto.
  useEffect(() => limparPartida(), []);
  const [menuFoto, setMenuFoto] = useState(false);
  const [preparandoFoto, setPreparandoFoto] = useState(false);
  const [conversaSalva, setConversa] = useState<'carregando' | 'erro' | 'pronta'>('carregando');
  const [tentativaConversa, setTentativaConversa] = useState(0);

  const professor = sessao.estado === 'pronto' && sessao.usuario.papel === 'professor';
  const conversa = professor ? 'pronta' : conversaSalva;

  // Abre de onde o aluno parou: a conversa vem do servidor, não do aparelho.
  // O professor só testa: começa vazio e nada é gravado.
  useEffect(() => {
    if (professor) return;
    let ativo = true;
    (conversaDoProjeto ? mensagensDaConversa(conversaDoProjeto) : buscarConversaAtual(topico)).then((r) => {
      if (!ativo) return;
      if (!r.ok) {
        setConversa('erro');
        return;
      }
      const salvas = r.dados.mensagens.map((m, i) => ({ id: `salva-${i}`, author: m.autor, text: m.texto }));
      setMessages([saudacao(ia), ...salvas]);
      setConversa('pronta');
    });
    return () => {
      ativo = false;
    };
  }, [tentativaConversa, topico, conversaDoProjeto, professor, ia]);

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

  const enviarTexto = async (texto: string, comFoto?: Foto | null) => {
    const trimmedText = texto.trim() || (comFoto ? PEDIDO_DA_FOTO : '');
    if (!trimmedText || !canSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      author: 'aluno',
      text: trimmedText,
      foto: comFoto?.uri,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setFoto(null);
    setMenuFoto(false);
    setSendError(null);
    setIsSending(true);

    const historico = professor
      ? messages.filter((m) => m.id !== ID_SAUDACAO).map((m) => ({ autor: m.author, texto: m.text }))
      : undefined;
    const result = await sendMessage(trimmedText, topico, historico, conversaDoProjeto, comFoto?.base64);
    // Na internet fraca o envio falha: a foto volta para o campo em vez de o aluno tirar outra.
    if (!result.ok && comFoto) setFoto(comFoto);

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

  const handleSendMessage = () => enviarTexto(inputText, foto);

  const pegarFoto = async (origem: OrigemDaFoto) => {
    setMenuFoto(false);
    setSendError(null);
    setPreparandoFoto(true);
    try {
      const escolhida = await escolherFoto(origem);
      if (escolhida) setFoto(escolhida);
    } catch (e) {
      setSendError(erroDaFoto(e));
    } finally {
      setPreparandoFoto(false);
    }
  };

  // Aberto direto pelo endereço, na web, não há tela anterior para voltar.
  const voltar = () => (router.canGoBack() ? router.back() : router.replace(professor ? '/turmas' : '/home'));

  // Veio do início (pergunta digitada): envia assim que o tutor e a conversa estiverem
  // prontos. Tira do endereço para recarregar a página não enviar de novo.
  const textoPartida = mensagem?.slice(0, 2000) || undefined;
  const enviarPartida = useEffectEvent((texto: string) => {
    router.setParams({ mensagem: undefined });
    enviarTexto(texto);
  });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- é o envio ao servidor, um efeito de verdade; acontece uma vez só.
    if (textoPartida && canSend) enviarPartida(textoPartida);
  }, [textoPartida, canSend]);

  // O aluno conversa dentro da casca com a gaveta; no celular, a barra da casca já mostra o título.
  const naCasca = !professor;
  const tela = (
    <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style={cores.claro ? 'dark' : 'light'} />

      <Surgir
        style={[
          styles.coluna,
          {
            paddingTop: naCasca && !pc ? 4 : margens.top + 4,
            paddingBottom: margens.bottom,
          },
        ]}
      >
        {(!naCasca || pc) && <View style={styles.cabecalho}>
          <Pressable
            style={({ pressed }) => [styles.voltar, pressed && styles.pressionado]}
            onPress={voltar}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 5l-7 7 7 7"
                stroke={cores.text}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
          <Text style={styles.titulo} accessibilityRole="header" numberOfLines={1}>
            {nome ? `${ia} · ${nome}` : ia}
          </Text>
        </View>}

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
        {professor && (
          <Text style={styles.privacyNotice}>Modo de teste do professor: nada desta conversa é gravado.</Text>
        )}
        {!!topico && !professor && conversa === 'pronta' && (
          <AcoesDoTopico
            topicoId={topico}
            desabilitado={!canSend}
            inicio={!messages.some((m) => m.author === 'aluno')}
            aoEnviar={enviarTexto}
            aoResultado={(texto) =>
              setMessages((anteriores) => [...anteriores, { id: `avaliacao-${Date.now()}`, author: 'tutor', text: texto }])
            }
          />
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
          renderItem={({ item }) => <MessageBubble author={item.author} text={item.text} foto={item.foto} />}
          ListFooterComponent={isSending ? <LumaPensando ia={ia} /> : null}
        />

        {menuFoto && <MenuDaFoto aoEscolher={pegarFoto} style={styles.menuFoto} />}

        <View style={styles.inputBar}>
          <View style={[styles.campo, !!foto && styles.campoComFoto, emFoco && styles.inputFoco]}>
            {foto && (
              <View style={styles.previa}>
                <Image
                  source={{ uri: foto.uri }}
                  style={styles.previaImagem}
                  accessibilityLabel="Foto da questão, pronta para enviar"
                />
                <Pressable
                  style={styles.removerFoto}
                  onPress={() => setFoto(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Remover a foto"
                >
                  <View style={styles.removerFotoCirculo}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path d={FECHAR} stroke={cores.bg} strokeWidth={3} strokeLinecap="round" />
                    </Svg>
                  </View>
                </Pressable>
              </View>
            )}
            <View style={styles.campoLinha}>
              <BotaoFoto
                aberto={menuFoto}
                desabilitado={preparandoFoto || isSending}
                ocupado={preparandoFoto}
                aoTocar={() => setMenuFoto((aberto) => !aberto)}
              />
          <TextInput
            style={[styles.input, Platform.OS === 'web' && SEM_CONTORNO_WEB]}
            placeholder={foto ? 'Escreva sua dúvida (opcional)' : 'Escreva sua dúvida'}
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
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              !canSend && styles.sendButtonDisabled,
              pressed && styles.pressionado,
            ]}
            onPress={handleSendMessage}
            disabled={!canSend || preparandoFoto}
            accessibilityRole="button"
            accessibilityLabel={isSending ? 'Enviando mensagem' : 'Enviar mensagem'}
            accessibilityState={{ disabled: !canSend, busy: isSending }}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7Z"
                stroke={canSend ? cores.onAction : cores.action}
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
  return naCasca ? <CascaDoAluno titulo={nome ?? ia}>{tela}</CascaDoAluno> : tela;
}

const criarEstilos = (cores: Cores) => StyleSheet.create({
  wrapper: {
    // Regra 1: Nenhuma altura fixa. Ocupa 100% da tela disponível pelo flexbox do pai.
    flex: 1,
    overflow: 'hidden',
    backgroundColor: cores.bg,
  },
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
    color: cores.text,
  },
  privacyNotice: {
    marginTop: 26,
    paddingHorizontal: 20,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: cores.textMuted,
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
    color: cores.text,
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
  campo: {
    // A borda do campo abraça o botão +, o texto e a prévia da foto (opção B do Design, 15/11).
    flex: 1,
    minWidth: 0,
    borderWidth: 1.5,
    borderColor: cores.fieldBorder,
    backgroundColor: cores.fieldBg,
    borderRadius: 24,
    padding: 3,
  },
  campoComFoto: { borderRadius: 22, padding: 8, gap: 6 },
  campoLinha: { flexDirection: 'row', alignItems: 'center' },
  previa: { width: 72, height: 72 },
  previaImagem: { width: 72, height: 72, borderRadius: 12 },
  // Alvo de toque de 44px; o círculo visível é menor, no canto da prévia.
  removerFoto: { position: 'absolute', top: -10, right: -14, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  removerFotoCirculo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.text,
  },
  menuFoto: { alignSelf: 'flex-start', marginHorizontal: 16, marginTop: 8 },
  input: {
    // Estica e preenche o espaço horizontal livre da row.
    flex: 1,
    minWidth: 0,
    height: 40,
    paddingHorizontal: 12,
    fontFamily: FontesHorizonte.corpo,
    // 16px: abaixo disso, o iPhone dá zoom na tela ao tocar no campo.
    fontSize: 16,
    color: cores.text,
  },
  inputFoco: { borderWidth: 2, borderColor: cores.action },
  sendButton: {
    // Tamanho fixo por natureza (é um ícone), exceção da regra 1.
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.action,
  },
  sendButtonDisabled: {
    // Escuro com contorno dourado: mostra que não aceita toque, sem perder o contraste.
    borderWidth: 1.5,
    borderColor: cores.action,
    backgroundColor: cores.studentBubble,
  },
});
