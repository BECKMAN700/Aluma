/**
 * Layout raiz do app: registra os grupos de rotas (auth), (tabs) e a tela de chat.
 */
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Night } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="chat"
          options={{
            title: 'Conversar com o tutor',
            headerStyle: { backgroundColor: Night.sky },
            headerTintColor: Night.starlight,
            headerShadowVisible: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
