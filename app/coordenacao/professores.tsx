/**
 * Professores da escola (rota /coordenacao/professores). Criar mostra a senha provisória uma
 * vez só: o coordenador repassa, e o professor troca no primeiro acesso.
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { Cartao, Linha, Pilula, TelaSistema, Vazio, estilosSistema } from '@/components/coordenacao/sistema';
import { AvisoCarregando, AvisoErro, CampoTexto, LinkTexto } from '@/components/horizonte/formulario';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { criarProfessor, listarProfessores } from '@/services/coordenacao';
import type { ProfessorCriado } from '@/types/api';

export default function ProfessoresScreen() {
  const [professores, recarregar] = useDadosDaTela(listarProfessores);
  const [criado, setCriado] = useState<ProfessorCriado | null>(null);

  return (
    <TelaSistema titulo="Professores">
      {criado ? (
        <SenhaProvisoria professor={criado} aoFechar={() => setCriado(null)} />
      ) : (
        <NovoProfessor
          aoCriar={(p) => {
            setCriado(p);
            recarregar();
          }}
        />
      )}

      <Cartao titulo="Professores da escola">
        {professores.estado === 'carregando' && <AvisoCarregando texto="Carregando os professores…" />}
        {professores.estado === 'erro' && (
          <>
            <AvisoErro mensagem={professores.erro} />
            <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={recarregar} />
          </>
        )}
        {professores.estado === 'pronto' && professores.dados.professores.length === 0 && (
          <Vazio texto="Nenhum professor ainda." />
        )}
        {professores.estado === 'pronto' &&
          professores.dados.professores.map((p) => (
            <Linha
              key={p.id}
              titulo={p.nome}
              detalhe={p.materias ? `${p.materias} ${p.materias === 1 ? 'matéria' : 'matérias'}` : 'ainda sem turma'}
            />
          ))}
      </Cartao>
    </TelaSistema>
  );
}

function NovoProfessor({ aoCriar }: { aoCriar: (p: ProfessorCriado) => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (enviando) return;
    if (!nome.trim() || !email.includes('@')) return setErro('Escreva o nome e o e-mail do professor.');
    setErro(null);
    setEnviando(true);
    const r = await criarProfessor(nome.trim(), email.trim());
    setEnviando(false);
    if (!r.ok) return setErro(r.erro);
    setNome('');
    setEmail('');
    aoCriar(r.dados);
  };

  return (
    <Cartao titulo="Cadastrar professor">
      <View style={estilosSistema.formulario}>
        {!!erro && <AvisoErro mensagem={erro} />}
        <CampoTexto rotulo="Nome" value={nome} onChangeText={setNome} maxLength={100} autoCapitalize="words" />
        <CampoTexto
          rotulo="E-mail"
          placeholder="ana@escola.edu.br"
          value={email}
          onChangeText={setEmail}
          maxLength={254}
          keyboardType="email-address"
          autoComplete="off"
          onSubmitEditing={enviar}
        />
        <View style={estilosSistema.acoes}>
          <Pilula texto={enviando ? 'Criando…' : 'Criar conta'} destaque ocupado={enviando} aoTocar={enviar} />
        </View>
      </View>
    </Cartao>
  );
}

function SenhaProvisoria({ professor, aoFechar }: { professor: ProfessorCriado; aoFechar: () => void }) {
  const [copiou, setCopiou] = useState(false);
  const texto = `Sua conta no sistema da escola: ${professor.email}, senha provisória ${professor.senha_provisoria}. Troque no primeiro acesso.`;

  return (
    <Cartao titulo={`Conta de ${professor.nome} criada`}>
      <Text style={styles.texto}>Anote ou copie agora: a senha provisória não aparece de novo.</Text>
      <Text style={styles.dado} selectable>
        {professor.email}
      </Text>
      <Text style={styles.senha} selectable accessibilityLabel={`Senha provisória: ${professor.senha_provisoria.split('').join(' ')}`}>
        {professor.senha_provisoria}
      </Text>
      <View style={estilosSistema.acoes}>
        <Pilula
          texto={copiou ? 'Copiado' : 'Copiar para mandar'}
          destaque
          aoTocar={async () => setCopiou(await Clipboard.setStringAsync(texto).catch(() => false))}
        />
        <Pilula texto="Pronto" aoTocar={aoFechar} />
      </View>
    </Cartao>
  );
}

const styles = StyleSheet.create({
  texto: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: Horizonte.textMuted },
  dado: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 15, color: Horizonte.text },
  senha: { fontFamily: FontesHorizonte.display, fontSize: 26, letterSpacing: 2, color: Horizonte.action },
});
