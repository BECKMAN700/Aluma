/**
 * Visão geral da turma no PC (a tela da turma com menu lateral): números da turma, onde ela
 * trava, matérias e alunos lado a lado. Só números e o resumo da IA: nenhuma conversa de aluno.
 */
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CartaoDoTopico } from '@/components/cartao-do-topico';
import { AvisoCarregando, AvisoErro, LinkTexto } from '@/components/horizonte/formulario';
import { MateriasDaTurma } from '@/components/materias-da-turma';
import { FontesHorizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { buscarPainel } from '@/services/painel';
import type { AlunoDaTurma, TopicoNoPainel, Turma } from '@/types/api';
import { type Cores, useCores, useEstilos } from '@/hooks/use-tema';

/** Números do topo, tirados do painel. */
export function numerosDaTurma(topicos: TopicoNoPainel[], alunos: number) {
  const dominados = topicos.reduce((soma, t) => soma + t.dominado, 0);
  const possiveis = topicos.length * alunos;
  return {
    topicos: topicos.length,
    // Dos pares (aluno, tópico) possíveis, quantos já foram dominados.
    dominadoPorcento: possiveis ? Math.round((dominados / possiveis) * 100) : 0,
    tentando: topicos.reduce((soma, t) => soma + t.em_andamento, 0),
  };
}

export function VisaoGeralDaTurma({
  turma,
  alunos,
  acoesDoCodigo,
}: {
  turma: Turma;
  alunos: AlunoDaTurma[];
  /** Botões de copiar/compartilhar o código, os mesmos da tela do celular. */
  acoesDoCodigo: React.ReactNode;
}) {
  const cores = useCores();
  const styles = useEstilos(criarEstilos);
  const buscar = useCallback(() => buscarPainel(turma.id), [turma.id]);
  const [painel, tentarDeNovo] = useDadosDaTela(buscar);

  // Quem trava primeiro: mais alunos tentando sem dominar. Empate: a ordem da trilha.
  const topicos =
    painel.estado === 'pronto'
      ? [...painel.dados.topicos].sort((a, b) => b.em_andamento - a.em_andamento || a.ordem - b.ordem)
      : [];
  const numeros = numerosDaTurma(topicos, alunos.length);
  const pronto = painel.estado === 'pronto';

  return (
    <View style={styles.tela}>
      <View style={styles.cabecalho}>
        <View style={styles.cabecalhoTexto}>
          <Text style={styles.nome} accessibilityRole="header">
            {turma.nome}
          </Text>
          <Text style={styles.detalhe}>
            {turma.serie} · {alunos.length === 1 ? '1 aluno' : `${alunos.length} alunos`}
          </Text>
        </View>
        <View style={styles.codigoCaixa}>
          <Text style={styles.codigoRotulo}>Código da turma</Text>
          <Text
            style={styles.codigo}
            selectable
            accessibilityLabel={`Código da turma: ${turma.codigo.split('').join(' ')}`}
          >
            {turma.codigo}
          </Text>
          {acoesDoCodigo}
        </View>
      </View>

      {/* Traço enquanto o painel carrega: um zero falso pareceria turma parada. */}
      <View style={styles.numeros}>
        <Numero rotulo="Alunos na turma" valor={String(alunos.length)} />
        <Numero rotulo="Tópicos dominados" valor={pronto ? `${numeros.dominadoPorcento}%` : '–'} cor={cores.luma} />
        <Numero rotulo="Alunos tentando agora" valor={pronto ? String(numeros.tentando) : '–'} cor={cores.action} />
        <Numero rotulo="Tópicos na trilha" valor={pronto ? String(numeros.topicos) : '–'} />
      </View>

      <View style={styles.colunas}>
        <View style={styles.colunaLarga}>
          <Text style={styles.titulo} accessibilityRole="header">
            Onde a turma trava
          </Text>
          {painel.estado === 'carregando' && <AvisoCarregando texto="Carregando o painel…" />}
          {painel.estado === 'erro' && (
            <>
              <AvisoErro mensagem={painel.erro} />
              <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={tentarDeNovo} />
            </>
          )}
          {pronto && topicos.length === 0 && (
            <Text style={styles.vazio}>Crie uma matéria e os tópicos dela para acompanhar a turma aqui.</Text>
          )}
          {topicos.map((topico) => (
            <CartaoDoTopico key={topico.id} topico={topico} />
          ))}
        </View>

        <View style={styles.colunaEstreita}>
          <View style={styles.bloco}>
            <MateriasDaTurma turmaId={turma.id} />
          </View>
          <View style={styles.bloco}>
            <Text style={styles.titulo} accessibilityRole="header">
              Alunos ({alunos.length})
            </Text>
            {alunos.length === 0 ? (
              <Text style={styles.vazio}>Nenhum aluno entrou ainda. Passe o código da turma.</Text>
            ) : (
              alunos.map((aluno, i) => (
                <View key={aluno.id} style={[styles.aluno, i < alunos.length - 1 && styles.alunoComLinha]}>
                  <Text style={styles.alunoNome}>{aluno.nome}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

function Numero({ rotulo, valor, cor }: { rotulo: string; valor: string; cor?: string }) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();
  cor ??= cores.text;
  return (
    <View style={styles.numero} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <Text style={styles.numeroRotulo}>{rotulo}</Text>
      <Text style={[styles.numeroValor, { color: cor }]}>{valor}</Text>
    </View>
  );
}

const criarEstilos = (cores: Cores) => StyleSheet.create({
  tela: { gap: 24, zIndex: 1 },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 },
  cabecalhoTexto: { flex: 1, minWidth: 0, paddingTop: 8 },
  nome: { fontFamily: FontesHorizonte.display, fontSize: 28, lineHeight: 34, color: cores.text },
  detalhe: { fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, color: cores.textMuted },
  codigoCaixa: {
    width: 300,
    gap: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: cores.hairline,
    borderRadius: 20,
    backgroundColor: cores.surface,
  },
  codigoRotulo: { fontFamily: FontesHorizonte.corpoForte, fontSize: 13, lineHeight: 18, color: cores.textMuted },
  codigo: { fontFamily: FontesHorizonte.display, fontSize: 30, lineHeight: 36, letterSpacing: 3, color: cores.action },

  numeros: { flexDirection: 'row', gap: 12 },
  numero: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: cores.hairline,
    borderRadius: 16,
    backgroundColor: cores.surface,
  },
  numeroRotulo: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: cores.textMuted },
  numeroValor: { fontFamily: FontesHorizonte.display, fontSize: 30, lineHeight: 36 },

  colunas: { flexDirection: 'row', alignItems: 'flex-start', gap: 24 },
  colunaLarga: { flex: 3, minWidth: 0 },
  colunaEstreita: { flex: 2, minWidth: 0, gap: 16 },
  bloco: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: cores.hairline,
    borderRadius: 20,
    backgroundColor: cores.surface,
  },
  titulo: {
    marginTop: 16,
    marginBottom: 10,
    fontFamily: FontesHorizonte.display,
    fontSize: 18,
    lineHeight: 24,
    color: cores.text,
  },
  aluno: { minHeight: 44, justifyContent: 'center' },
  alunoComLinha: { borderBottomWidth: 1, borderBottomColor: cores.hairline },
  alunoNome: { fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, color: cores.text },
  vazio: { paddingVertical: 12, fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, color: cores.textMuted },
});
