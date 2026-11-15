/**
 * Painel da turma (rota /painel/[id]): onde a turma trava. Por tópico, quantos alunos dominaram,
 * estão tentando ou não começaram, e as dúvidas mais comuns resumidas pela IA. O professor nunca
 * vê a conversa do aluno, só o resumo.
 */
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { CartaoDoTopico } from '@/components/cartao-do-topico';
import { EstrelaNoHorizonte, Surgir } from '@/components/horizonte/ceu';
import {
  AvisoCarregando,
  AvisoErro,
  CabecalhoVoltar,
  LinkTexto,
  TelaFormulario,
  TituloTela,
} from '@/components/horizonte/formulario';
import { FontesHorizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { buscarPainel } from '@/services/painel';
import { type Cores, useEstilos } from '@/hooks/use-tema';

export default function PainelScreen() {
  const styles = useEstilos(criarEstilos);
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

const criarEstilos = (cores: Cores) => StyleSheet.create({
  camada: { zIndex: 1 },
  textos: { marginTop: 10 },
  estrela: { marginTop: 41, marginBottom: 18 },
  vazio: {
    paddingVertical: 16,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: cores.textMuted,
  },
});
