/**
 * Criar turma (rota /nova-turma). Valida o básico para responder na hora; quem decide é o servidor.
 * Criou, vai direto para a tela da turma, onde está o código para passar aos alunos.
 */
import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { EstrelaNoHorizonte, Surgir } from '@/components/horizonte/ceu';
import {
  AvisoErro,
  BotaoPrincipal,
  CabecalhoVoltar,
  CampoTexto,
  TelaFormulario,
  TituloTela,
} from '@/components/horizonte/formulario';
import { sair } from '@/services/auth';
import { criarTurma } from '@/services/turmas';

export default function NovaTurmaScreen() {
  const [nome, setNome] = useState('');
  const [serie, setSerie] = useState('');
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [erroSerie, setErroSerie] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const enviandoRef = useRef(false);

  const enviar = async () => {
    if (enviandoRef.current) return;
    const nomeLimpo = nome.trim();
    const serieLimpa = serie.trim();
    setErroNome(nomeLimpo ? null : 'Escreva o nome da turma.');
    setErroSerie(serieLimpa ? null : 'Escreva a série da turma.');
    setErroGeral(null);
    if (!nomeLimpo || !serieLimpa) return;

    enviandoRef.current = true;
    setEnviando(true);
    try {
      const r = await criarTurma(nomeLimpo, serieLimpa);
      if (r.ok) {
        router.replace({ pathname: '/turma/[id]', params: { id: r.dados.id } });
      } else if (r.status === 401) {
        await sair();
      } else {
        setErroGeral(r.erro);
      }
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  };

  return (
    <TelaFormulario>
      <Surgir style={styles.camada}>
        <CabecalhoVoltar
          texto="Voltar para as turmas"
          aoVoltar={() => (router.canGoBack() ? router.back() : router.replace('/turmas'))}
        />
      </Surgir>

      <TituloTela titulo="Criar turma" style={styles.textos} />

      <View style={styles.estrela}>
        <EstrelaNoHorizonte tamanho={36} />
      </View>

      <Surgir style={[styles.formulario, styles.camada]}>
        {!!erroGeral && <AvisoErro mensagem={erroGeral} />}

        <CampoTexto
          rotulo="Nome da turma"
          placeholder="Ex.: 8º ano B"
          value={nome}
          onChangeText={(t) => {
            setNome(t);
            setErroNome(null);
          }}
          erro={erroNome}
          maxLength={60}
          autoCapitalize="sentences"
          editable={!enviando}
        />
        <CampoTexto
          rotulo="Série"
          placeholder="Ex.: 8º ano"
          value={serie}
          onChangeText={(t) => {
            setSerie(t);
            setErroSerie(null);
          }}
          erro={erroSerie}
          maxLength={30}
          autoCapitalize="sentences"
          returnKeyType="done"
          onSubmitEditing={enviar}
          editable={!enviando}
        />

        <View style={styles.acoes}>
          <BotaoPrincipal texto="Criar turma" textoOcupado="Criando…" ocupado={enviando} aoTocar={enviar} />
        </View>
      </Surgir>
    </TelaFormulario>
  );
}

const styles = StyleSheet.create({
  camada: { zIndex: 1 },
  textos: { marginTop: 10 },
  estrela: { marginTop: 41, marginBottom: 28 },
  formulario: { gap: 16 },
  acoes: { marginTop: 8 },
});
