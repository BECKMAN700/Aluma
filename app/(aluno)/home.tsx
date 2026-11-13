/**
 * Início do aluno: daqui ele abre o chat, direto ou por um dos atalhos "Por onde começar?".
 */
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { EstrelaNoHorizonte, Surgir } from '@/components/horizonte/ceu';
import {
  BotaoPartida,
  BotaoPrincipal,
  CabecalhoSair,
  TelaFormulario,
  TituloTela,
} from '@/components/horizonte/formulario';
import { PARTIDAS, type Partida } from '@/constants/partidas';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { useSessao } from '@/hooks/use-sessao';
import type { ResultadoApi } from '@/services/api';
import { listarMaterias } from '@/services/materias';
import type { ListaDeMaterias, Topico } from '@/types/api';
import { sair } from '@/services/auth';

const PILARES = [
  { titulo: 'Método Socrático', apoio: 'Aprenda por questionamento' },
  { titulo: 'Sem Respostas Prontas', apoio: 'Foco no aprendizado independente' },
  { titulo: 'Pensamento Crítico', apoio: 'Desenvolva a lógica pura' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { sessao } = useSessao();
  const usuario = sessao.estado === 'pronto' ? sessao.usuario : null;
  const turmaId = usuario?.turma?.id;

  // O tópico em andamento em que o aluno mexeu por último: um toque e ele volta a estudar.
  const buscar = useCallback(
    (): Promise<ResultadoApi<ListaDeMaterias>> =>
      turmaId ? listarMaterias(turmaId) : Promise.resolve({ ok: true, dados: { materias: [] } }),
    [turmaId],
  );
  const [materias] = useDadosDaTela(buscar);
  const continuar = materias.estado === 'pronto' ? ultimoEmAndamento(materias.dados) : undefined;

  return (
    <TelaFormulario>
      <Surgir style={styles.camada}>
        <CabecalhoSair legenda={usuario?.turma?.nome} aoSair={sair} />
      </Surgir>

      <TituloTela
        titulo={usuario?.nome ? `Olá, ${usuario.nome}!` : 'Olá!'}
        subtitulo="Qual dúvida você quer pensar comigo hoje?"
        falaDaLuma
        style={styles.textos}
      />

      <View style={styles.estrela}>
        <EstrelaNoHorizonte tamanho={40} />
      </View>

      <Surgir style={styles.camada}>
        <BotaoPrincipal texto="Conversar com o tutor" alto aoTocar={() => router.push('/chat')} />
        <View style={styles.trilha}>
          {!!continuar && (
            <BotaoPartida
              texto={`Continuar: ${continuar.nome}`}
              aoTocar={() => router.push({ pathname: '/chat', params: { topico: continuar.id, nome: continuar.nome } })}
            />
          )}
          <BotaoPartida texto="Ver a trilha da matéria" aoTocar={() => router.push('/trilha')} />
        </View>

        <Text style={styles.chamada} accessibilityRole="header">
          Por onde começar?
        </Text>
        <View style={styles.partidas}>
          {(Object.keys(PARTIDAS) as Partida[]).map((id) => (
            <BotaoPartida
              key={id}
              texto={PARTIDAS[id]}
              aoTocar={() => router.push({ pathname: '/chat', params: { partida: id } })}
            />
          ))}
        </View>

        <Text style={styles.secao} accessibilityRole="header">
          Aluma IA
        </Text>
        <Text style={styles.descricao}>
          O orientador com inteligência artificial que guia seu aprendizado por meio de perguntas. Você constrói o
          raciocínio e chega às suas próprias conclusões.
        </Text>

        <View style={styles.pilares}>
          {PILARES.map((pilar) => (
            <View key={pilar.titulo} style={styles.pilar}>
              <Text style={styles.pilarTitulo}>{pilar.titulo}</Text>
              <Text style={styles.descricaoCurta}>{pilar.apoio}</Text>
            </View>
          ))}
        </View>
      </Surgir>
    </TelaFormulario>
  );
}

const styles = StyleSheet.create({
  trilha: { marginTop: 12, gap: 10 },
  camada: { zIndex: 1 },
  textos: { marginTop: 6, gap: 4 },
  estrela: { marginTop: 40, marginBottom: 28 },

  chamada: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: FontesHorizonte.displayMedio,
    fontSize: 16,
    lineHeight: 22,
    color: Horizonte.text,
  },
  partidas: { gap: 8 },

  secao: {
    marginTop: 36,
    marginBottom: 8,
    fontFamily: FontesHorizonte.display,
    fontSize: 20,
    lineHeight: 26,
    color: Horizonte.text,
  },
  descricao: { fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, color: Horizonte.textMuted },

  pilares: { marginTop: 12 },
  pilar: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: Horizonte.hairline },
  pilarTitulo: { fontFamily: FontesHorizonte.corpoForte, fontSize: 15, lineHeight: 20, color: Horizonte.text },
  descricaoCurta: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: Horizonte.textMuted },
});

function ultimoEmAndamento(dados: ListaDeMaterias): Topico | undefined {
  return dados.materias
    .flatMap((m) => m.topicos)
    .filter((t) => t.status === 'em_andamento' && t.atividade_em)
    .sort((a, b) => (b.atividade_em ?? '').localeCompare(a.atividade_em ?? ''))[0];
}
