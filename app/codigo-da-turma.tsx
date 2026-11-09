/**
 * Tela do código da turma (rota /codigo-da-turma): só aparece para aluno logado sem turma.
 * O aluno digita o código de 6 caracteres que o professor passou e entra na turma.
 * Depois disso o layout raiz recarrega o /api/me e leva o aluno para o início.
 */
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EstrelaNoHorizonte, Surgir } from '@/components/horizonte/ceu';
import {
  AvisoErro,
  BotaoPrincipal,
  CabecalhoMarca,
  CodigoTurma,
  LinkTexto,
  TelaFormulario,
  TituloTela,
} from '@/components/horizonte/formulario';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { useSessao } from '@/hooks/use-sessao';
import { entrarNaTurma } from '@/services/api';
import { sair } from '@/services/auth';

export default function CodigoDaTurmaScreen() {
  const { sessao, recarregar } = useSessao();
  const nome = sessao.estado === 'pronto' ? sessao.usuario.nome : '';

  const [codigo, setCodigo] = useState('');
  const [erroCampo, setErroCampo] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const enviandoRef = useRef(false);

  const enviar = async () => {
    if (enviandoRef.current) return;
    const limpo = codigo.trim().toUpperCase();
    if (limpo.length !== 6) {
      setErroCampo('O código tem 6 letras ou números.');
      return;
    }

    enviandoRef.current = true;
    setEnviando(true);
    setErroGeral(null);
    try {
      const r = await entrarNaTurma(limpo);
      if (r.ok || r.status === 409) {
        // 409 = já tem turma: o /api/me novo leva para o início do mesmo jeito.
        await recarregar();
      } else if (r.status === 404) {
        setErroCampo('Código não encontrado. Confira com seu professor.');
      } else if (r.status === 401) {
        // Sessão vencida: sair leva de volta ao login (use-sessao), em vez de prender o aluno aqui.
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
    <TelaFormulario topo={20}>
      <Surgir style={styles.camada}>
        <CabecalhoMarca />
      </Surgir>

      <TituloTela
        titulo={nome ? `Olá, ${nome}!` : 'Entrar na turma'}
        subtitulo="Digite o código da turma que o seu professor passou."
        style={styles.textos}
      />

      <View style={styles.estrela}>
        <EstrelaNoHorizonte tamanho={44} />
      </View>

      <Surgir style={[styles.formulario, styles.camada]}>
        {!!erroGeral && <AvisoErro mensagem={erroGeral} />}

        <CodigoTurma
          rotulo="Código da turma"
          valor={codigo}
          // Sem espaços: um espaço ocuparia uma célula e pareceria uma letra faltando.
          aoMudar={(t) => { setCodigo(t.replace(/\s/g, '')); setErroCampo(null); setErroGeral(null); }}
          erro={erroCampo}
          aoEnviar={enviar}
          editavel={!enviando}
        />

        <View style={styles.acoes}>
          <BotaoPrincipal texto="Entrar na turma" textoOcupado="Entrando…" ocupado={enviando} aoTocar={enviar} />
          <LinkTexto texto="Não é você? Sair" rotulo="Sair da conta" aoTocar={sair} />
        </View>
      </Surgir>

      <View style={styles.espaco} />
      <Surgir style={styles.camada}>
        <Text style={styles.frase}>Aprender é descobrir a própria luz.</Text>
      </Surgir>
    </TelaFormulario>
  );
}

const styles = StyleSheet.create({
  camada: { zIndex: 1 },
  textos: { marginTop: 16, gap: 6 },
  estrela: { marginTop: 47, marginBottom: 30 },
  formulario: { gap: 24 },
  acoes: { gap: 8 },
  espaco: { flexGrow: 1, minHeight: 24 },
  frase: {
    fontFamily: FontesHorizonte.displayMedio,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: Horizonte.textMuted,
  },
});
