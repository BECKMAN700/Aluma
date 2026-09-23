import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Chat com o Tutor',
          headerShown: true,
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Tela de Chat do Aluma
        </Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>
          Conectando com o tutor educacional...
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    // Regra 1: Ocupa todo o espaço vertical disponível sem altura fixa.
    // Diferença da Web: No CSS da web precisaríamos de `height: 100vh`. No React Native,
    // toda View já é display flex e `flex: 1` expande pelo eixo principal do pai.
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12, // Regra 4: espaçamento entre filhos usando gap, sem margens individuais.
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
