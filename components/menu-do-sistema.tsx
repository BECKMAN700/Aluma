/**
 * Navegação "sistema" do coordenador e do professor (decisão de 15/11): no PC, menu lateral na
 * cor secundária da escola, com a logo e o nome do sistema; no celular, os mesmos destinos numa
 * barra flutuando embaixo, com o item aberto numa pílula clara.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, usePathname, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoDaEscola } from '@/components/logo-da-escola';
import { FontesHorizonte } from '@/constants/theme';
import { useSessao } from '@/hooks/use-sessao';
import { type Cores, useCores, useEstilos } from '@/hooks/use-tema';
import { sair } from '@/services/auth';
import { enderecoDaLogo } from '@/services/convites';

type Icone = React.ComponentProps<typeof MaterialIcons>['name'];

export type Destino = {
  texto: string;
  icone: Icone;
  caminho: Href;
  /** Prefixos de rota que acendem este item (a tela de uma turma acende "Turmas"). */
  acende: string[];
};

/** Altura que a barra de baixo ocupa: as telas deixam esse espaço livre no fim da rolagem. */
export const ESPACO_DA_BARRA = 104;

function aceso(caminho: string, destino: Destino): boolean {
  return destino.acende.some((p) => (p.endsWith('/') ? caminho.startsWith(p) : caminho === p));
}

export function MenuLateral({ destinos, extra }: { destinos: Destino[]; extra?: React.ReactNode }) {
  const caminho = usePathname();
  const { sessao } = useSessao();
  const cores = useCores();
  const styles = useEstilos(criarEstilos);
  const usuario = sessao.estado === 'pronto' ? sessao.usuario : null;
  const escola = usuario?.escola;

  return (
    <View style={styles.menu} role="navigation" aria-label="Menu">
      <View style={styles.marca}>
        {escola && (
          <LogoDaEscola
            endereco={escola.tem_logo ? enderecoDaLogo(escola.id) : null}
            formato={escola.logo_formato}
            cor={escola.cor}
            nome={escola.nome_do_sistema}
            tamanho={36}
            corSemFundo={cores.sobreMenu}
          />
        )}
        <Text style={styles.marcaTexto} numberOfLines={2}>
          {escola?.nome_do_sistema ?? 'Aluma'}
        </Text>
      </View>
      {destinos.map((d) => (
        <ItemDoMenu key={d.texto} destino={d} ativo={aceso(caminho, d)} />
      ))}
      {extra}
      <View style={styles.rodape}>
        {!!usuario && (
          <Text style={styles.usuario} numberOfLines={1}>
            {usuario.nome}
          </Text>
        )}
        <Pressable style={({ pressed }) => [styles.item, pressed && styles.pressionado]} onPress={sair} accessibilityRole="button">
          <MaterialIcons name="logout" size={20} color={cores.sobreMenu} style={styles.apagado} />
          <Text style={styles.itemTexto}>Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Item do menu lateral; também serve para listas extras, como as turmas do professor. */
export function ItemDoMenu({ destino, ativo }: { destino: Pick<Destino, 'texto' | 'icone' | 'caminho'>; ativo: boolean }) {
  const cores = useCores();
  const styles = useEstilos(criarEstilos);
  return (
    <Pressable
      style={({ pressed }) => [styles.item, ativo && styles.itemAtivo, pressed && styles.pressionado]}
      onPress={() => router.navigate(destino.caminho)}
      accessibilityRole="link"
      accessibilityState={{ selected: ativo }}
    >
      <MaterialIcons name={destino.icone} size={20} color={ativo ? cores.menu : cores.sobreMenu} style={!ativo && styles.apagado} />
      <Text style={[styles.itemTexto, ativo && styles.itemTextoAtivo]} numberOfLines={1}>
        {destino.texto}
      </Text>
    </Pressable>
  );
}

export function BarraDeBaixo({ destinos }: { destinos: Destino[] }) {
  const caminho = usePathname();
  const margens = useSafeAreaInsets();
  const cores = useCores();
  const styles = useEstilos(criarEstilos);
  const todos: (Destino | 'sair')[] = [...destinos, 'sair'];

  return (
    <View style={[styles.barra, { bottom: margens.bottom + 12 }]} role="navigation" aria-label="Menu">
      {todos.map((d) => {
        const ehSair = d === 'sair';
        const ligado = !ehSair && aceso(caminho, d);
        const texto = ehSair ? 'Sair' : d.texto;
        return (
          <Pressable
            key={texto}
            style={({ pressed }) => [styles.botaoBarra, ligado && styles.botaoBarraAtivo, pressed && styles.pressionado]}
            onPress={() => (ehSair ? sair() : router.navigate(d.caminho))}
            accessibilityRole={ehSair ? 'button' : 'link'}
            accessibilityLabel={texto}
            accessibilityState={{ selected: ligado }}
          >
            <MaterialIcons name={ehSair ? 'logout' : d.icone} size={22} color={ligado ? cores.menu : cores.sobreMenu} style={!ligado && styles.apagado} />
            <Text style={[styles.legendaBarra, ligado && styles.itemTextoAtivo]}>{texto}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Branco sobre a secundária: o item ativo inverte (fundo claro, texto na cor do menu).
const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    pressionado: { opacity: 0.75 },
    apagado: { opacity: 0.75 },
    menu: { width: 240, paddingVertical: 20, paddingHorizontal: 12, gap: 4, backgroundColor: cores.menu },
    marca: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 20 },
    marcaTexto: { flex: 1, fontFamily: FontesHorizonte.displayMedio, fontSize: 16, lineHeight: 21, color: cores.sobreMenu },
    item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingHorizontal: 12, borderRadius: 10 },
    itemAtivo: { backgroundColor: cores.sobreMenu },
    itemTexto: { flexShrink: 1, fontFamily: FontesHorizonte.corpoMedio, fontSize: 15, color: cores.sobreMenu },
    itemTextoAtivo: { color: cores.menu },
    rodape: { marginTop: 'auto', paddingTop: 12, borderTopWidth: 1, borderTopColor: cores.sobreMenu + '33' },
    usuario: { paddingHorizontal: 12, paddingBottom: 4, fontFamily: FontesHorizonte.corpo, fontSize: 13, color: cores.sobreMenu, opacity: 0.8 },
    barra: {
      position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', gap: 4,
      padding: 7, borderRadius: 999, backgroundColor: cores.menu, borderWidth: 1, borderColor: cores.sobreMenu + '33',
    },
    botaoBarra: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: 999 },
    botaoBarraAtivo: { flex: 1.3, flexDirection: 'row', gap: 8, backgroundColor: cores.sobreMenu },
    legendaBarra: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 12, color: cores.sobreMenu },
  });
