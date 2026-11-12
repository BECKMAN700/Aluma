/**
 * Matéria (rota /materia/[id]?turma=...): os tópicos em ordem e o campo para criar o próximo.
 * A matéria sai da lista da turma, que o servidor só entrega ao professor dono.
 */
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { EstrelaNoHorizonte, Surgir } from '@/components/horizonte/ceu';
import { CriarPorNome } from '@/components/horizonte/criar-por-nome';
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
import type { ResultadoApi } from '@/services/api';
import { criarTopico, listarMaterias } from '@/services/materias';
import type { Materia, Topico } from '@/types/api';

export default function MateriaScreen() {
  const { id, turma } = useLocalSearchParams<{ id: string; turma?: string }>();

  const buscar = useCallback(async (): Promise<ResultadoApi<Materia | null>> => {
    if (!turma) return { ok: true, dados: null };
    const r = await listarMaterias(turma);
    if (!r.ok) return r;
    return { ok: true, dados: r.dados.materias.find((m) => m.id === id) ?? null };
  }, [id, turma]);
  const [dados, tentarDeNovo] = useDadosDaTela(buscar);
  const criar = useCallback((nome: string) => criarTopico(id, nome), [id]);
  const materia = dados.estado === 'pronto' ? dados.dados : null;
  // O tópico criado entra no fim da lista na hora, sem recarregar e sem tirar o foco do campo.
  const [novos, setNovos] = useState<Topico[]>([]);
  const topicos = materia ? [...materia.topicos, ...novos.filter((n) => !materia.topicos.some((t) => t.id === n.id))] : [];

  return (
    <TelaFormulario>
      <Surgir style={styles.camada}>
        <CabecalhoVoltar
          texto="Voltar para a turma"
          aoVoltar={() =>
            router.canGoBack()
              ? router.back()
              : turma
                ? router.replace({ pathname: '/turma/[id]', params: { id: turma } })
                : router.replace('/turmas')
          }
        />
      </Surgir>

      <TituloTela titulo={materia?.nome ?? 'Matéria'} subtitulo="Tópicos na ordem da trilha do aluno" style={styles.textos} />

      <View style={styles.estrela}>
        <EstrelaNoHorizonte tamanho={28} />
      </View>

      <Surgir style={styles.camada}>
        {dados.estado === 'carregando' && <AvisoCarregando texto="Carregando a matéria…" />}
        {dados.estado === 'erro' && (
          <>
            <AvisoErro mensagem={dados.erro} />
            <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={tentarDeNovo} />
          </>
        )}
        {dados.estado === 'pronto' && !materia && <Text style={styles.vazio}>Matéria não encontrada.</Text>}
        {materia && (
          <>
            <Text style={styles.titulo} accessibilityRole="header">
              Tópicos ({topicos.length})
            </Text>
            {topicos.length === 0 ? (
              <Text style={styles.vazio}>Nenhum tópico ainda. Crie o primeiro abaixo.</Text>
            ) : (
              topicos.map((topico, i, todos) => (
                <View key={topico.id} style={[styles.topico, i < todos.length - 1 && styles.topicoComLinha]}>
                  <Text style={styles.topicoOrdem}>{topico.ordem}</Text>
                  <Text style={styles.topicoNome}>{topico.nome}</Text>
                </View>
              ))
            )}

            <CriarPorNome
              rotulo="Novo tópico"
              placeholder="Ex.: Frações"
              textoBotao="Criar tópico"
              maxLength={80}
              criar={criar}
              aoCriar={(topico) => setNovos((atuais) => [...atuais, topico])}
            />
          </>
        )}
      </Surgir>
    </TelaFormulario>
  );
}

const styles = StyleSheet.create({
  camada: { zIndex: 1 },
  textos: { marginTop: 10 },
  estrela: { marginTop: 41, marginBottom: 18 },

  titulo: {
    marginBottom: 4,
    fontFamily: FontesHorizonte.display,
    fontSize: 18,
    lineHeight: 24,
    color: Horizonte.text,
  },
  topico: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  topicoComLinha: { borderBottomWidth: 1, borderBottomColor: Horizonte.hairline },
  topicoOrdem: { width: 24, fontFamily: FontesHorizonte.display, fontSize: 16, lineHeight: 22, color: Horizonte.action },
  topicoNome: { flex: 1, minWidth: 0, fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, color: Horizonte.text },
  vazio: {
    paddingVertical: 16,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: Horizonte.textMuted,
  },
});
