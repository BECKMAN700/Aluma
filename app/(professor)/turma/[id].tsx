/**
 * Tela da turma (rota /turma/[id]): o código para passar aos alunos e quem já entrou.
 * Mostra só o nome de cada aluno; a conversa dele nunca chega ao professor.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';

import { useEstilosAuth } from '@/components/auth/styles-auth';
import { AvisoCarregando, AvisoErro, TelaProfessor } from '@/components/professor/tela-professor';
import { Auth } from '@/constants/auth-theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import type { ResultadoApi } from '@/services/api';
import { alunosDaTurma, listarTurmas } from '@/services/turmas';
import type { AlunoDaTurma, Turma } from '@/types/api';

type TurmaComAlunos = { turma: Turma; alunos: AlunoDaTurma[] } | null;

export default function TurmaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // A turma sai da lista do próprio professor: turma de outro não é achada e nem pede os alunos.
  const buscar = useCallback(async (): Promise<ResultadoApi<TurmaComAlunos>> => {
    const turmas = await listarTurmas();
    if (!turmas.ok) return turmas;
    const turma = turmas.dados.turmas.find((t) => t.id === id);
    if (!turma) return { ok: true, dados: null };
    const alunos = await alunosDaTurma(turma.id);
    if (!alunos.ok) return alunos;
    return { ok: true, dados: { turma, alunos: alunos.dados.alunos } };
  }, [id]);
  const [dados, tentarDeNovo] = useDadosDaTela(buscar);

  return (
    <TelaProfessor>
      {dados.estado === 'carregando' && <AvisoCarregando texto="Carregando a turma…" />}
      {dados.estado === 'erro' && <AvisoErro erro={dados.erro} tentarDeNovo={tentarDeNovo} />}
      {dados.estado === 'pronto' && !dados.dados && (
        <Text style={styles.vazio}>Turma não encontrada.</Text>
      )}
      {dados.estado === 'pronto' && dados.dados && (
        <>
          <View style={styles.cabecalho}>
            <Text style={styles.nome} accessibilityRole="header">
              {dados.dados.turma.nome}
            </Text>
            <Text style={styles.serie}>{dados.dados.turma.serie}</Text>
          </View>

          <CodigoDaTurma codigo={dados.dados.turma.codigo} />

          <Text style={styles.titulo} accessibilityRole="header">
            Alunos ({dados.dados.alunos.length})
          </Text>
          {dados.dados.alunos.length === 0 ? (
            <Text style={styles.vazio}>Nenhum aluno entrou ainda. Passe o código acima para a turma.</Text>
          ) : (
            dados.dados.alunos.map((aluno) => (
              <Text key={aluno.id} style={styles.aluno}>
                {aluno.nome}
              </Text>
            ))
          )}
        </>
      )}
    </TelaProfessor>
  );
}

function CodigoDaTurma({ codigo }: { codigo: string }) {
  const s = useEstilosAuth();
  const [aviso, setAviso] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copiar = async () => {
    const copiou = await Clipboard.setStringAsync(codigo).catch(() => false);
    setAviso(copiou ? 'Copiado!' : 'Não deu para copiar. Anote o código acima.');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 3000);
  };

  return (
    <View style={styles.codigoCaixa}>
      <Text style={styles.codigoRotulo}>Código da turma</Text>
      <Text style={styles.codigo} selectable accessibilityLabel={`Código da turma: ${codigo.split('').join(' ')}`}>
        {codigo}
      </Text>
      <Pressable style={s.botao} onPress={copiar} accessibilityRole="button" accessibilityLabel="Copiar o código da turma">
        <Text style={s.botaoTexto}>Copiar</Text>
      </Pressable>
      {aviso && (
        <Text style={styles.codigoAviso} accessibilityLiveRegion="polite">
          {aviso}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: { gap: 2 },
  nome: { fontSize: 22, fontWeight: '700', color: Auth.texto },
  serie: { fontSize: 15, color: Auth.textoSuave },
  codigoCaixa: {
    gap: 10,
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Auth.borda,
    backgroundColor: Auth.cartao,
  },
  codigoRotulo: { fontSize: 14, fontWeight: '600', color: Auth.textoSuave },
  codigo: { fontSize: 32, fontWeight: '800', letterSpacing: 4, color: Auth.texto, fontFamily: 'monospace' },
  codigoAviso: { fontSize: 14, fontWeight: '600', color: Auth.texto },
  titulo: { fontSize: 18, fontWeight: '700', color: Auth.texto },
  aluno: {
    fontSize: 15,
    color: Auth.texto,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Auth.borda,
  },
  vazio: { fontSize: 15, lineHeight: 22, textAlign: 'center', color: Auth.textoSuave, paddingVertical: 16 },
});
