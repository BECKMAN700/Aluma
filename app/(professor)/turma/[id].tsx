/**
 * Turma do professor (rota /turma/[id]?aba=), aprovada em 15/11: três abas.
 * Trilha: as matérias dele e os tópicos. Painel: onde a turma trava, só números e o resumo das
 * dúvidas pela IA. Alunos: só os nomes; a conversa do aluno nunca chega ao professor.
 */
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { CartaoDoTopico } from '@/components/cartao-do-topico';
import { AvisoCarregando, AvisoErro, LinkTexto } from '@/components/horizonte/formulario';
import { MateriasDaTurma } from '@/components/materias-da-turma';
import { Cartao, Linha, Pilula, TelaSistema, Vazio, estilosSistema } from '@/components/sistema';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { buscarPainel } from '@/services/painel';
import { alunosDaTurma, listarTurmas } from '@/services/turmas';

type Aba = 'trilha' | 'painel' | 'alunos';
const ABAS: { valor: Aba; nome: string }[] = [
  { valor: 'trilha', nome: 'Trilha' },
  { valor: 'painel', nome: 'Painel' },
  { valor: 'alunos', nome: 'Alunos' },
];

export default function TurmaScreen() {
  const { id, aba: abaInicial } = useLocalSearchParams<{ id: string; aba?: Aba }>();
  const [aba, setAba] = useState<Aba>(ABAS.some((a) => a.valor === abaInicial) ? (abaInicial as Aba) : 'trilha');
  const [turmas] = useDadosDaTela(listarTurmas);
  // A turma sai da lista do próprio professor: turma de outro não aparece (e o servidor nega).
  const turma = turmas.estado === 'pronto' ? turmas.dados.turmas.find((t) => t.id === id) : undefined;

  if (turmas.estado === 'pronto' && !turma) {
    return (
      <TelaSistema titulo="Turma não encontrada">
        <LinkTexto texto="Voltar para o início" rotulo="Voltar para o início" aoTocar={() => router.replace('/turmas')} />
      </TelaSistema>
    );
  }

  return (
    <TelaSistema
      titulo={turma?.nome ?? 'Turma'}
      acao={<Pilula texto="Voltar" aoTocar={() => (router.canGoBack() ? router.back() : router.replace('/turmas'))} />}
    >
      <View style={estilosSistema.acoes} role="tablist">
        {ABAS.map((a) => (
          <Pilula key={a.valor} texto={a.nome} destaque={aba === a.valor} aoTocar={() => setAba(a.valor)} />
        ))}
      </View>
      {aba === 'trilha' && <MateriasDaTurma turmaId={id} />}
      {aba === 'painel' && <Painel turmaId={id} />}
      {aba === 'alunos' && <Alunos turmaId={id} />}
    </TelaSistema>
  );
}

function Painel({ turmaId }: { turmaId: string }) {
  const buscar = useCallback(() => buscarPainel(turmaId), [turmaId]);
  const [dados, tentarDeNovo] = useDadosDaTela(buscar);
  // Quem trava primeiro: mais alunos tentando sem dominar. Empate: a ordem da trilha.
  const topicos =
    dados.estado === 'pronto'
      ? [...dados.dados.topicos].sort((a, b) => b.em_andamento - a.em_andamento || a.ordem - b.ordem)
      : [];
  return (
    <>
      {dados.estado === 'carregando' && <AvisoCarregando texto="Carregando o painel…" />}
      {dados.estado === 'erro' && (
        <>
          <AvisoErro mensagem={dados.erro} />
          <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={tentarDeNovo} />
        </>
      )}
      {dados.estado === 'pronto' && topicos.length === 0 && (
        <Vazio texto="Crie os tópicos da sua matéria na aba Trilha para acompanhar a turma aqui." />
      )}
      {topicos.map((topico) => (
        <CartaoDoTopico key={topico.id} topico={topico} />
      ))}
    </>
  );
}

function Alunos({ turmaId }: { turmaId: string }) {
  const buscar = useCallback(() => alunosDaTurma(turmaId), [turmaId]);
  const [dados] = useDadosDaTela(buscar);
  return (
    <Cartao titulo={dados.estado === 'pronto' ? `Alunos (${dados.dados.alunos.length})` : 'Alunos'}>
      {dados.estado === 'carregando' && <AvisoCarregando texto="Carregando os alunos…" />}
      {dados.estado === 'erro' && <AvisoErro mensagem={dados.erro} />}
      {dados.estado === 'pronto' && dados.dados.alunos.length === 0 && (
        <Vazio texto="Nenhum aluno ainda. A coordenação matricula e manda o convite." />
      )}
      {dados.estado === 'pronto' && dados.dados.alunos.map((a) => <Linha key={a.id} titulo={a.nome} />)}
    </Cartao>
  );
}
