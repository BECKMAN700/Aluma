/**
 * Casca das telas do aluno, aprovada em 15/11 (estilo app do Claude): a gaveta com nova
 * conversa, busca, trilha, turma, projetos e recentes. No PC fica fixa à esquerda; no celular
 * abre por cima, pelo botão de menu da barra do topo.
 */
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, usePathname, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SEM_CONTORNO_WEB } from '@/components/horizonte/formulario';
import { LogoDaEscola } from '@/components/logo-da-escola';
import { useTelaDividida } from '@/constants/auth-theme';
import { FontesHorizonte } from '@/constants/theme';
import { useSessao } from '@/hooks/use-sessao';
import { type Cores, useCores, useEstilos } from '@/hooks/use-tema';
import { sair } from '@/services/auth';
import { enderecoDaLogo } from '@/services/convites';
import { listarMaterias } from '@/services/materias';
import { criarProjeto, listarProjetos } from '@/services/projetos';
import type { Projeto, Topico } from '@/types/api';

const RECENTES = 5;

export function CascaDoAluno({ titulo, children }: { titulo?: string; children: React.ReactNode }) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();
  const margens = useSafeAreaInsets();
  const pc = useTelaDividida();
  const [aberta, setAberta] = useState(false);
  const { sessao } = useSessao();
  const sistema = sessao.estado === 'pronto' ? sessao.usuario.escola?.nome_do_sistema : undefined;

  return (
    <View style={styles.tela}>
      {pc && <Gaveta />}
      <View style={styles.conteudo}>
        {!pc && (
          <View style={[styles.topo, { paddingTop: margens.top + 8 }]}>
            <Pressable style={styles.menu} onPress={() => setAberta(true)} accessibilityRole="button" accessibilityLabel="Abrir menu">
              <MaterialIcons name="menu" size={26} color={cores.text} />
            </Pressable>
            <Text style={styles.topoTitulo} numberOfLines={1} accessibilityRole="header">
              {titulo ?? sistema ?? 'Aluma'}
            </Text>
          </View>
        )}
        {children}
      </View>
      {!pc && aberta && (
        <View style={StyleSheet.absoluteFill}>
          <Pressable style={styles.veu} onPress={() => setAberta(false)} accessibilityRole="button" accessibilityLabel="Fechar menu" />
          <View style={[styles.gavetaFlutuante, { paddingTop: margens.top }]}>
            <Gaveta aoNavegar={() => setAberta(false)} />
          </View>
        </View>
      )}
    </View>
  );
}

function Gaveta({ aoNavegar }: { aoNavegar?: () => void }) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();
  const caminho = usePathname();
  const { sessao } = useSessao();
  const usuario = sessao.estado === 'pronto' ? sessao.usuario : null;
  const escola = usuario?.escola;
  const [busca, setBusca] = useState('');
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [recentes, setRecentes] = useState<Topico[]>([]);
  const [criando, setCriando] = useState(false);
  const [nomeNovo, setNomeNovo] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  // Busca de novo a cada troca de tela: a conversa nova já aparece em Recentes ao voltar.
  useEffect(() => {
    let valida = true;
    listarProjetos().then((r) => {
      if (valida && r.ok) setProjetos(r.dados.projetos);
    });
    const turma = usuario?.turma?.id;
    if (turma) {
      listarMaterias(turma).then((r) => {
        if (!valida || !r.ok) return;
        const comAtividade = r.dados.materias.flatMap((m) => m.topicos).filter((t) => t.atividade_em);
        setRecentes(comAtividade.sort((a, b) => (b.atividade_em ?? '').localeCompare(a.atividade_em ?? '')).slice(0, RECENTES));
      });
    }
    return () => {
      valida = false;
    };
  }, [caminho, usuario?.turma?.id]);

  const ir = (destino: Href) => {
    aoNavegar?.();
    router.navigate(destino);
  };

  const criar = async () => {
    if (!nomeNovo.trim()) return setErro('Dê um nome ao projeto.');
    const r = await criarProjeto(nomeNovo.trim());
    if (!r.ok) return setErro(r.erro);
    setCriando(false);
    setNomeNovo('');
    setErro(null);
    ir({ pathname: '/projeto/[id]', params: { id: r.dados.id } });
  };

  const filtro = busca.trim().toLowerCase();
  const passa = (texto: string) => !filtro || texto.toLowerCase().includes(filtro);

  return (
    <View style={styles.gaveta} role="navigation" aria-label="Menu do aluno">
      <View style={styles.marca}>
        {escola && (
          <LogoDaEscola
            endereco={escola.tem_logo ? enderecoDaLogo(escola.id) : null}
            formato={escola.logo_formato}
            cor={escola.cor}
            nome={escola.nome_do_sistema}
            tamanho={34}
            corSemFundo={cores.text}
          />
        )}
        <Text style={styles.marcaTexto} numberOfLines={1}>{escola?.nome_do_sistema ?? 'Aluma'}</Text>
      </View>

      <Pressable style={({ pressed }) => [styles.nova, pressed && styles.pressionado]} onPress={() => ir('/home')} accessibilityRole="button">
        <MaterialIcons name="add" size={20} color={cores.onAction} />
        <Text style={styles.novaTexto}>Nova conversa</Text>
      </Pressable>
      <TextInput
        style={[styles.busca, Platform.OS === 'web' && SEM_CONTORNO_WEB]}
        placeholder="Buscar conversas"
        placeholderTextColor={cores.textMuted}
        accessibilityLabel="Buscar conversas"
        value={busca}
        onChangeText={setBusca}
      />

      <ScrollView style={styles.lista} contentContainerStyle={styles.listaConteudo}>
        <Item icone="route" texto="Minha trilha" ativo={caminho === '/trilha'} aoTocar={() => ir('/trilha')} />

        {!!usuario?.turma && (
          <>
            <Text style={styles.secao}>Sua turma</Text>
            <Text style={styles.turma}>{usuario.turma.nome}</Text>
          </>
        )}

        <View style={styles.secaoLinha}>
          <Text style={styles.secao}>Projetos</Text>
          <Pressable style={styles.mais} onPress={() => setCriando((c) => !c)} accessibilityRole="button" accessibilityLabel="Novo projeto">
            <MaterialIcons name={criando ? 'close' : 'add'} size={18} color={cores.action} />
          </Pressable>
        </View>
        {criando && (
          <View style={styles.criar}>
            <TextInput
              style={[styles.busca, Platform.OS === 'web' && SEM_CONTORNO_WEB]}
              placeholder="Nome do projeto"
              placeholderTextColor={cores.textMuted}
              accessibilityLabel="Nome do projeto"
              value={nomeNovo}
              onChangeText={(t) => {
                setNomeNovo(t);
                setErro(null);
              }}
              onSubmitEditing={criar}
              maxLength={60}
              autoFocus
            />
            {!!erro && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
          </View>
        )}
        {projetos.filter((p) => passa(p.nome) || p.conversas.some((c) => passa(c.titulo ?? ''))).map((p) => (
          <Item
            key={p.id}
            icone="folder-open"
            texto={p.nome}
            ativo={caminho === `/projeto/${p.id}`}
            aoTocar={() => ir({ pathname: '/projeto/[id]', params: { id: p.id } })}
          />
        ))}

        {recentes.filter((t) => passa(t.nome)).length > 0 && <Text style={styles.secao}>Recentes</Text>}
        {recentes.filter((t) => passa(t.nome)).map((t) => (
          <Item
            key={t.id}
            icone="chat-bubble-outline"
            texto={t.nome}
            ativo={false}
            aoTocar={() => ir({ pathname: '/chat', params: { topico: t.id, nome: t.nome } })}
          />
        ))}
      </ScrollView>

      <View style={styles.rodape}>
        <Text style={styles.usuario} numberOfLines={1}>{usuario?.nome}</Text>
        <Pressable style={({ pressed }) => [styles.sair, pressed && styles.pressionado]} onPress={sair} accessibilityRole="button">
          <Text style={styles.itemTexto}>Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Item({ icone, texto, ativo, aoTocar }: {
  icone: React.ComponentProps<typeof MaterialIcons>['name']; texto: string; ativo: boolean; aoTocar: () => void;
}) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();
  return (
    <Pressable
      style={({ pressed }) => [styles.item, ativo && styles.itemAtivo, pressed && styles.pressionado]}
      onPress={aoTocar}
      accessibilityRole="link"
      accessibilityState={{ selected: ativo }}
    >
      <MaterialIcons name={icone} size={18} color={cores.textMuted} />
      <Text style={styles.itemTexto} numberOfLines={1}>{texto}</Text>
    </Pressable>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    pressionado: { opacity: 0.8 },
    tela: { flex: 1, flexDirection: 'row', backgroundColor: cores.bg },
    conteudo: { flex: 1, minWidth: 0 },
    topo: {
      flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingBottom: 8,
      borderBottomWidth: 1, borderBottomColor: cores.hairline, backgroundColor: cores.surface,
    },
    menu: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    topoTitulo: { flex: 1, fontFamily: FontesHorizonte.display, fontSize: 17, color: cores.text },
    veu: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(4, 6, 13, 0.55)' },
    gavetaFlutuante: { position: 'absolute', top: 0, bottom: 0, left: 0, flexDirection: 'row', backgroundColor: cores.surface },
    gaveta: {
      width: 280, paddingVertical: 18, paddingHorizontal: 12, gap: 6,
      backgroundColor: cores.surface, borderRightWidth: 1, borderRightColor: cores.hairline,
    },
    marca: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6, paddingBottom: 10 },
    marcaTexto: { flex: 1, fontFamily: FontesHorizonte.display, fontSize: 16, color: cores.text },
    nova: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44,
      borderRadius: 999, backgroundColor: cores.action,
    },
    novaTexto: { fontFamily: FontesHorizonte.corpoForte, fontSize: 15, color: cores.onAction },
    busca: {
      height: 42, marginTop: 6, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: cores.fieldBorder,
      backgroundColor: cores.fieldBg, color: cores.text, fontFamily: FontesHorizonte.corpo, fontSize: 15,
    },
    lista: { flex: 1 },
    listaConteudo: { gap: 2, paddingTop: 8 },
    secaoLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    secao: { paddingTop: 14, paddingBottom: 4, paddingHorizontal: 10, fontFamily: FontesHorizonte.corpo, fontSize: 12, color: cores.textMuted },
    mais: {
      width: 32, height: 32, marginTop: 8, alignItems: 'center', justifyContent: 'center',
      borderRadius: 8, borderWidth: 1, borderColor: cores.hairline,
    },
    criar: { gap: 4, paddingBottom: 4 },
    erro: { paddingHorizontal: 10, fontFamily: FontesHorizonte.corpo, fontSize: 13, color: cores.error },
    turma: { paddingHorizontal: 10, paddingVertical: 8, fontFamily: FontesHorizonte.corpoMedio, fontSize: 15, color: cores.text },
    item: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 10, borderRadius: 10 },
    itemAtivo: { backgroundColor: cores.bg },
    itemTexto: { flexShrink: 1, fontFamily: FontesHorizonte.corpoMedio, fontSize: 15, color: cores.text },
    rodape: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10,
      borderTopWidth: 1, borderTopColor: cores.hairline,
    },
    usuario: { flex: 1, paddingHorizontal: 10, fontFamily: FontesHorizonte.corpo, fontSize: 14, color: cores.textMuted },
    sair: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' },
  });
