/**
 * Layout das abas do app.
 */
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Horizonte } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        // Só existe uma aba: a barra ocuparia espaço no celular pequeno sem levar a lugar nenhum.
        tabBarStyle: { display: 'none' },
        sceneStyle: { backgroundColor: Horizonte.bg },
      }}>
      {/* arquivo renomeado: index.tsx -> home.tsx (a rota "/" agora é a escolha de perfil) */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
