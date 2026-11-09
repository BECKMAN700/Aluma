/**
 * Tela da turma (rota /turma/[id]): o código para passar aos alunos e quem já entrou.
 * Mostra só o nome de cada aluno; a conversa dele nunca chega ao professor.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { EstrelaNoHorizonte, Surgir } from '@/components/horizonte/ceu';
import {
  AvisoCarregando,
  AvisoErro,
  BotaoPrincipal,
  LinkTexto,
  TelaFormulario,
} from '@/components/horizonte/formulario';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import type { ResultadoApi } from '@/services/api';
import { alunosDaTurma, listarTurmas } from '@/services/turmas';
import type { AlunoDaTurma, Turma } from '@/types/api';

type TurmaComAlunos = { turma: Turma; alunos: AlunoDaTurma[] } | null;

// Na web, a folha de compartilhamento só existe em alguns navegadores.
const PODE_COMPARTILHAR = Platform.OS !== 'web' || (typeof navigator !== 'undefined' && !!navigator.share);

export default function TurmaScreen() {
  const router = useRouter();
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
  const turma = dados.estado === 'pronto' ? dados.dados?.turma : undefined;

  return (
    <TelaFormulario topo={10}>
      <Surgir style={[styles.cabecalho, styles.camada]}>
        <Pressable
          style={({ pressed }) => [styles.voltar, pressed && styles.pressionado]}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/turmas'))}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 5l-7 7 7 7"
              stroke={Horizonte.text}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
        <View style={styles.cabecalhoTexto}>
          <Text style={styles.nome} accessibilityRole="header">
            {turma?.nome ?? 'Turma'}
          </Text>
          {!!turma && <Text style={styles.serie}>{turma.serie}</Text>}
        </View>
      </Surgir>

      {/* Altura reservada: o horizonte fica no mesmo lugar enquanto a turma carrega. */}
      <Surgir style={[styles.codigoCaixa, styles.camada]}>
        {!!turma && (
          <>
            <Text style={styles.codigoRotulo}>Código da turma</Text>
            <Text
              style={styles.codigo}
              selectable
              accessibilityLabel={`Código da turma: ${turma.codigo.split('').join(' ')}`}
            >
              {turma.codigo}
            </Text>
          </>
        )}
      </Surgir>

      <View style={styles.estrela}>
        <EstrelaNoHorizonte tamanho={28} />
      </View>

      <Surgir style={styles.camada}>
        {dados.estado === 'carregando' && <AvisoCarregando texto="Carregando a turma…" />}
        {dados.estado === 'erro' && (
          <>
            <AvisoErro mensagem={dados.erro} />
            <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={tentarDeNovo} />
          </>
        )}
        {dados.estado === 'pronto' && !dados.dados && <Text style={styles.vazio}>Turma não encontrada.</Text>}
        {dados.estado === 'pronto' && dados.dados && (
          <>
            <AcoesDoCodigo nomeDaTurma={dados.dados.turma.nome} codigo={dados.dados.turma.codigo} />

            <Text style={styles.titulo} accessibilityRole="header">
              Alunos ({dados.dados.alunos.length})
            </Text>
            {dados.dados.alunos.length === 0 ? (
              <Text style={styles.vazio}>Nenhum aluno entrou ainda. Passe o código acima para a turma.</Text>
            ) : (
              dados.dados.alunos.map((aluno, i, todos) => (
                <View key={aluno.id} style={[styles.aluno, i < todos.length - 1 && styles.alunoComLinha]}>
                  <Text style={styles.alunoNome}>{aluno.nome}</Text>
                </View>
              ))
            )}
          </>
        )}
      </Surgir>
    </TelaFormulario>
  );
}

function AcoesDoCodigo({ nomeDaTurma, codigo }: { nomeDaTurma: string; codigo: string }) {
  const [aviso, setAviso] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const avisar = (texto: string) => {
    setAviso(texto);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 3000);
  };

  const copiar = async () => {
    const copiou = await Clipboard.setStringAsync(codigo).catch(() => false);
    avisar(copiou ? 'Copiado!' : 'Não deu para copiar. Anote o código acima.');
  };

  const compartilhar = async () => {
    try {
      await Share.share({ message: `Entre na turma ${nomeDaTurma} no Aluma com o código ${codigo}.` });
    } catch (e) {
      // Na web, desistir de compartilhar também cai aqui, e isso não é erro.
      if ((e as Error).name !== 'AbortError') avisar('Não deu para compartilhar. Use o botão Copiar.');
    }
  };

  return (
    <>
      <View style={styles.acoes}>
        <View style={styles.acao}>
          <BotaoPrincipal texto="Copiar" rotulo="Copiar o código da turma" compacto aoTocar={copiar} />
        </View>
        {PODE_COMPARTILHAR && (
          <Pressable
            style={({ pressed }) => [styles.acao, styles.botaoSecundario, pressed && styles.pressionado]}
            onPress={compartilhar}
            accessibilityRole="button"
            accessibilityLabel="Compartilhar o código da turma"
          >
            <Text style={styles.botaoSecundarioTexto}>Compartilhar</Text>
          </Pressable>
        )}
      </View>
      {!!aviso && (
        <Text style={styles.codigoAviso} accessibilityLiveRegion="polite">
          {aviso}
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  camada: { zIndex: 1 },
  pressionado: { opacity: 0.85 },

  // Margem negativa: a seta fica mais perto da borda que o resto da coluna, como no desenho.
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: -14, minHeight: 48 },
  voltar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  cabecalhoTexto: { flex: 1, minWidth: 0 },
  nome: { fontFamily: FontesHorizonte.display, fontSize: 22, lineHeight: 28, color: Horizonte.text },
  serie: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: Horizonte.textMuted },

  codigoCaixa: { marginTop: 38, minHeight: 76, alignItems: 'center', gap: 6 },
  codigoRotulo: { fontFamily: FontesHorizonte.corpoForte, fontSize: 14, lineHeight: 20, color: Horizonte.textMuted },
  codigo: {
    fontFamily: FontesHorizonte.display,
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: 3,
    color: Horizonte.action,
  },

  estrela: { marginTop: 54, marginBottom: 18 },

  acoes: { flexDirection: 'row', gap: 8 },
  acao: { flex: 1, minWidth: 0 },
  botaoSecundario: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: Horizonte.text,
    borderRadius: 26,
    backgroundColor: Horizonte.surface,
  },
  botaoSecundarioTexto: { fontFamily: FontesHorizonte.displayMedio, fontSize: 14, lineHeight: 20, color: Horizonte.text },
  codigoAviso: {
    marginTop: 8,
    fontFamily: FontesHorizonte.corpoForte,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: Horizonte.text,
  },

  titulo: {
    marginTop: 24,
    marginBottom: 4,
    fontFamily: FontesHorizonte.display,
    fontSize: 18,
    lineHeight: 24,
    color: Horizonte.text,
  },
  aluno: { minHeight: 48, justifyContent: 'center' },
  alunoComLinha: { borderBottomWidth: 1, borderBottomColor: Horizonte.hairline },
  alunoNome: { fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, color: Horizonte.text },
  vazio: {
    paddingVertical: 16,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: Horizonte.textMuted,
  },
});
