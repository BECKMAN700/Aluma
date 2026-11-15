/**
 * Um projeto do aluno (rota /projeto/[id]): as conversas dele e "Nova conversa". Privado: só o
 * aluno vê, e o painel do professor não conta essas conversas.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';

import { CascaDoAluno } from '@/components/casca-do-aluno';
import { AvisoCarregando, AvisoErro } from '@/components/horizonte/formulario';
import { Pilula, estilosSistema } from '@/components/sistema';
import { FontesHorizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { type Cores, useCores, useEstilos } from '@/hooks/use-tema';
import { apagarProjeto, listarProjetos, novaConversaNoProjeto } from '@/services/projetos';

export default function ProjetoScreen() {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [projetos] = useDadosDaTela(listarProjetos);
  const projeto = projetos.estado === 'pronto' ? projetos.dados.projetos.find((p) => p.id === id) : undefined;
  const [erro, setErro] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const abrirConversa = (conversa: string, titulo: string | null) =>
    router.push({ pathname: '/chat', params: { conversa, nome: titulo ?? projeto?.nome } });

  const nova = async () => {
    const r = await novaConversaNoProjeto(id);
    if (!r.ok) return setErro(r.erro);
    abrirConversa(r.dados.id, null);
  };

  const apagar = async () => {
    const r = await apagarProjeto(id);
    if (!r.ok) return setErro(r.erro);
    router.replace('/home');
  };

  return (
    <CascaDoAluno titulo={projeto?.nome}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        {projetos.estado === 'carregando' && <AvisoCarregando texto="Abrindo o projeto…" />}
        {projetos.estado === 'pronto' && !projeto && <AvisoErro mensagem="Este projeto não existe mais." />}
        {projeto && (
          <>
            <View style={styles.cabecalho}>
              <MaterialIcons name="folder-open" size={28} color={cores.action} />
              <Text style={styles.titulo} accessibilityRole="header">{projeto.nome}</Text>
            </View>
            <Text style={styles.apoio}>Suas conversas sobre este assunto. Só você vê.</Text>
            {!!erro && <AvisoErro mensagem={erro} />}
            <View style={estilosSistema.acoes}>
              <Pilula texto="+ Nova conversa" destaque aoTocar={nova} />
            </View>
            {projeto.conversas.length === 0 && <Text style={styles.apoio}>Nenhuma conversa ainda.</Text>}
            {projeto.conversas.map((c) => (
              <Pressable
                key={c.id}
                style={({ pressed }) => [styles.conversa, pressed && styles.pressionado]}
                onPress={() => abrirConversa(c.id, c.titulo)}
                accessibilityRole="link"
              >
                <MaterialIcons name="chat-bubble-outline" size={18} color={cores.textMuted} />
                <Text style={styles.conversaTexto} numberOfLines={1}>{c.titulo ?? 'Conversa sem pergunta ainda'}</Text>
              </Pressable>
            ))}
            <View style={styles.perigo}>
              {confirmando ? (
                <>
                  <Text style={styles.apoio}>Apagar o projeto apaga todas as conversas dele. Não dá para desfazer.</Text>
                  <View style={estilosSistema.acoes}>
                    <Pilula texto="Sim, apagar" aoTocar={apagar} />
                    <Pilula texto="Cancelar" aoTocar={() => setConfirmando(false)} />
                  </View>
                </>
              ) : (
                <Pilula texto="Apagar projeto" aoTocar={() => setConfirmando(true)} />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </CascaDoAluno>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    pressionado: { opacity: 0.85 },
    conteudo: { width: '100%', maxWidth: 760, alignSelf: 'center', gap: 12, padding: 24 },
    cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    titulo: { flex: 1, fontFamily: FontesHorizonte.display, fontSize: 26, color: cores.text },
    apoio: { fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, color: cores.textMuted },
    conversa: {
      flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 14, borderRadius: 14,
      borderWidth: 1, borderColor: cores.hairline, backgroundColor: cores.surface,
    },
    conversaTexto: { flex: 1, fontFamily: FontesHorizonte.corpoMedio, fontSize: 15, color: cores.text },
    perigo: { marginTop: 24, gap: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: cores.hairline },
  });
