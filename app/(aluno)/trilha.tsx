/**
 * Trilha do aluno (rota /trilha), aprovada em 15/11: as matérias da turma, com os tópicos em ordem e o status de
 * cada um. O status vem do servidor, então é o mesmo em qualquer aparelho com a mesma conta.
 */
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { CascaDoAluno } from '@/components/casca-do-aluno';
import { AvisoCarregando, AvisoErro, LinkTexto } from '@/components/horizonte/formulario';
import { Pilula } from '@/components/sistema';
import { LinhaDaTrilha } from '@/components/linha-da-trilha';
import { FontesHorizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { useSessao } from '@/hooks/use-sessao';
import type { ResultadoApi } from '@/services/api';
import { listarMaterias } from '@/services/materias';
import type { ListaDeMaterias } from '@/types/api';
import { type Cores, useEstilos } from '@/hooks/use-tema';

export default function TrilhaScreen() {
  const styles = useEstilos(criarEstilos);
  const { sessao } = useSessao();
  const turmaId = sessao.estado === 'pronto' ? sessao.usuario.turma?.id : undefined;
  const turma = sessao.estado === 'pronto' ? sessao.usuario.turma?.nome : undefined;

  const buscar = useCallback(
    (): Promise<ResultadoApi<ListaDeMaterias>> =>
      turmaId ? listarMaterias(turmaId) : Promise.resolve({ ok: true, dados: { materias: [] } }),
    [turmaId],
  );
  const [dados, tentarDeNovo] = useDadosDaTela(buscar);
  const materias = dados.estado === 'pronto' ? dados.dados.materias : [];

  // O último tópico em andamento: o mesmo atalho do início, no topo da trilha.
  const continuar = materias
    .flatMap((m) => m.topicos)
    .filter((t) => t.status === 'em_andamento' && t.atividade_em)
    .sort((a, b) => (b.atividade_em ?? '').localeCompare(a.atividade_em ?? ''))[0];
  const abrir = (id: string, nome: string) => router.push({ pathname: '/chat', params: { topico: id, nome } });

  return (
    <CascaDoAluno titulo="Minha trilha">
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View>
          {!!turma && <Text style={styles.turma}>{turma}</Text>}
          <Text style={styles.cabecalho} accessibilityRole="header">Minha trilha</Text>
        </View>
        {!!continuar && (
          <View style={styles.continuar}>
            <View style={styles.continuarTexto}>
              <Text style={styles.turma}>Continue de onde parou</Text>
              <Text style={styles.titulo}>{continuar.nome}</Text>
            </View>
            <Pilula texto="Continuar" destaque aoTocar={() => abrir(continuar.id, continuar.nome)} />
          </View>
        )}
        {dados.estado === 'carregando' && <AvisoCarregando texto="Carregando a trilha…" />}
        {dados.estado === 'erro' && (
          <>
            <AvisoErro mensagem={dados.erro} />
            <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={tentarDeNovo} />
          </>
        )}
        {dados.estado === 'pronto' && materias.length === 0 && (
          <Text style={styles.vazio}>Seu professor ainda não montou a trilha. Enquanto isso, converse pelo início.</Text>
        )}
        {materias.map((materia) => (
          <View key={materia.id} style={styles.materia}>
            <Text style={styles.titulo} accessibilityRole="header">
              {materia.nome}
            </Text>
            {materia.topicos.length === 0 ? (
              <Text style={styles.vazio}>O professor ainda não montou os tópicos.</Text>
            ) : (
              materia.topicos.map((topico) => (
                <LinhaDaTrilha
                  key={topico.id}
                  ordem={topico.ordem}
                  nome={topico.nome}
                  status={topico.status ?? 'nao_iniciado'}
                  aoTocar={() => abrir(topico.id, topico.nome)}
                />
              ))
            )}
          </View>
        ))}
      </ScrollView>
    </CascaDoAluno>
  );
}

const criarEstilos = (cores: Cores) => StyleSheet.create({
  conteudo: { width: '100%', maxWidth: 820, alignSelf: 'center', gap: 16, padding: 24 },
  cabecalho: { fontFamily: FontesHorizonte.display, fontSize: 28, lineHeight: 34, color: cores.text },
  turma: { fontFamily: FontesHorizonte.corpo, fontSize: 14, color: cores.textMuted },
  continuar: {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 16,
    borderRadius: 16, borderWidth: 1, borderColor: cores.action, backgroundColor: cores.surface,
  },
  continuarTexto: { flexShrink: 1, gap: 2 },
  materia: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: cores.hairline, backgroundColor: cores.surface },
  titulo: {
    marginBottom: 4,
    fontFamily: FontesHorizonte.display,
    fontSize: 18,
    lineHeight: 24,
    color: cores.text,
  },
  vazio: {
    paddingVertical: 16,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: cores.textMuted,
  },
});
