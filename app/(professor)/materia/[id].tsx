/**
 * Matéria (rota /materia/[id]?turma=...): os tópicos em ordem e o campo para criar o próximo.
 * A matéria sai da lista da turma, que o servidor só entrega ao professor dono.
 */
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ESPACO_DA_BARRA } from '@/components/menu-do-sistema';
import { useTelaDeSistema } from '@/constants/auth-theme';

import { Surgir } from '@/components/horizonte/ceu';
import { CriarPorNome } from '@/components/horizonte/criar-por-nome';
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
import type { ResultadoApi } from '@/services/api';
import { criarTopico, excluirMateria, listarMaterias, renomearMateria } from '@/services/materias';
import { ItemDaTrilha, PainelDoTopico } from '@/components/topico-do-professor';
import { sair } from '@/services/auth';
import type { Materia, Topico } from '@/types/api';
import { type Cores, useEstilos } from '@/hooks/use-tema';

export default function MateriaScreen() {
  const pc = useTelaDeSistema();
  const styles = useEstilos(criarEstilos);
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
  const [escolhidoId, setEscolhidoId] = useState<string | null>(null);
  const topicos = materia ? [...materia.topicos, ...novos.filter((n) => !materia.topicos.some((t) => t.id === n.id))] : [];
  // Tópico excluído ou nenhum escolhido ainda: o painel mostra o primeiro da trilha.
  const escolhido = topicos.find((t) => t.id === escolhidoId) ?? topicos[0];

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
    // No celular, a barra de baixo do professor fica por cima do fim da tela.
    <TelaFormulario rodape={pc ? 36 : ESPACO_DA_BARRA} largura={pc ? 1040 : 480}>
      <Surgir style={styles.camada}>
        <CabecalhoVoltar
          texto="Voltar para a turma"
          aoVoltar={voltar}
        />
      </Surgir>

      <View style={styles.cabecalho}>
        <TituloTela
          titulo={materia?.nome ?? 'Matéria'}
          subtitulo="A trilha que o aluno segue, na ordem. Escolha um tópico para cuidar dele."
          style={styles.textos}
        />
        {materia && (
          <Pressable
            style={({ pressed }) => [styles.botaoMateria, pressed && styles.pressionado]}
            onPress={() => setRenomeando((r) => !r)}
            accessibilityRole="button"
            accessibilityLabel={renomeando ? 'Cancelar a troca de nome' : 'Renomear a matéria'}
          >
            <Text style={styles.botaoMateriaTexto}>{renomeando ? 'Cancelar' : 'Renomear matéria'}</Text>
          </Pressable>
        )}
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

            <View style={[styles.colunas, pc && styles.colunasPc]}>
              <View style={[styles.trilha, pc && styles.trilhaPc]}>
                <Text style={styles.titulo} accessibilityRole="header">
                  Trilha · {topicos.length} {topicos.length === 1 ? 'tópico' : 'tópicos'}
                </Text>
                {topicos.length === 0 ? (
                  <>
                    <Text style={styles.vazio}>Nenhum tópico ainda. Crie o primeiro abaixo.</Text>
                    {/* Só a matéria sem tópicos pode ser excluída (o servidor confere de novo). */}
                    <LinkTexto
                      texto={confirmarExclusao ? 'Toque de novo para excluir' : 'Excluir matéria'}
                      rotulo="Excluir a matéria"
                      aoTocar={excluir}
                    />
                    {!!erroExclusao && <AvisoErro mensagem={erroExclusao} />}
                  </>
                ) : (
                  <View>
                    {topicos.map((topico, i, todos) => (
                      <ItemDaTrilha
                        key={topico.id}
                        topico={topico}
                        escolhido={topico.id === escolhido?.id}
                        ultimo={i === todos.length - 1}
                        aoEscolher={() => setEscolhidoId(topico.id)}
                      >
                        {/* No celular não cabe painel ao lado: ele abre embaixo do tópico escolhido. */}
                        {!pc && topico.id === escolhido?.id && (
                          <PainelDoTopico key={topico.id} topico={topico} total={todos.length} aoMudar={tentarDeNovo} />
                        )}
                      </ItemDaTrilha>
                    ))}
                  </View>
                )}

                <CriarPorNome
                  rotulo="Novo tópico no fim da trilha"
                  placeholder="Ex.: Frações"
                  textoBotao="Criar tópico"
                  maxLength={80}
                  criar={criar}
                  aoCriar={(topico) => {
                    setNovos((atuais) => [...atuais, topico]);
                    setEscolhidoId(topico.id);
                  }}
                />
              </View>

              {pc && escolhido && (
                <View style={styles.painel}>
                  {/* key: trocar de tópico zera o "renomear" e a confirmação de exclusão do anterior. */}
                  <PainelDoTopico key={escolhido.id} topico={escolhido} total={topicos.length} aoMudar={tentarDeNovo} />
                </View>
              )}
            </View>
          </>
        )}
      </Surgir>
    </TelaFormulario>
  );
}

const criarEstilos = (cores: Cores) => StyleSheet.create({
  camada: { zIndex: 1 },
  pressionado: { opacity: 0.85 },
  cabecalho: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 10,
    marginBottom: 28,
  },
  textos: { flexGrow: 1, flexShrink: 1, flexBasis: 280 },
  botaoMateria: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: cores.fieldBorder,
    borderRadius: 22,
    backgroundColor: cores.surface,
  },
  botaoMateriaTexto: { fontFamily: FontesHorizonte.displayMedio, fontSize: 14, lineHeight: 20, color: cores.text },
  colunas: { gap: 24, marginTop: 8 },
  colunasPc: { flexDirection: 'row', alignItems: 'flex-start' },
  trilha: { gap: 12 },
  trilhaPc: { width: 380 },
  painel: { flex: 1, minWidth: 0 },

  titulo: {
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
