/**
 * Tela do código da turma (rota /codigo-da-turma): só aparece para aluno logado sem turma.
 * O aluno digita o código de 6 caracteres que o professor passou e entra na turma.
 * Depois disso o layout raiz recarrega o /api/me e leva o aluno para o início.
 */
import React, { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CampoTexto } from '@/components/auth/campo-text';
import { TelaAuth } from '@/components/auth/screen-auth';
import { useEstilosAuth } from '@/components/auth/styles-auth';
import { useSessao } from '@/hooks/use-sessao';
import { entrarNaTurma } from '@/services/api';
import { sair } from '@/services/auth';

export default function CodigoDaTurmaScreen() {
  const s = useEstilosAuth();
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
      } else {
        setErroGeral(r.erro);
      }
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  };

  return (
    <TelaAuth
      titulo={nome ? `Olá, ${nome}!` : 'Entrar na turma'}
      subtitulo="Digite o código da turma que o seu professor passou."
    >
      {!!erroGeral && (
        <View style={s.erroBanner}>
          <Text style={s.erroTexto} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {erroGeral}
          </Text>
        </View>
      )}

      <CampoTexto
        rotulo="Código da turma"
        value={codigo}
        onChangeText={(t) => { setCodigo(t); setErroCampo(null); setErroGeral(null); }}
        erro={erroCampo}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        returnKeyType="send"
        onSubmitEditing={enviar}
        editable={!enviando}
      />

      <Pressable
        style={[s.botao, enviando && s.botaoDesativado]}
        onPress={enviar}
        disabled={enviando}
        accessibilityRole="button"
        accessibilityLabel={enviando ? 'Entrando na turma' : 'Entrar na turma'}
        accessibilityState={{ disabled: enviando, busy: enviando }}
      >
        <Text style={s.botaoTexto}>{enviando ? 'Entrando…' : 'Entrar na turma'}</Text>
      </Pressable>

      <Pressable style={s.link} onPress={sair} accessibilityRole="button" accessibilityLabel="Sair da conta">
        <Text style={s.linkTexto}>Não é você? Sair</Text>
      </Pressable>
    </TelaAuth>
  );
}
