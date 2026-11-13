/**
 * Painel da turma (rota /painel/[id]): onde a turma trava. Por tópico, quantos alunos dominaram,
 * estão tentando ou não começaram, e as dúvidas mais comuns resumidas pela IA. O professor nunca
 * vê a conversa do aluno, só o resumo.
 */
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { EstrelaNoHorizonte, Surgir } from '@/components/horizonte/ceu';
import {
  AvisoCarregando,
  AvisoErro,
  CabecalhoVoltar,
  LinkTexto,
  TelaFormulario,
  TituloTela,
} from '@/components/horizonte/formulario';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { sair } from '@/services/auth';
import { buscarPainel, resumirDuvidas } from '@/services/painel';
import type { TopicoNoPainel } from '@/types/api';

export default function PainelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const buscar = useCallback(() => buscarPainel(id), [id]);
  const [dados, tentarDeNovo] = useDadosDaTela(buscar);

  // Quem trava primeiro: mais alunos tentando sem dominar. Empate: a ordem da trilha.
  const topicos =
    dados.estado === 'pronto'
      ? [...dados.dados.topicos].sort((a, b) => b.em_andamento - a.em_andamento || a.ordem - b.ordem)
      : [];

  return (
    <TelaFormulario>
      <Surgir style={styles.camada}>
        <CabecalhoVoltar
          texto="Voltar para a turma"
          aoVoltar={() =>
            router.canGoBack() ? router.back() : router.replace({ pathname: '/turma/[id]', params: { id } })
          }
        />
      </Surgir>

      <TituloTela
        titulo="Onde a turma trava"
        subtitulo="Tópicos com mais alunos ainda tentando aparecem primeiro."
        style={styles.textos}
      />

      <View style={styles.estrela}>
        <EstrelaNoHorizonte tamanho={28} />
      </View>

      <Surgir style={styles.camada}>
        {dados.estado === 'carregando' && <AvisoCarregando texto="Carregando o painel…" />}
        {dados.estado === 'erro' && (
          <>
            <AvisoErro mensagem={dados.erro} />
            <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={tentarDeNovo} />
          </>
        )}
        {dados.estado === 'pronto' && topicos.length === 0 && (
          <Text style={styles.vazio}>Crie uma matéria e os tópicos dela para acompanhar a turma aqui.</Text>
        )}
        {topicos.map((topico) => (
          <CartaoDoTopico key={topico.id} topico={topico} />
        ))}
      </Surgir>
    </TelaFormulario>
  );
}

function CartaoDoTopico({ topico }: { topico: TopicoNoPainel }) {
  const [resumo, setResumo] = useState(topico.resumo);
  const [resumindo, setResumindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const total = topico.dominado + topico.em_andamento + topico.nao_iniciado;

  const resumir = async () => {
    if (resumindo) return;
    setResumindo(true);
    setErro(null);
    try {
      const r = await resumirDuvidas(topico.id);
      if (r.ok) setResumo(r.dados.resumo);
      else if (r.status === 401) await sair();
      else setErro(r.erro);
    } finally {
      setResumindo(false);
    }
  };

  const duvidas = (resumo ?? '')
    .split('\n')
    .map((linha) => linha.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean);

  return (
    <View style={styles.cartao}>
      <Text style={styles.materia}>{topico.materia}</Text>
      <Text style={styles.nome} accessibilityRole="header">
        {topico.nome}
      </Text>

      {/* Barra empilhada: a proporção da turma em cada estado, sem precisar ler os números. */}
      <View
        style={styles.barra}
        accessible
        accessibilityLabel={`${topico.dominado} dominaram, ${topico.em_andamento} tentando, ${topico.nao_iniciado} não começaram`}
      >
        {total > 0 && (
          <>
            <View style={[styles.parte, styles.parteDominado, { flex: topico.dominado }]} />
            <View style={[styles.parte, styles.parteTentando, { flex: topico.em_andamento }]} />
            <View style={[styles.parte, { flex: topico.nao_iniciado }]} />
          </>
        )}
      </View>
      <Text style={styles.contagem}>
        {topico.dominado} dominaram · {topico.em_andamento} tentando · {topico.nao_iniciado} não começaram
      </Text>

      {duvidas.length > 0 && (
        <View style={styles.duvidas}>
          <Text style={styles.duvidasTitulo}>Dúvidas mais comuns</Text>
          {duvidas.map((duvida) => (
            <Text key={duvida} style={styles.duvida}>
              • {duvida}
            </Text>
          ))}
        </View>
      )}
      {!!erro && (
        <Text style={styles.erro} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {erro}
        </Text>
      )}
      <Pressable
        style={({ pressed }) => [styles.botao, (pressed || resumindo) && styles.apagado]}
        onPress={resumir}
        disabled={resumindo}
        accessibilityRole="button"
        accessibilityLabel={`${resumo ? 'Atualizar' : 'Resumir'} as dúvidas do tópico ${topico.nome}`}
        accessibilityState={{ disabled: resumindo, busy: resumindo }}
      >
        <Text style={styles.botaoTexto}>
          {resumindo ? 'Resumindo…' : resumo ? 'Atualizar resumo' : 'Resumir dúvidas com a IA'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  camada: { zIndex: 1 },
  textos: { marginTop: 10 },
  estrela: { marginTop: 41, marginBottom: 18 },
  apagado: { opacity: 0.6 },
  vazio: {
    paddingVertical: 16,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: Horizonte.textMuted,
  },
  cartao: {
    gap: 8,
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Horizonte.hairline,
    borderRadius: 20,
    backgroundColor: Horizonte.surface,
  },
  materia: { fontFamily: FontesHorizonte.corpoForte, fontSize: 13, lineHeight: 18, color: Horizonte.textMuted },
  nome: { fontFamily: FontesHorizonte.display, fontSize: 18, lineHeight: 24, color: Horizonte.text },
  barra: {
    flexDirection: 'row',
    height: 10,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: Horizonte.hairline,
  },
  parte: { backgroundColor: Horizonte.hairline },
  parteDominado: { backgroundColor: Horizonte.luma },
  parteTentando: { backgroundColor: Horizonte.action },
  contagem: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: Horizonte.textMuted },
  duvidas: { gap: 4, marginTop: 4 },
  duvidasTitulo: { fontFamily: FontesHorizonte.corpoForte, fontSize: 14, lineHeight: 20, color: Horizonte.text },
  duvida: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: Horizonte.text },
  erro: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: Horizonte.error },
  botao: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Horizonte.text,
    borderRadius: 22,
  },
  botaoTexto: { fontFamily: FontesHorizonte.displayMedio, fontSize: 14, lineHeight: 20, color: Horizonte.text },
});
