/**
 * Início do professor (rota /turmas). Por enquanto só confirma quem entrou;
 * a lista de turmas, criar turma e ver alunos são a #100.
 */
import React from 'react';
import { Pressable, Text } from 'react-native';

import { TelaAuth } from '@/components/auth/screen-auth';
import { useEstilosAuth } from '@/components/auth/styles-auth';
import { useSessao } from '@/hooks/use-sessao';
import { sair } from '@/services/auth';

export default function TurmasScreen() {
  const s = useEstilosAuth();
  const { sessao } = useSessao();
  const nome = sessao.estado === 'pronto' ? sessao.usuario.nome : '';

  return (
    <TelaAuth titulo={`Olá, ${nome}!`} subtitulo="Em breve suas turmas e seus alunos aparecem aqui.">
      <Pressable style={s.link} onPress={sair} accessibilityRole="button" accessibilityLabel="Sair da conta">
        <Text style={s.linkTexto}>Sair</Text>
      </Pressable>
    </TelaAuth>
  );
}
