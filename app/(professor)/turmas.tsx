/**
 * Início do professor (rota /turmas): as turmas dele e o caminho para criar uma nova.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { EstrelaNoHorizonte, Surgir } from '@/components/horizonte/ceu';
import {
  AvisoCarregando,
  AvisoErro,
  BotaoPrincipal,
  CabecalhoSair,
  LinkTexto,
  TelaFormulario,
  TituloTela,
} from '@/components/horizonte/formulario';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { useSessao } from '@/hooks/use-sessao';
import { sair } from '@/services/auth';
import { listarTurmas } from '@/services/turmas';

export default function TurmasScreen() {
  const router = useRouter();
  const { sessao } = useSessao();
  const nome = sessao.estado === 'pronto' ? sessao.usuario.nome : '';
  const [turmas, tentarDeNovo] = useDadosDaTela(listarTurmas);

  return (
    <TelaFormulario>
      <Surgir style={styles.camada}>
        <CabecalhoSair comMarca aoSair={sair} />
      </Surgir>

      <TituloTela titulo={nome ? `Olá, ${nome}!` : 'Olá!'} style={styles.textos} />

      <View style={styles.estrela}>
        <EstrelaNoHorizonte tamanho={32} />
      </View>

      <Surgir style={styles.camada}>
        <BotaoPrincipal texto="Criar turma" aoTocar={() => router.push('/nova-turma')} />

        <View style={styles.conteudo}>
          {turmas.estado === 'carregando' && <AvisoCarregando texto="Carregando suas turmas…" />}
          {turmas.estado === 'erro' && (
            <>
              <AvisoErro mensagem={turmas.erro} />
              <LinkTexto texto="Tentar de novo" rotulo="Tentar de novo" aoTocar={tentarDeNovo} />
            </>
          )}
          {turmas.estado === 'pronto' && turmas.dados.turmas.length === 0 && (
            <Text style={styles.vazio}>Você ainda não tem turma. Crie a primeira para receber um código.</Text>
          )}
          {turmas.estado === 'pronto' &&
            turmas.dados.turmas.map((turma) => (
              <Link key={turma.id} href={{ pathname: '/turma/[id]', params: { id: turma.id } }} asChild>
                {/* Estilo fixo: com Link asChild, um estilo em função se perde na web. */}
                <Pressable style={styles.linha} accessibilityRole="link">
                  <View style={styles.linhaTexto}>
                    <Text style={styles.linhaNome}>{turma.nome}</Text>
                    <Text style={styles.linhaDetalhe}>
                      {turma.serie} · código {turma.codigo}
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
        </View>
      </Surgir>
    </TelaFormulario>
  );
}

const styles = StyleSheet.create({
  camada: { zIndex: 1 },
  textos: { marginTop: 16 },
  estrela: { marginTop: 41, marginBottom: 22 },
  conteudo: { marginTop: 18 },
  vazio: {
    paddingVertical: 16,
    fontFamily: FontesHorizonte.corpo,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: Horizonte.textMuted,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 76,
    borderBottomWidth: 1,
    borderBottomColor: Horizonte.hairline,
  },
  linhaTexto: { flex: 1, minWidth: 0, gap: 2 },
  linhaNome: { fontFamily: FontesHorizonte.displayMedio, fontSize: 18, lineHeight: 24, color: Horizonte.text },
  linhaDetalhe: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: Horizonte.textMuted },
});
