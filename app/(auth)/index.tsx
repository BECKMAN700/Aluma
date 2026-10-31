/**
 * Primeira tela do app (rota "/"): o usuário escolhe o perfil, Aluno ou Professor.
 * Ao tocar em um card, vai para /entrar levando o perfil como parâmetro.
 * O perfil só muda textos da interface; o papel real vem do backend (nucleo/auth.py).
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TelaAuth } from '@/components/auth/screen-auth';
import { useCoresAuth } from '@/constants/auth-theme';
import type { Perfil } from '@/services/auth';

const PERFIS: { id: Perfil; titulo: string; descricao: string }[] = [
  { id: 'aluno', titulo: 'Aluno', descricao: 'Estude com um tutor que te ajuda a pensar.' },
  { id: 'professor', titulo: 'Professor', descricao: 'Crie turmas e acompanhe seus alunos.' },
];

export default function EscolherPerfilScreen() {
  const router = useRouter();
  const c = useCoresAuth();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        lista: { width: '100%', gap: 12 },
        cartao: {
          width: '100%',
          minHeight: 72,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: c.cartao,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: c.borda,
          paddingVertical: 14,
          paddingHorizontal: 16,
        },
        cartaoPressionado: { borderColor: c.link },
        textos: { flex: 1, minWidth: 0, gap: 2 },
        cartaoTitulo: { fontSize: 16, fontWeight: '700', color: c.texto },
        cartaoDescricao: { flexShrink: 1, fontSize: 13, lineHeight: 19, color: c.textoSuave },
        seta: { fontSize: 24, color: c.placeholder },
      }),
    [c],
  );

  return (
    <TelaAuth titulo="Qual é o seu perfil?" subtitulo="Escolha o seu módulo para entrar com a sua conta.">
      <View style={styles.lista}>
        {PERFIS.map((perfil) => (
          <Pressable
            key={perfil.id}
            style={({ pressed }) => [styles.cartao, pressed && styles.cartaoPressionado]}
            onPress={() => router.push({ pathname: '/entrar', params: { perfil: perfil.id } })}
            accessibilityRole="button"
            accessibilityLabel={`${perfil.titulo}. ${perfil.descricao}`}
          >
            <View style={styles.textos}>
              <Text style={styles.cartaoTitulo}>{perfil.titulo}</Text>
              <Text style={styles.cartaoDescricao}>{perfil.descricao}</Text>
            </View>
            <Text style={styles.seta}>›</Text>
          </Pressable>
        ))}
      </View>
    </TelaAuth>
  );
}
