/**
 * Trilha do aluno (rota /trilha): as matérias da turma, com os tópicos em ordem e o status de
 * cada um. O status vem do servidor, então é o mesmo em qualquer aparelho com a mesma conta.
 */
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { EstrelaNoHorizonte, Surgir } from '@/components/horizonte/ceu';
import {
  AvisoCarregando,
  AvisoErro,
  CabecalhoVoltar,
  LinkTexto,
  TelaFormulario,
  TituloTela,
} from '@/components/horizonte/formulario';
import { LinhaDaTrilha } from '@/components/linha-da-trilha';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { useSessao } from '@/hooks/use-sessao';
import type { ResultadoApi } from '@/services/api';
import { listarMaterias } from '@/services/materias';
import type { ListaDeMaterias } from '@/types/api';

export default function TrilhaScreen() {
  const { sessao } = useSessao();
  const turmaId = sessao.estado === 'pronto' ? sessao.usuario.turma?.id : undefined;

  const buscar = useCallback(
    (): Promise<ResultadoApi<ListaDeMaterias>> =>
      turmaId ? listarMaterias(turmaId) : Promise.resolve({ ok: true, dados: { materias: [] } }),
    [turmaId],
  );
  const [dados, tentarDeNovo] = useDadosDaTela(buscar);
  const materias = dados.estado === 'pronto' ? dados.dados.materias : [];

  return (
    <TelaFormulario>
      <Surgir style={styles.camada}>
        <CabecalhoVoltar
          texto="Voltar para o início"
          aoVoltar={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
        />
      </Surgir>

      <TituloTela titulo="Sua trilha" subtitulo="Escolha um tópico para conversar com a Luma." style={styles.textos} />

      <View style={styles.estrela}>
        <EstrelaNoHorizonte tamanho={28} />
      </View>

      <Surgir style={styles.camada}>
        {dados.estado === 'carregando' && <AvisoCarregando texto="Carregando a trilha…" />}
        {dados.estado === 'erro' && (
          <>
            <AvisoErro mensagem={dados.erro} />
            <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={tentarDeNovo} />
          </>
        )}
        {dados.estado === 'pronto' && materias.length === 0 && (
          <Text style={styles.vazio}>Seu professor ainda não montou a trilha. Enquanto isso, converse com a Luma.</Text>
        )}
        {materias.map((materia) => (
          <View key={materia.id} style={styles.materia}>
            <Text style={styles.titulo} accessibilityRole="header">
              {materia.nome}
            </Text>
            {materia.topicos.length === 0 ? (
              <Text style={styles.vazio}>Nenhum tópico ainda.</Text>
            ) : (
              materia.topicos.map((topico) => (
                <LinhaDaTrilha
                  key={topico.id}
                  ordem={topico.ordem}
                  nome={topico.nome}
                  status={topico.status ?? 'nao_iniciado'}
                  aoTocar={() => router.push({ pathname: '/chat', params: { topico: topico.id, nome: topico.nome } })}
                />
              ))
            )}
          </View>
        ))}
      </Surgir>
    </TelaFormulario>
  );
}

const styles = StyleSheet.create({
  camada: { zIndex: 1 },
  textos: { marginTop: 10 },
  estrela: { marginTop: 41, marginBottom: 18 },
  materia: { marginBottom: 20 },
  titulo: {
    marginBottom: 4,
    fontFamily: FontesHorizonte.display,
    fontSize: 18,
    lineHeight: 24,
    color: Horizonte.text,
  },
  vazio: {
    paddingVertical: 16,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: Horizonte.textMuted,
  },
});
