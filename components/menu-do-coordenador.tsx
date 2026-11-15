/**
 * Navegação do coordenador (opção A, 15/11): no PC, menu lateral escuro; no celular, a mesma
 * lista vira uma barra escura flutuando embaixo. Os dois usam os mesmos destinos.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { useSessao } from '@/hooks/use-sessao';
import { sair } from '@/services/auth';

type Icone = React.ComponentProps<typeof MaterialIcons>['name'];

const DESTINOS: { texto: string; icone: Icone; caminho: '/coordenacao' | '/coordenacao/professores' }[] = [
  { texto: 'Turmas', icone: 'groups', caminho: '/coordenacao' },
  { texto: 'Professores', icone: 'badge', caminho: '/coordenacao/professores' },
];

function ativo(caminhoAtual: string, destino: string): boolean {
  // A tela de uma turma (/coordenacao/turma/...) acende "Turmas".
  if (destino === '/coordenacao') return caminhoAtual === destino || caminhoAtual.startsWith('/coordenacao/turma');
  return caminhoAtual.startsWith(destino);
}

export function MenuLateralDoCoordenador() {
  const caminho = usePathname();
  const { sessao } = useSessao();
  const escola = sessao.estado === 'pronto' ? sessao.usuario.escola?.nome : undefined;

  return (
    <View style={styles.menu} role="navigation" aria-label="Menu da coordenação">
      <View style={styles.marca}>
        <MaterialIcons name="school" size={26} color={Horizonte.action} />
        <Text style={styles.marcaTexto} numberOfLines={2}>
          {escola ?? 'Coordenação'}
        </Text>
      </View>
      {DESTINOS.map((d) => (
        <ItemDoMenu key={d.caminho} {...d} ativo={ativo(caminho, d.caminho)} aoTocar={() => router.navigate(d.caminho)} />
      ))}
      <View style={styles.rodape}>
        {sessao.estado === 'pronto' && (
          <Text style={styles.usuario} numberOfLines={1}>
            {sessao.usuario.nome}
          </Text>
        )}
        <ItemDoMenu texto="Sair" icone="logout" ativo={false} aoTocar={sair} />
      </View>
    </View>
  );
}

function ItemDoMenu({ texto, icone, ativo: aceso, aoTocar }: { texto: string; icone: Icone; ativo: boolean; aoTocar: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, aceso && styles.itemAtivo, pressed && styles.pressionado]}
      onPress={aoTocar}
      accessibilityRole="link"
      accessibilityState={{ selected: aceso }}
    >
      <MaterialIcons name={icone} size={20} color={aceso ? Horizonte.action : Horizonte.textMuted} />
      <Text style={[styles.itemTexto, aceso && styles.itemTextoAtivo]}>{texto}</Text>
    </Pressable>
  );
}

export function BarraDeBaixoDoCoordenador() {
  const caminho = usePathname();
  const margens = useSafeAreaInsets();

  return (
    <View style={[styles.barra, { bottom: margens.bottom + 12 }]} role="navigation" aria-label="Menu da coordenação">
      {DESTINOS.map((d) => {
        const aceso = ativo(caminho, d.caminho);
        return (
          <Pressable
            key={d.caminho}
            style={({ pressed }) => [styles.botaoBarra, pressed && styles.pressionado]}
            onPress={() => router.navigate(d.caminho)}
            accessibilityRole="link"
            accessibilityLabel={d.texto}
            accessibilityState={{ selected: aceso }}
          >
            <MaterialIcons name={d.icone} size={24} color={aceso ? Horizonte.action : Horizonte.textMuted} />
            <Text style={[styles.legendaBarra, aceso && styles.itemTextoAtivo]}>{d.texto}</Text>
          </Pressable>
        );
      })}
      <Pressable style={({ pressed }) => [styles.botaoBarra, pressed && styles.pressionado]} onPress={sair} accessibilityRole="button" accessibilityLabel="Sair">
        <MaterialIcons name="logout" size={24} color={Horizonte.textMuted} />
        <Text style={styles.legendaBarra}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pressionado: { opacity: 0.75 },
  menu: {
    width: 232,
    paddingVertical: 20,
    paddingHorizontal: 12,
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: Horizonte.hairline,
    backgroundColor: Horizonte.surface,
  },
  marca: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 20 },
  marcaTexto: { flex: 1, fontFamily: FontesHorizonte.displayMedio, fontSize: 16, lineHeight: 21, color: Horizonte.text },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingHorizontal: 12, borderRadius: 10 },
  itemAtivo: { backgroundColor: Horizonte.fieldBg },
  itemTexto: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 15, color: Horizonte.textMuted },
  itemTextoAtivo: { color: Horizonte.text },
  rodape: { marginTop: 'auto', paddingTop: 12, borderTopWidth: 1, borderTopColor: Horizonte.hairline },
  usuario: { paddingHorizontal: 12, paddingBottom: 4, fontFamily: FontesHorizonte.corpo, fontSize: 13, color: Horizonte.textMuted },
  barra: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Horizonte.hairline,
    backgroundColor: Horizonte.surface,
  },
  botaoBarra: { minWidth: 72, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: 999 },
  legendaBarra: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 12, color: Horizonte.textMuted },
});
