/**
 * Layout do professor, estilo sistema (decisão de 15/11): no PC, menu lateral na cor da escola
 * com as turmas dele; no celular, a barra flutuando embaixo. As mesmas telas nos dois.
 */
import React, { useEffect, useState } from 'react';
import { Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BarraDeBaixo, type Destino, ItemDoMenu, MenuLateral } from '@/components/menu-do-sistema';
import { useTelaDeSistema } from '@/constants/auth-theme';
import { FontesHorizonte } from '@/constants/theme';
import { useCores } from '@/hooks/use-tema';
import { listarTurmas } from '@/services/turmas';
import type { Turma } from '@/types/api';

// Recarregar a página numa turma ainda deixa o "voltar" levando para o início.
export const unstable_settings = { initialRouteName: 'turmas' };

const DESTINOS: Destino[] = [
  { texto: 'Início', icone: 'home', caminho: '/turmas', acende: ['/turmas'] },
  { texto: 'Turmas', icone: 'groups', caminho: '/turmas', acende: ['/turma/', '/materia/'] },
];

export default function ProfessorLayout() {
  const cores = useCores();
  const pc = useTelaDeSistema();

  return (
    <View style={[styles.tela, { backgroundColor: cores.bg }]}>
      {pc && <MenuLateral destinos={DESTINOS.slice(0, 1)} extra={<TurmasNoMenu />} />}
      <View style={styles.conteudo}>
        <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: cores.bg } }}>
          <Stack.Screen name="turmas" />
          <Stack.Screen name="turma/[id]" />
          <Stack.Screen name="materia/[id]" />
        </Stack>
        {!pc && <BarraDeBaixo destinos={DESTINOS} />}
      </View>
    </View>
  );
}

/** As turmas do professor no menu lateral; busca de novo a cada troca de tela. */
function TurmasNoMenu() {
  const caminho = usePathname();
  const { id, turma } = useGlobalSearchParams<{ id?: string; turma?: string }>();
  const cores = useCores();
  const [turmas, setTurmas] = useState<Turma[]>([]);

  useEffect(() => {
    let valida = true;
    listarTurmas().then((r) => {
      if (valida && r.ok) setTurmas(r.dados.turmas);
    });
    return () => {
      valida = false;
    };
  }, [caminho]);

  // A matéria leva a turma junto no endereço.
  const aberta = caminho.startsWith('/materia/') ? turma : caminho.startsWith('/turma/') ? id : undefined;
  return (
    <>
      <Text style={[styles.secao, { color: cores.sobreMenu }]}>Suas turmas</Text>
      {turmas.map((t) => (
        <ItemDoMenu
          key={t.id}
          destino={{ texto: t.nome, icone: 'class', caminho: { pathname: '/turma/[id]', params: { id: t.id } } }}
          ativo={t.id === aberta}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, flexDirection: 'row' },
  conteudo: { flex: 1, minWidth: 0 },
  secao: { marginTop: 16, marginBottom: 4, paddingHorizontal: 12, fontFamily: FontesHorizonte.corpo, fontSize: 12, opacity: 0.8 },
});
