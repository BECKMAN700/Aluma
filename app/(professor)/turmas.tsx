/**
 * Início do professor (rota /turmas), aprovado em 15/11: o "Fique atento" com os tópicos em que
 * mais alunos estão tentando sem dominar, e um cartão por turma. Só números: a conversa do aluno
 * nunca chega ao professor.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AvisoCarregando, AvisoErro, LinkTexto } from '@/components/horizonte/formulario';
import { BarraDeProgresso, Pilula, TelaSistema, Vazio, estilosSistema } from '@/components/sistema';
import { FontesHorizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { useSessao } from '@/hooks/use-sessao';
import { type Cores, useEstilos } from '@/hooks/use-tema';
import { buscarResumo } from '@/services/turmas';
import type { ResumoDoProfessor } from '@/types/api';

type Aba = 'trilha' | 'painel' | 'alunos';

function abrir(id: string, aba: Aba) {
  router.push({ pathname: '/turma/[id]', params: { id, aba } });
}

export default function InicioDoProfessorScreen() {
  const styles = useEstilos(criarEstilos);
  const { sessao } = useSessao();
  const nome = sessao.estado === 'pronto' ? sessao.usuario.nome : '';
  const [resumo, tentarDeNovo] = useDadosDaTela(buscarResumo);

  return (
    <TelaSistema titulo={nome ? `Olá, ${nome}` : 'Olá'}>
      {resumo.estado === 'carregando' && <AvisoCarregando texto="Carregando suas turmas…" />}
      {resumo.estado === 'erro' && (
        <>
          <AvisoErro mensagem={resumo.erro} />
          <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={tentarDeNovo} />
        </>
      )}
      {resumo.estado === 'pronto' && (
        <>
          <FiqueAtento atencao={resumo.dados.atencao} />
          {resumo.dados.turmas.length === 0 && (
            <Vazio texto="Você ainda não tem turma. A coordenação da escola liga você às turmas pela matéria." />
          )}
          <View style={styles.grade}>
            {resumo.dados.turmas.map((t) => (
              <CartaoDaTurma key={t.id} turma={t} />
            ))}
          </View>
        </>
      )}
    </TelaSistema>
  );
}

function FiqueAtento({ atencao }: { atencao: ResumoDoProfessor['atencao'] }) {
  const styles = useEstilos(criarEstilos);
  if (atencao.length === 0) return null;
  return (
    <View style={styles.atencao} accessibilityLabel="Fique atento">
      <Text style={styles.atencaoTitulo} accessibilityRole="header">Fique atento</Text>
      <Text style={styles.apoio}>Tópicos em que alunos começaram e ainda não dominaram. Só números: a conversa deles é privada.</Text>
      <View style={styles.atencaoGrade}>
        {atencao.map((a) => (
          <Pressable
            key={a.topico_id}
            style={({ pressed }) => [styles.atencaoItem, pressed && styles.pressionado]}
            onPress={() => abrir(a.turma_id, 'painel')}
            accessibilityRole="link"
            accessibilityLabel={`${a.em_andamento} alunos tentando ${a.topico}, ${a.turma}. Abrir o painel`}
          >
            <Text style={styles.numero}>{a.em_andamento}</Text>
            <Text style={styles.apoio} numberOfLines={2}>em {a.topico} · {a.turma}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function CartaoDaTurma({ turma: t }: { turma: ResumoDoProfessor['turmas'][number] }) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.cartao}>
      <Text style={styles.nome} accessibilityRole="header">{t.nome}</Text>
      <Text style={styles.apoio}>
        {t.serie} · {t.alunos} {t.alunos === 1 ? 'aluno' : 'alunos'} · {t.topicos} {t.topicos === 1 ? 'tópico' : 'tópicos'}
      </Text>
      <BarraDeProgresso dominado={t.dominado} emAndamento={t.em_andamento} naoIniciado={t.nao_iniciado} />
      <View style={estilosSistema.acoes}>
        <Pilula texto="Abrir turma" destaque aoTocar={() => abrir(t.id, 'trilha')} />
        <Pilula texto="Painel" rotulo={`Painel de ${t.nome}`} aoTocar={() => abrir(t.id, 'painel')} />
        <Pilula texto="Alunos" rotulo={`Alunos de ${t.nome}`} aoTocar={() => abrir(t.id, 'alunos')} />
      </View>
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    pressionado: { opacity: 0.8 },
    grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    cartao: {
      flexGrow: 1, flexBasis: 320, gap: 10, padding: 18, borderRadius: 16,
      borderWidth: 1, borderColor: cores.hairline, backgroundColor: cores.surface,
    },
    nome: { fontFamily: FontesHorizonte.display, fontSize: 19, color: cores.text },
    apoio: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: cores.textMuted },
    atencao: { gap: 10, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: cores.action, backgroundColor: cores.surface },
    atencaoTitulo: { fontFamily: FontesHorizonte.display, fontSize: 17, color: cores.action },
    atencaoGrade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    atencaoItem: {
      flexGrow: 1, flexBasis: 180, minHeight: 44, gap: 2, padding: 12, borderRadius: 12,
      borderWidth: 1, borderColor: cores.hairline, backgroundColor: cores.bg,
    },
    numero: { fontFamily: FontesHorizonte.display, fontSize: 26, color: cores.text },
  });
