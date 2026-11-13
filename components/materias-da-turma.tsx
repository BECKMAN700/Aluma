/**
 * Seção "Matérias" da tela da turma: a lista e o campo para criar. Criou, abre a matéria
 * para o professor já cadastrar os tópicos.
 */
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { CriarPorNome } from '@/components/horizonte/criar-por-nome';
import { AvisoCarregando, AvisoErro, LinkTexto } from '@/components/horizonte/formulario';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { criarMateria, listarMaterias } from '@/services/materias';

export function MateriasDaTurma({ turmaId }: { turmaId: string }) {
  const buscar = useCallback(() => listarMaterias(turmaId), [turmaId]);
  const [materias, tentarDeNovo] = useDadosDaTela(buscar);
  const criar = useCallback((nome: string) => criarMateria(turmaId, nome), [turmaId]);

  return (
    <View>
      <Text style={styles.titulo} accessibilityRole="header">
        Matérias{materias.estado === 'pronto' ? ` (${materias.dados.materias.length})` : ''}
      </Text>

      {materias.estado === 'carregando' && <AvisoCarregando texto="Carregando as matérias…" />}
      {materias.estado === 'erro' && (
        <>
          <AvisoErro mensagem={materias.erro} />
          <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={tentarDeNovo} />
        </>
      )}
      {materias.estado === 'pronto' &&
        materias.dados.materias.map((materia) => (
          <Link
            key={materia.id}
            href={{ pathname: '/materia/[id]', params: { id: materia.id, turma: turmaId } }}
            asChild
          >
            {/* Estilo fixo: com Link asChild, um estilo em função se perde na web. */}
            <Pressable style={styles.linha} accessibilityRole="link">
              <View style={styles.linhaTexto}>
                <Text style={styles.linhaNome}>{materia.nome}</Text>
                <Text style={styles.linhaDetalhe}>
                  {materia.topicos.length === 1 ? '1 tópico' : `${materia.topicos.length} tópicos`}
                </Text>
              </View>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 5l7 7-7 7"
                  stroke={Horizonte.textMuted}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
          </Link>
        ))}

      <CriarPorNome
        rotulo="Nova matéria"
        placeholder="Ex.: Matemática"
        textoBotao="Criar matéria"
        maxLength={60}
        criar={criar}
        aoCriar={(materia) =>
          router.push({ pathname: '/materia/[id]', params: { id: materia.id, turma: turmaId } })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: {
    marginTop: 24,
    marginBottom: 4,
    fontFamily: FontesHorizonte.display,
    fontSize: 18,
    lineHeight: 24,
    color: Horizonte.text,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: Horizonte.hairline,
  },
  linhaTexto: { flex: 1, minWidth: 0, gap: 2 },
  linhaNome: { fontFamily: FontesHorizonte.displayMedio, fontSize: 16, lineHeight: 22, color: Horizonte.text },
  linhaDetalhe: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: Horizonte.textMuted },
});
