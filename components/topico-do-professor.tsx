/**
 * Tópicos na tela da matéria do professor (opção B do canvas, 15/11): a trilha numerada, como o aluno
 * vê, e o painel do tópico escolhido com PDF, "Testar a IA", renomear, mudar a ordem e excluir.
 * Quem garante que só o dono mexe é o servidor.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { EnviarPdf } from '@/components/enviar-pdf';
import { CriarPorNome } from '@/components/horizonte/criar-por-nome';
import { BotaoPrincipal, LinkTexto } from '@/components/horizonte/formulario';
import { FontesHorizonte } from '@/constants/theme';
import { sair } from '@/services/auth';
import { excluirTopico, moverTopico, renomearTopico } from '@/services/materias';
import type { Topico } from '@/types/api';
import type { ResultadoApi } from '@/services/api';
import { type Cores, useEstilos } from '@/hooks/use-tema';
import { useSessao } from '@/hooks/use-sessao';

function useNomeDaIa() {
  const { sessao } = useSessao();
  return (sessao.estado === 'pronto' && sessao.usuario.escola?.nome_da_ia) || 'IA';
}

/** Um ponto da trilha: número ligado ao próximo e o cartão do tópico, que se escolhe com um toque. */
export function ItemDaTrilha({
  topico,
  escolhido,
  ultimo,
  aoEscolher,
  children,
}: {
  topico: Topico;
  escolhido: boolean;
  ultimo: boolean;
  aoEscolher: () => void;
  /** No celular, o painel abre aqui, embaixo do tópico escolhido. */
  children?: React.ReactNode;
}) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.item}>
      <View style={styles.trilho}>
        <View style={[styles.numero, escolhido && styles.numeroEscolhido]}>
          <Text style={[styles.numeroTexto, escolhido && styles.numeroTextoEscolhido]}>{topico.ordem}</Text>
        </View>
        {!ultimo && <View style={styles.linha} />}
      </View>
      <View style={styles.itemConteudo}>
        <Pressable
          style={({ pressed }) => [styles.cartao, escolhido && styles.cartaoEscolhido, pressed && styles.pressionado]}
          onPress={aoEscolher}
          accessibilityRole="button"
          accessibilityState={{ selected: escolhido }}
          accessibilityLabel={`Tópico ${topico.ordem}: ${topico.nome}`}
        >
          <Text style={styles.cartaoNome}>{topico.nome}</Text>
          <Text style={styles.cartaoMaterial}>{topico.material ? 'PDF enviado' : 'Sem PDF'}</Text>
        </Pressable>
        {children}
      </View>
    </View>
  );
}

export function PainelDoTopico({
  topico,
  total,
  aoMudar,
}: {
  topico: Topico;
  total: number;
  /** Recarrega a matéria depois de enviar PDF, renomear, mover ou excluir. */
  aoMudar: () => void;
}) {
  const styles = useEstilos(criarEstilos);
  const ia = useNomeDaIa();
  const [renomeando, setRenomeando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const primeiro = topico.ordem <= 1;
  const ultimo = topico.ordem >= total;

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
    <View style={styles.painel}>
      <View style={styles.bloco}>
        <Text style={styles.rotulo}>
          Tópico {topico.ordem} de {total}
        </Text>
        <View style={styles.tituloLinha}>
          <Text style={styles.titulo} accessibilityRole="header">
            {topico.nome}
          </Text>
          <LinkTexto
            texto={renomeando ? 'Cancelar' : 'Renomear'}
            rotulo={renomeando ? 'Cancelar a troca de nome' : `Renomear o tópico ${topico.nome}`}
            aoTocar={() => setRenomeando((r) => !r)}
          />
        </View>
        {renomeando && (
          <CriarPorNome
            rotulo="Novo nome do tópico"
            placeholder={topico.nome}
            textoBotao="Salvar nome"
            maxLength={80}
            criar={(nome) => renomearTopico(topico.id, nome)}
            aoCriar={() => {
              setRenomeando(false);
              aoMudar();
            }}
          />
        )}
      </View>

      <View style={styles.bloco}>
        <Text style={styles.subtitulo}>Material da {ia}</Text>
        <View style={styles.arquivo}>
          <View style={styles.arquivoIcone}>
            <Text style={styles.arquivoIconeTexto}>PDF</Text>
          </View>
          <View style={styles.arquivoTexto}>
            <Text style={styles.arquivoNome}>{topico.material ?? 'Nenhum PDF ainda'}</Text>
            <Text style={styles.ajuda}>
              {topico.material
                ? `A ${ia} só usa este arquivo nas conversas deste tópico.`
                : `Envie o PDF da aula para a ${ia} ter o conteúdo deste tópico.`}
            </Text>
          </View>
          <EnviarPdf topicoId={topico.id} nomeTopico={topico.nome} temMaterial={!!topico.material} aoEnviar={aoMudar} />
        </View>
      </View>

      <View style={styles.bloco}>
        <Text style={styles.subtitulo}>Ver como o aluno vê</Text>
        <BotaoPrincipal
          texto={`Testar a ${ia}`}
          rotulo={`Testar a ${ia} no tópico ${topico.nome}`}
          compacto
          aoTocar={() => router.push({ pathname: '/chat', params: { topico: topico.id, nome: topico.nome } })}
        />
        <Text style={styles.ajuda}>Converse como se fosse um aluno. Nada desta conversa é gravado.</Text>
      </View>

      <View style={[styles.bloco, styles.blocoComLinha]}>
        <Text style={styles.subtitulo}>Ordem na trilha</Text>
        <View style={styles.acoes}>
          <Botao texto="Subir" desabilitado={primeiro || ocupado} aoTocar={() => executar(() => moverTopico(topico.id, 'cima'))} />
          <Botao texto="Descer" desabilitado={ultimo || ocupado} aoTocar={() => executar(() => moverTopico(topico.id, 'baixo'))} />
          <View style={styles.empurra} />
          <Botao
            texto={confirmarExclusao ? 'Toque de novo para excluir' : 'Excluir tópico'}
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
  const styles = useEstilos(criarEstilos);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.botao,
        perigo && styles.botaoPerigo,
        (pressed || desabilitado) && styles.apagado,
      ]}
      onPress={aoTocar}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
    >
      <Text style={[styles.botaoTexto, perigo && styles.botaoTextoPerigo]}>{texto}</Text>
    </Pressable>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    pressionado: { opacity: 0.85 },
    apagado: { opacity: 0.5 },

    item: { flexDirection: 'row', gap: 14 },
    trilho: { width: 36, alignItems: 'center' },
    numero: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      // 8 dígitos: a cor da escola com 12% de opacidade.
      backgroundColor: `${cores.action}1F`,
    },
    numeroEscolhido: { backgroundColor: cores.action },
    numeroTexto: { fontFamily: FontesHorizonte.display, fontSize: 15, lineHeight: 20, color: cores.action },
    numeroTextoEscolhido: { color: cores.onAction },
    linha: { flex: 1, width: 2, minHeight: 20, backgroundColor: cores.hairline },
    itemConteudo: { flex: 1, minWidth: 0, paddingBottom: 12, gap: 12 },
    cartao: {
      minHeight: 44,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: cores.hairline,
      borderRadius: 14,
      backgroundColor: cores.surface,
      gap: 4,
    },
    // Borda de 2px com 1px a menos de respiro: o cartão não muda de tamanho ao ser escolhido.
    cartaoEscolhido: { borderWidth: 2, borderColor: cores.action, paddingVertical: 13, paddingHorizontal: 15 },
    cartaoNome: { fontFamily: FontesHorizonte.corpoForte, fontSize: 16, lineHeight: 22, color: cores.text },
    cartaoMaterial: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: cores.textMuted },

    painel: {
      padding: 20,
      borderWidth: 1,
      borderColor: cores.hairline,
      borderRadius: 18,
      backgroundColor: cores.surface,
      gap: 24,
    },
    bloco: { gap: 10 },
    blocoComLinha: { paddingTop: 20, borderTopWidth: 1, borderTopColor: cores.hairline },
    rotulo: { fontFamily: FontesHorizonte.corpoForte, fontSize: 14, lineHeight: 20, color: cores.textMuted },
    tituloLinha: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    titulo: { flexShrink: 1, fontFamily: FontesHorizonte.display, fontSize: 26, lineHeight: 34, color: cores.text },
    subtitulo: { fontFamily: FontesHorizonte.corpoForte, fontSize: 15, lineHeight: 22, color: cores.text },
    ajuda: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: cores.textMuted },

    arquivo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 14,
      padding: 14,
      borderRadius: 12,
      backgroundColor: cores.bg,
    },
    arquivoIcone: {
      width: 40,
      height: 48,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: cores.hairline,
      backgroundColor: cores.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arquivoIconeTexto: { fontFamily: FontesHorizonte.corpoForte, fontSize: 11, lineHeight: 14, color: cores.error },
    arquivoTexto: { flexGrow: 1, flexShrink: 1, flexBasis: 180, minWidth: 0, gap: 2 },
    arquivoNome: { fontFamily: FontesHorizonte.corpoForte, fontSize: 15, lineHeight: 22, color: cores.text },

    acoes: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
    empurra: { flexGrow: 1 },
    botao: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: 16,
      borderWidth: 1.5,
      borderColor: cores.fieldBorder,
      borderRadius: 22,
    },
    botaoPerigo: { borderColor: 'transparent' },
    botaoTexto: { fontFamily: FontesHorizonte.displayMedio, fontSize: 14, lineHeight: 20, color: cores.text },
    botaoTextoPerigo: { color: cores.error },
    erro: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: cores.error },
  });
