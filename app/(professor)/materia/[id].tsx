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
import { criarTopico, excluirMateria, listarMaterias, renomearMateria } from '@/services/materias';
import { TopicoDoProfessor } from '@/components/topico-do-professor';
import { sair } from '@/services/auth';
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
  const [renomeando, setRenomeando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);
  const topicos = materia ? [...materia.topicos, ...novos.filter((n) => !materia.topicos.some((t) => t.id === n.id))] : [];

  const voltar = () =>
    router.canGoBack()
      ? router.back()
      : turma
        ? router.replace({ pathname: '/turma/[id]', params: { id: turma } })
        : router.replace('/turmas');

  // Só a matéria sem tópicos pode ser excluída (o servidor confere de novo). Dois toques confirmam.
  const excluir = async () => {
    if (!confirmarExclusao) {
      setConfirmarExclusao(true);
      return;
    }
    const r = await excluirMateria(id);
    if (r.ok) voltar();
    else if (r.status === 401) await sair();
    else {
      setErroExclusao(r.erro);
      setConfirmarExclusao(false);
    }
  };

  return (
    <TelaFormulario>
      <Surgir style={styles.camada}>
        <CabecalhoVoltar
          texto="Voltar para a turma"
          aoVoltar={voltar}
        />
      </Surgir>

      <TituloTela titulo={materia?.nome ?? 'Matéria'} subtitulo="Tópicos na ordem da trilha do aluno. O tutor usa o PDF de cada um." style={styles.textos} />

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
            <View style={styles.acoesMateria}>
              <LinkTexto
                texto={renomeando ? 'Cancelar' : 'Renomear matéria'}
                rotulo={renomeando ? 'Cancelar a troca de nome' : 'Renomear a matéria'}
                aoTocar={() => setRenomeando((r) => !r)}
              />
              {topicos.length === 0 && (
                <LinkTexto
                  texto={confirmarExclusao ? 'Toque de novo para excluir' : 'Excluir matéria'}
                  rotulo="Excluir a matéria"
                  aoTocar={excluir}
                />
              )}
            </View>
            {!!erroExclusao && <AvisoErro mensagem={erroExclusao} />}
            {renomeando && (
              <CriarPorNome
                rotulo="Novo nome da matéria"
                placeholder={materia.nome}
                textoBotao="Salvar nome"
                maxLength={60}
                criar={(nome) => renomearMateria(id, nome)}
                aoCriar={() => {
                  setRenomeando(false);
                  tentarDeNovo();
                }}
              />
            )}
            <Text style={styles.titulo} accessibilityRole="header">
              Tópicos ({topicos.length})
            </Text>
            {topicos.length === 0 ? (
              <Text style={styles.vazio}>Nenhum tópico ainda. Crie o primeiro abaixo.</Text>
            ) : (
              topicos.map((topico, i, todos) => (
                <TopicoDoProfessor
                  key={topico.id}
                  topico={topico}
                  primeiro={i === 0}
                  ultimo={i === todos.length - 1}
                  comLinha={i < todos.length - 1}
                  aoMudar={tentarDeNovo}
                />
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
  acoesMateria: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 8 },

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
