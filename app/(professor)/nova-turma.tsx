/**
 * Criar turma (rota /nova-turma). Valida o básico para responder na hora; quem decide é o servidor.
 * Criou, vai direto para a tela da turma, onde está o código para passar aos alunos.
 */
import React, { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import { CampoTexto } from '@/components/auth/campo-text';
import { useEstilosAuth } from '@/components/auth/styles-auth';
import { TelaProfessor } from '@/components/professor/tela-professor';
import { sair } from '@/services/auth';
import { criarTurma } from '@/services/turmas';

export default function NovaTurmaScreen() {
  const s = useEstilosAuth();
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
    <TelaProfessor>
      {erroGeral && (
        <View style={s.erroBanner}>
          <Text style={s.erroTexto} accessibilityRole="alert">
            {erroGeral}
          </Text>
        </View>
      )}
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
      />
      <Pressable
        style={[s.botao, enviando && s.botaoDesativado]}
        onPress={enviar}
        disabled={enviando}
        accessibilityRole="button"
        accessibilityState={{ disabled: enviando, busy: enviando }}
      >
        <Text style={s.botaoTexto}>{enviando ? 'Criando…' : 'Criar turma'}</Text>
      </Pressable>
    </TelaProfessor>
  );
}
