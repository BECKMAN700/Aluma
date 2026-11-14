/**
 * Um tópico na tela da matéria do professor: nome, PDF, "Testar a Luma" e, em "Editar",
 * renomear, mudar a ordem e excluir. Quem garante que só o dono mexe é o servidor.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { EnviarPdf } from '@/components/enviar-pdf';
import { CriarPorNome } from '@/components/horizonte/criar-por-nome';
import { LinkTexto } from '@/components/horizonte/formulario';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { sair } from '@/services/auth';
import { excluirTopico, moverTopico, renomearTopico } from '@/services/materias';
import type { Topico } from '@/types/api';
import type { ResultadoApi } from '@/services/api';

export function TopicoDoProfessor({
  topico,
  primeiro,
  ultimo,
  comLinha,
  aoMudar,
}: {
  topico: Topico;
  primeiro: boolean;
  ultimo: boolean;
  comLinha: boolean;
  /** Recarrega a matéria depois de enviar PDF, renomear, mover ou excluir. */
  aoMudar: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const executar = async (acao: () => Promise<ResultadoApi<unknown>>) => {
    if (ocupado) return;
    setOcupado(true);
    setErro(null);
    try {
      const r = await acao();
      if (r.ok) aoMudar();
      else if (r.status === 401) await sair();
      else setErro(r.erro);
    } finally {
      setOcupado(false);
      setConfirmarExclusao(false);
    }
  };

  // Dois toques para excluir: na web e no celular, sem depender de caixa de diálogo do sistema.
  const excluir = () => (confirmarExclusao ? executar(() => excluirTopico(topico.id)) : setConfirmarExclusao(true));

  return (
    <View style={[styles.topico, comLinha && styles.comLinha]}>
      <Text style={styles.ordem}>{topico.ordem}</Text>
      <View style={styles.texto}>
        <Text style={styles.nome}>{topico.nome}</Text>
        <Text style={styles.material}>{topico.material ? `PDF: ${topico.material}` : 'Sem PDF'}</Text>
        <View style={styles.acoes}>
          <EnviarPdf topicoId={topico.id} nomeTopico={topico.nome} temMaterial={!!topico.material} aoEnviar={aoMudar} />
          <LinkTexto
            texto="Testar a Luma"
            rotulo={`Testar a Luma no tópico ${topico.nome}`}
            aoTocar={() => router.push({ pathname: '/chat', params: { topico: topico.id, nome: topico.nome } })}
          />
          <LinkTexto
            texto={editando ? 'Fechar edição' : 'Editar'}
            rotulo={`${editando ? 'Fechar a edição' : 'Editar'} do tópico ${topico.nome}`}
            aoTocar={() => {
              setEditando((e) => !e);
              setConfirmarExclusao(false);
              setErro(null);
            }}
          />
        </View>

        {editando && (
          <View style={styles.edicao}>
            <CriarPorNome
              rotulo="Novo nome do tópico"
              placeholder={topico.nome}
              textoBotao="Salvar nome"
              maxLength={80}
              criar={(nome) => renomearTopico(topico.id, nome)}
              aoCriar={aoMudar}
            />
            <View style={styles.acoes}>
              <Botao texto="Subir" desabilitado={primeiro || ocupado} aoTocar={() => executar(() => moverTopico(topico.id, 'cima'))} />
              <Botao texto="Descer" desabilitado={ultimo || ocupado} aoTocar={() => executar(() => moverTopico(topico.id, 'baixo'))} />
              <Botao
                texto={confirmarExclusao ? 'Toque de novo para excluir' : 'Excluir'}
                perigo
                desabilitado={ocupado}
                aoTocar={excluir}
              />
            </View>
            {!!erro && (
              <Text style={styles.erro} accessibilityRole="alert" accessibilityLiveRegion="polite">
                {erro}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function Botao({
  texto,
  desabilitado,
  perigo = false,
  aoTocar,
}: {
  texto: string;
  desabilitado: boolean;
  perigo?: boolean;
  aoTocar: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.botao, perigo && styles.botaoPerigo, (pressed || desabilitado) && styles.apagado]}
      onPress={aoTocar}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
    >
      <Text style={[styles.botaoTexto, perigo && styles.botaoTextoPerigo]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topico: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  comLinha: { borderBottomWidth: 1, borderBottomColor: Horizonte.hairline },
  ordem: { width: 24, fontFamily: FontesHorizonte.display, fontSize: 16, lineHeight: 22, color: Horizonte.action },
  texto: { flex: 1, minWidth: 0, gap: 6 },
  nome: { fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, color: Horizonte.text },
  material: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: Horizonte.textMuted },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  edicao: { gap: 10, paddingTop: 4 },
  apagado: { opacity: 0.5 },
  botao: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Horizonte.text,
    borderRadius: 22,
  },
  botaoPerigo: { borderColor: Horizonte.error },
  botaoTexto: { fontFamily: FontesHorizonte.displayMedio, fontSize: 14, lineHeight: 20, color: Horizonte.text },
  botaoTextoPerigo: { color: Horizonte.error },
  erro: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: Horizonte.error },
});
