/**
 * Início do professor (rota /turmas): as turmas dele e o caminho para criar uma nova.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { useEstilosAuth } from '@/components/auth/styles-auth';
import { AvisoCarregando, AvisoErro, TelaProfessor } from '@/components/professor/tela-professor';
import { Auth } from '@/constants/auth-theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { useSessao } from '@/hooks/use-sessao';
import { sair } from '@/services/auth';
import { listarTurmas } from '@/services/turmas';

export default function TurmasScreen() {
  const s = useEstilosAuth();
  const { sessao } = useSessao();
  const nome = sessao.estado === 'pronto' ? sessao.usuario.nome : '';
  const [turmas, tentarDeNovo] = useDadosDaTela(listarTurmas);

  return (
    <TelaProfessor>
      <Text style={styles.saudacao} accessibilityRole="header">
        Olá, {nome}!
      </Text>

      <Link href="/nova-turma" asChild>
        <Pressable style={s.botao} accessibilityRole="button">
          <Text style={s.botaoTexto}>Criar turma</Text>
        </Pressable>
      </Link>

      {turmas.estado === 'carregando' && <AvisoCarregando texto="Carregando suas turmas…" />}
      {turmas.estado === 'erro' && <AvisoErro erro={turmas.erro} tentarDeNovo={tentarDeNovo} />}
      {turmas.estado === 'pronto' && turmas.dados.turmas.length === 0 && (
        <Text style={styles.vazio}>Você ainda não tem turma. Crie a primeira para receber um código.</Text>
      )}
      {turmas.estado === 'pronto' &&
        turmas.dados.turmas.map((turma) => (
          <Link key={turma.id} href={{ pathname: '/turma/[id]', params: { id: turma.id } }} asChild>
            <Pressable style={styles.cartao} accessibilityRole="link">
              <View style={styles.cartaoTexto}>
                <Text style={styles.cartaoNome}>{turma.nome}</Text>
                <Text style={styles.cartaoDetalhe}>
                  {turma.serie} · código {turma.codigo}
                </Text>
              </View>
              <Text style={styles.cartaoSeta}>›</Text>
            </Pressable>
          </Link>
        ))}

      <Pressable style={s.link} onPress={sair} accessibilityRole="button" accessibilityLabel="Sair da conta">
        <Text style={s.linkTexto}>Sair</Text>
      </Pressable>
    </TelaProfessor>
  );
}

const styles = StyleSheet.create({
  saudacao: { fontSize: 22, fontWeight: '700', color: Auth.texto },
  vazio: { fontSize: 15, lineHeight: 22, textAlign: 'center', color: Auth.textoSuave, paddingVertical: 16 },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Auth.borda,
    backgroundColor: Auth.cartao,
  },
  cartaoTexto: { flex: 1, minWidth: 0, gap: 2 },
  cartaoNome: { fontSize: 16, fontWeight: '700', color: Auth.texto },
  cartaoDetalhe: { fontSize: 14, color: Auth.textoSuave },
  cartaoSeta: { fontSize: 22, color: Auth.textoSuave },
});
