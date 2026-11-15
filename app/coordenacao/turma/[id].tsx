/**
 * Uma turma vista pelo coordenador (rota /coordenacao/turma/[id]): os alunos (pré-cadastrar,
 * transferir, remover) e os professores ligados a ela pela matéria.
 */
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Cartao, Linha, Pilula, TelaSistema, Vazio, estilosSistema } from '@/components/sistema';
import { AvisoCarregando, AvisoErro, AvisoInfo, CampoTexto, LinkTexto } from '@/components/horizonte/formulario';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import {
  ligarProfessor,
  listarAlunos,
  listarProfessores,
  listarTurmasDaEscola,
  preCadastrarAluno,
  removerAluno,
  transferirAluno,
} from '@/services/coordenacao';
import type { AlunoPreCadastrado, TurmaDaEscola } from '@/types/api';

type Aba = 'alunos' | 'professores';

export default function TurmaDoCoordenadorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [aba, setAba] = useState<Aba>('alunos');
  const [turmas, recarregarTurmas] = useDadosDaTela(listarTurmasDaEscola);
  const buscarAlunos = useCallback(() => listarAlunos(id), [id]);
  const [alunos, recarregarAlunos] = useDadosDaTela(buscarAlunos);

  const turma = turmas.estado === 'pronto' ? turmas.dados.turmas.find((t) => t.id === id) : undefined;
  const outras = turmas.estado === 'pronto' ? turmas.dados.turmas.filter((t) => t.id !== id) : [];

  if (turmas.estado === 'pronto' && !turma) {
    return (
      <TelaSistema titulo="Turma não encontrada">
        <LinkTexto texto="Voltar para as turmas" rotulo="Voltar para as turmas" aoTocar={() => router.replace('/coordenacao')} />
      </TelaSistema>
    );
  }

  const recarregar = () => {
    recarregarAlunos();
    recarregarTurmas();
  };

  return (
    <TelaSistema titulo={turma?.nome ?? 'Turma'} acao={<Pilula texto="Voltar" aoTocar={() => (router.canGoBack() ? router.back() : router.replace('/coordenacao'))} />}>
      <View style={estilosSistema.acoes}>
        <Pilula texto={`Alunos (${turma?.alunos ?? '…'})`} destaque={aba === 'alunos'} aoTocar={() => setAba('alunos')} />
        <Pilula texto={`Professores (${turma?.materias.length ?? '…'})`} destaque={aba === 'professores'} aoTocar={() => setAba('professores')} />
      </View>

      {aba === 'alunos' && (
        <>
          <NovoAluno turmaId={id} aoCriar={recarregar} />
          <Cartao titulo="Alunos da turma">
            {alunos.estado === 'carregando' && <AvisoCarregando texto="Carregando os alunos…" />}
            {alunos.estado === 'erro' && <AvisoErro mensagem={alunos.erro} />}
            {alunos.estado === 'pronto' && alunos.dados.alunos.length === 0 && (
              <Vazio texto="Nenhum aluno ainda. Cadastre acima e mande o link de convite da escola." />
            )}
            {alunos.estado === 'pronto' &&
              alunos.dados.alunos.map((a) => <LinhaDoAluno key={a.id} aluno={a} outras={outras} aoMudar={recarregar} />)}
          </Cartao>
        </>
      )}

      {aba === 'professores' && turma && <ProfessoresDaTurma turma={turma} aoLigar={recarregarTurmas} />}
    </TelaSistema>
  );
}

/** "DD/MM/AAAA" → "AAAA-MM-DD", ou null se não for uma data de verdade. */
function dataDoServidor(texto: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!m) return null;
  const [, dia, mes, ano] = m;
  const data = new Date(`${ano}-${mes}-${dia}T00:00:00`);
  return !isNaN(data.getTime()) && data.getDate() === Number(dia) ? `${ano}-${mes}-${dia}` : null;
}

function NovoAluno({ turmaId, aoCriar }: { turmaId: string; aoCriar: () => void }) {
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (enviando) return;
    setOk(null);
    const data = dataDoServidor(nascimento);
    if (!nome.trim() || !matricula.trim()) return setErro('Preencha o nome e a matrícula.');
    if (!data) return setErro('Escreva a data de nascimento como 04/03/2012.');
    setErro(null);
    setEnviando(true);
    const r = await preCadastrarAluno(turmaId, nome.trim(), matricula.trim(), data);
    setEnviando(false);
    if (!r.ok) return setErro(r.erro);
    setOk(`${r.dados.nome} cadastrado. Agora ele entra pelo link de convite.`);
    setNome('');
    setMatricula('');
    setNascimento('');
    aoCriar();
  };

  return (
    <Cartao titulo="Cadastrar aluno">
      <View style={estilosSistema.formulario}>
        {!!erro && <AvisoErro mensagem={erro} />}
        {!!ok && <AvisoInfo mensagem={ok} />}
        <CampoTexto rotulo="Nome completo" value={nome} onChangeText={setNome} maxLength={100} autoCapitalize="words" />
        <CampoTexto rotulo="Matrícula" placeholder="2026001" value={matricula} onChangeText={setMatricula} maxLength={30} />
        <CampoTexto
          rotulo="Data de nascimento"
          placeholder="04/03/2012"
          value={nascimento}
          onChangeText={setNascimento}
          maxLength={10}
          keyboardType="numbers-and-punctuation"
          onSubmitEditing={enviar}
        />
        <View style={estilosSistema.acoes}>
          <Pilula texto={enviando ? 'Cadastrando…' : 'Cadastrar aluno'} destaque ocupado={enviando} aoTocar={enviar} />
        </View>
      </View>
    </Cartao>
  );
}

function LinhaDoAluno({ aluno, outras, aoMudar }: { aluno: AlunoPreCadastrado; outras: TurmaDaEscola[]; aoMudar: () => void }) {
  const [modo, setModo] = useState<'nada' | 'transferir' | 'remover'>('nada');
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const agir = async (acao: () => Promise<{ ok: boolean; erro?: string }>) => {
    setOcupado(true);
    const r = await acao();
    setOcupado(false);
    if (!r.ok) return setErro(r.erro ?? 'Não deu certo. Tente de novo.');
    setModo('nada');
    aoMudar();
  };

  return (
    <>
      <Linha titulo={aluno.nome} detalhe={`Matrícula ${aluno.matricula} · ${aluno.entrou ? 'já entrou' : 'ainda não entrou'}`}>
        {modo === 'nada' && (
          <View style={estilosSistema.acoes}>
            <Pilula texto="Transferir" rotulo={`Transferir ${aluno.nome}`} aoTocar={() => setModo('transferir')} />
            <Pilula texto="Remover" rotulo={`Remover ${aluno.nome}`} aoTocar={() => setModo('remover')} />
          </View>
        )}
      </Linha>
      {!!erro && <AvisoErro mensagem={erro} />}
      {modo === 'transferir' && (
        <View style={estilosSistema.acoes}>
          {outras.length === 0 && <Vazio texto="Crie outra turma para transferir." />}
          {outras.map((t) => (
            <Pilula key={t.id} texto={`Para ${t.nome}`} ocupado={ocupado} aoTocar={() => agir(() => transferirAluno(aluno.id, t.id))} />
          ))}
          <Pilula texto="Cancelar" aoTocar={() => setModo('nada')} />
        </View>
      )}
      {modo === 'remover' && (
        <View style={estilosSistema.acoes}>
          <Vazio texto={`Remover ${aluno.nome} da escola apaga as conversas e o progresso dele. Não dá para desfazer.`} />
          <Pilula texto={ocupado ? 'Removendo…' : 'Sim, remover'} destaque ocupado={ocupado} aoTocar={() => agir(() => removerAluno(aluno.id))} />
          <Pilula texto="Cancelar" aoTocar={() => setModo('nada')} />
        </View>
      )}
    </>
  );
}

function ProfessoresDaTurma({ turma, aoLigar }: { turma: TurmaDaEscola; aoLigar: () => void }) {
  const [professores] = useDadosDaTela(listarProfessores);
  const [disciplina, setDisciplina] = useState('');
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const ligar = async () => {
    if (enviando) return;
    if (!disciplina.trim() || !escolhido) return setErro('Escolha o professor e escreva a disciplina.');
    setErro(null);
    setEnviando(true);
    const r = await ligarProfessor(turma.id, disciplina.trim(), escolhido);
    setEnviando(false);
    if (!r.ok) return setErro(r.erro);
    setDisciplina('');
    setEscolhido(null);
    aoLigar();
  };

  return (
    <>
      <Cartao titulo="Professores da turma">
        {turma.materias.length === 0 && <Vazio texto="Nenhum professor ainda. Ligue um abaixo." />}
        {turma.materias.map((m) => (
          <Linha key={m.id} titulo={m.nome} detalhe={m.professor} />
        ))}
      </Cartao>
      <Cartao titulo="Ligar professor à turma">
        <View style={estilosSistema.formulario}>
          {!!erro && <AvisoErro mensagem={erro} />}
          {professores.estado === 'carregando' && <AvisoCarregando texto="Carregando os professores…" />}
          {professores.estado === 'pronto' && professores.dados.professores.length === 0 && (
            <Vazio texto="Cadastre o professor na aba Professores do menu primeiro." />
          )}
          <View style={estilosSistema.acoes}>
            {professores.estado === 'pronto' &&
              professores.dados.professores.map((p) => (
                <Pilula key={p.id} texto={p.nome} destaque={escolhido === p.id} aoTocar={() => setEscolhido(p.id)} />
              ))}
          </View>
          <CampoTexto rotulo="Disciplina" placeholder="Matemática" value={disciplina} onChangeText={setDisciplina} maxLength={60} autoCapitalize="sentences" onSubmitEditing={ligar} />
          <View style={estilosSistema.acoes}>
            <Pilula texto={enviando ? 'Ligando…' : 'Ligar professor'} destaque ocupado={enviando} aoTocar={ligar} />
          </View>
        </View>
      </Cartao>
    </>
  );
}
