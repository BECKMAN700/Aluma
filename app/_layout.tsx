/**
 * Layout raiz do app: decide quais telas existem para quem está usando.
 * Sem login: (auth). Aluno sem turma: codigo-da-turma. Aluno com turma: (aluno) e chat.
 * Professor: (professor). Uma tela fora da guarda é tratada como inexistente e a pessoa
 * volta para a primeira tela que pode ver — é assim que o aluno não abre tela de professor.
 * Quem garante a permissão de verdade é o servidor; aqui é só a navegação.
 */
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { TelaAuth } from '@/components/auth/screen-auth';
import { useEstilosAuth } from '@/components/auth/styles-auth';
import { Night } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SessaoProvider, useSessao } from '@/hooks/use-sessao';
import { sair } from '@/services/auth';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessaoProvider>
        <Navegacao />
      </SessaoProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function Navegacao() {
  const { sessao } = useSessao();

  // Enquanto não sabe quem é, não monta nenhuma tela: nada de piscar a tela errada.
  if (sessao.estado === 'carregando') return <TelaEspera />;
  if (sessao.estado === 'erro') return <TelaErro erro={sessao.erro} />;

  const usuario = sessao.estado === 'pronto' ? sessao.usuario : null;
  const aluno = usuario?.papel === 'aluno';

  return (
    <Stack>
      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={aluno && !usuario.turma}>
        <Stack.Screen name="codigo-da-turma" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={aluno && !!usuario.turma}>
        <Stack.Screen name="(aluno)" options={{ headerShown: false }} />
        <Stack.Screen
          name="chat"
          options={{
            title: 'Conversar com o tutor',
            headerStyle: { backgroundColor: Night.sky },
            headerTintColor: Night.starlight,
            headerShadowVisible: false,
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={usuario?.papel === 'professor'}>
        <Stack.Screen name="(professor)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

function TelaEspera() {
  return (
    <TelaAuth titulo="Carregando…" subtitulo="Se o servidor estiver dormindo, isso leva até um minuto.">
      <ActivityIndicator size="large" color={Night.starlight} accessibilityLabel="Carregando" />
    </TelaAuth>
  );
}

function TelaErro({ erro }: { erro: string }) {
  const s = useEstilosAuth();
  const { recarregar } = useSessao();
  const [tentando, setTentando] = useState(false);

  const tentarDeNovo = async () => {
    setTentando(true);
    try {
      await recarregar();
    } finally {
      setTentando(false);
    }
  };

  return (
    <TelaAuth titulo="Não deu para abrir sua conta">
      <View style={s.erroBanner}>
        <Text style={s.erroTexto} accessibilityRole="alert">{erro}</Text>
      </View>
      <Pressable
        style={[s.botao, tentando && s.botaoDesativado]}
        onPress={tentarDeNovo}
        disabled={tentando}
        accessibilityRole="button"
        accessibilityState={{ disabled: tentando, busy: tentando }}
      >
        <Text style={s.botaoTexto}>{tentando ? 'Tentando…' : 'Tentar de novo'}</Text>
      </Pressable>
      <Pressable style={s.link} onPress={sair} accessibilityRole="button">
        <Text style={s.linkTexto}>Sair</Text>
      </Pressable>
    </TelaAuth>
  );
}
