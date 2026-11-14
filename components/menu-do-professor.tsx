/**
 * Menu lateral do professor no PC: as turmas dele, criar turma e sair. No celular não aparece;
 * lá a navegação continua pelas telas.
 */
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useGlobalSearchParams, usePathname } from 'expo-router';

import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { useSessao } from '@/hooks/use-sessao';
import { sair } from '@/services/auth';
import { listarTurmas } from '@/services/turmas';
import type { Turma } from '@/types/api';

export const LARGURA_DO_MENU = 248;

export function MenuDoProfessor() {
  const caminho = usePathname();
  const { id, turma } = useGlobalSearchParams<{ id?: string; turma?: string }>();
  const { sessao } = useSessao();
  const [turmas, setTurmas] = useState<Turma[]>([]);

  // Busca de novo a cada troca de tela: quem cria uma turma já a vê no menu ao voltar.
  useEffect(() => {
    let valida = true;
    listarTurmas().then((r) => {
      if (valida && r.ok) setTurmas(r.dados.turmas);
    });
    return () => {
      valida = false;
    };
  }, [caminho]);

  // Turma aberta: /turma/[id] e /painel/[id] usam o id; a matéria leva a turma junto.
  const turmaAberta = caminho.startsWith('/materia/') ? turma : caminho.startsWith('/turmas') ? undefined : id;

  return (
    <View style={styles.menu} role="navigation" aria-label="Menu do professor">
      <View style={styles.marca}>
        <Image source={require('../assets/images/aluma_logo.jpg')} style={styles.logo} accessibilityLabel="Logo do Aluma" />
        <Text style={styles.marcaTexto}>Aluma</Text>
      </View>

      <Item texto="Início" ativo={caminho === '/turmas'} aoTocar={() => router.navigate('/turmas')} />

      <Text style={styles.secao}>Suas turmas</Text>
      {turmas.map((t) => (
        <Item
          key={t.id}
          texto={t.nome}
          detalhe={t.serie}
          ativo={t.id === turmaAberta}
          aoTocar={() => router.navigate({ pathname: '/turma/[id]', params: { id: t.id } })}
        />
      ))}
      <Item texto="+ Criar turma" ativo={caminho === '/nova-turma'} aoTocar={() => router.navigate('/nova-turma')} />

      <View style={styles.rodape}>
        {sessao.estado === 'pronto' && (
          <Text style={styles.usuario} numberOfLines={1}>
            {sessao.usuario.nome}
          </Text>
        )}
        <Item texto="Sair" ativo={false} aoTocar={sair} />
      </View>
    </View>
  );
}

function Item({
  texto,
  detalhe,
  ativo,
  aoTocar,
}: {
  texto: string;
  detalhe?: string;
  ativo: boolean;
  aoTocar: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, ativo && styles.itemAtivo, pressed && styles.pressionado]}
      onPress={aoTocar}
      accessibilityRole="link"
      accessibilityState={{ selected: ativo }}
    >
      {/* Barra dourada à esquerda: o item ativo se lê sem depender só da cor do fundo. */}
      <View style={[styles.marcador, ativo && styles.marcadorAtivo]} />
      <View style={styles.itemTexto}>
        <Text style={[styles.itemNome, ativo && styles.itemNomeAtivo]} numberOfLines={1}>
          {texto}
        </Text>
        {!!detalhe && (
          <Text style={styles.itemDetalhe} numberOfLines={1}>
            {detalhe}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menu: {
    width: LARGURA_DO_MENU,
    paddingVertical: 20,
    paddingHorizontal: 12,
    gap: 2,
    borderRightWidth: 1,
    borderRightColor: Horizonte.hairline,
    backgroundColor: Horizonte.surface,
  },
  marca: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 20 },
  logo: { width: 36, height: 36, borderRadius: 18 },
  marcaTexto: { fontFamily: FontesHorizonte.display, fontSize: 19, color: Horizonte.text },
  secao: {
    marginTop: 18,
    marginBottom: 4,
    paddingHorizontal: 12,
    fontFamily: FontesHorizonte.corpoForte,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Horizonte.textMuted,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingRight: 10, borderRadius: 10 },
  itemAtivo: { backgroundColor: Horizonte.fieldBg },
  pressionado: { opacity: 0.85 },
  marcador: { width: 3, alignSelf: 'stretch', marginVertical: 8, borderRadius: 2 },
  marcadorAtivo: { backgroundColor: Horizonte.action },
  itemTexto: { flex: 1, minWidth: 0, paddingVertical: 6 },
  itemNome: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 15, lineHeight: 20, color: Horizonte.textMuted },
  itemNomeAtivo: { color: Horizonte.text },
  itemDetalhe: { fontFamily: FontesHorizonte.corpo, fontSize: 12, lineHeight: 16, color: Horizonte.textMuted },
  rodape: { marginTop: 'auto', paddingTop: 12, borderTopWidth: 1, borderTopColor: Horizonte.hairline },
  usuario: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 13,
    lineHeight: 18,
    color: Horizonte.textMuted,
  },
});
