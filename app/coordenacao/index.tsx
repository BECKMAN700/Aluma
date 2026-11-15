/**
 * Início do coordenador (rota /coordenacao): o link de convite da escola e as turmas.
 */
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

import { Cartao, Linha, Pilula, TelaSistema, Vazio, estilosSistema } from '@/components/sistema';
import { AvisoCarregando, AvisoErro, CampoTexto, LinkTexto } from '@/components/horizonte/formulario';
import { FontesHorizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { buscarEscola, criarTurmaDaEscola, listarTurmasDaEscola } from '@/services/coordenacao';
import { type Cores, useEstilos } from '@/hooks/use-tema';

export default function TurmasDaEscolaScreen() {
  const [turmas, tentarDeNovo] = useDadosDaTela(listarTurmasDaEscola);
  const [criando, setCriando] = useState(false);

  return (
    <TelaSistema
      titulo="Turmas"
      acao={!criando && <Pilula texto="+ Turma" destaque aoTocar={() => setCriando(true)} />}
    >
      <CartaoDoConvite />

      {criando && <NovaTurma aoFechar={() => setCriando(false)} aoCriar={tentarDeNovo} />}

      <Cartao>
        {turmas.estado === 'carregando' && <AvisoCarregando texto="Carregando as turmas…" />}
        {turmas.estado === 'erro' && (
          <>
            <AvisoErro mensagem={turmas.erro} />
            <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={tentarDeNovo} />
          </>
        )}
        {turmas.estado === 'pronto' && turmas.dados.turmas.length === 0 && (
          <Vazio texto="Crie a primeira turma para matricular os alunos." />
        )}
        {turmas.estado === 'pronto' &&
          turmas.dados.turmas.map((t) => (
            <Linha
              key={t.id}
              titulo={t.nome}
              detalhe={`${t.serie} · ${t.alunos} ${t.alunos === 1 ? 'aluno' : 'alunos'} · ${
                t.materias.length ? t.materias.map((m) => m.nome).join(', ') : 'sem professor'
              }`}
              aoTocar={() => router.push({ pathname: '/coordenacao/turma/[id]', params: { id: t.id } })}
            />
          ))}
      </Cartao>
    </TelaSistema>
  );
}

function CartaoDoConvite() {
  const styles = useEstilos(criarEstilos);
  const [escola] = useDadosDaTela(buscarEscola);
  const [aviso, setAviso] = useState<string | null>(null);
  if (escola.estado !== 'pronto') return null;

  // Na web vira https://<site>/convite/<uuid>; no celular, o endereço do app.
  const link = Linking.createURL(`/convite/${escola.dados.convite}`);
  const copiar = async () => {
    const copiou = await Clipboard.setStringAsync(link).catch(() => false);
    setAviso(copiou ? 'Link copiado. Mande no grupo da turma ou no privado do aluno.' : 'Não deu para copiar. Selecione o link e copie.');
  };

  return (
    <Cartao titulo="Link de convite dos alunos">
      <Text style={styles.explicacao}>
        O aluno abre o link, entra com a conta dele e confirma com a matrícula e a data de nascimento que você cadastrou.
      </Text>
      <Text style={styles.link} selectable>
        {link}
      </Text>
      <View style={estilosSistema.acoes}>
        <Pilula texto="Copiar link" destaque aoTocar={copiar} />
      </View>
      {!!aviso && (
        <Text style={styles.explicacao} accessibilityLiveRegion="polite">
          {aviso}
        </Text>
      )}
    </Cartao>
  );
}

function NovaTurma({ aoFechar, aoCriar }: { aoFechar: () => void; aoCriar: () => void }) {
  const [nome, setNome] = useState('');
  const [serie, setSerie] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = useCallback(async () => {
    if (enviando) return;
    if (!nome.trim() || !serie.trim()) return setErro('Escreva o nome e a série da turma.');
    setEnviando(true);
    const r = await criarTurmaDaEscola(nome.trim(), serie.trim());
    setEnviando(false);
    if (!r.ok) return setErro(r.erro);
    aoCriar();
    aoFechar();
  }, [enviando, nome, serie, aoCriar, aoFechar]);

  return (
    <Cartao titulo="Nova turma">
      <View style={estilosSistema.formulario}>
        {!!erro && <AvisoErro mensagem={erro} />}
        <CampoTexto rotulo="Nome" placeholder="9º ano 01" value={nome} onChangeText={setNome} maxLength={60} autoCapitalize="sentences" />
        <CampoTexto rotulo="Série" placeholder="9º ano" value={serie} onChangeText={setSerie} maxLength={30} autoCapitalize="sentences" onSubmitEditing={enviar} />
        <View style={estilosSistema.acoes}>
          <Pilula texto={enviando ? 'Criando…' : 'Criar turma'} destaque ocupado={enviando} aoTocar={enviar} />
          <Pilula texto="Cancelar" aoTocar={aoFechar} />
        </View>
      </View>
    </Cartao>
  );
}

const criarEstilos = (cores: Cores) => StyleSheet.create({
  explicacao: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: cores.textMuted },
  link: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 14, lineHeight: 20, color: cores.luma },
});
