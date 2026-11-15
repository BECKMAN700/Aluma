/**
 * Início do aluno (rota /home), "chat limpo" aprovado em 15/11: a logo da escola, a saudação e
 * a caixa para falar com a IA. Enviar abre o chat já com a pergunta; o + escolhe a foto da questão
 * e abre o chat com ela no campo, para o aluno conferir e enviar.
 */
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { CascaDoAluno } from '@/components/casca-do-aluno';
import { AvisoErro, SEM_CONTORNO_WEB } from '@/components/horizonte/formulario';
import { LogoDaEscola } from '@/components/logo-da-escola';
import { BotaoFoto, erroDaFoto, MenuDaFoto, type OrigemDaFoto } from '@/components/menu-da-foto';
import { FontesHorizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { useSessao } from '@/hooks/use-sessao';
import { type Cores, useCores, useEstilos } from '@/hooks/use-tema';
import type { ResultadoApi } from '@/services/api';
import { enderecoDaLogo } from '@/services/convites';
import { escolherFoto, guardarPartida } from '@/services/foto';
import { listarMaterias } from '@/services/materias';
import type { ListaDeMaterias, Topico } from '@/types/api';

export default function HomeScreen() {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();
  const { sessao } = useSessao();
  const usuario = sessao.estado === 'pronto' ? sessao.usuario : null;
  const escola = usuario?.escola;
  const ia = escola?.nome_da_ia ?? 'Luma';
  const [texto, setTexto] = useState('');
  const [menuFoto, setMenuFoto] = useState(false);
  const [preparandoFoto, setPreparandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);

  // O tópico em andamento em que o aluno mexeu por último: um toque e ele volta a estudar.
  const turmaId = usuario?.turma?.id;
  const buscar = useCallback(
    (): Promise<ResultadoApi<ListaDeMaterias>> =>
      turmaId ? listarMaterias(turmaId) : Promise.resolve({ ok: true, dados: { materias: [] } }),
    [turmaId],
  );
  const [materias] = useDadosDaTela(buscar);
  const continuar = materias.estado === 'pronto' ? ultimoEmAndamento(materias.dados) : undefined;

  const enviar = () => {
    if (!texto.trim()) return;
    router.push({ pathname: '/chat', params: { mensagem: texto.trim() } });
    setTexto('');
  };

  const pegarFoto = async (origem: OrigemDaFoto) => {
    setMenuFoto(false);
    setErroFoto(null);
    setPreparandoFoto(true);
    try {
      const foto = await escolherFoto(origem);
      if (!foto) return;
      guardarPartida({ foto, texto: texto.trim() });
      setTexto('');
      router.push('/chat');
    } catch (e) {
      setErroFoto(erroDaFoto(e));
    } finally {
      setPreparandoFoto(false);
    }
  };

  return (
    <CascaDoAluno>
      <View style={styles.centro}>
        {escola && (
          <LogoDaEscola
            endereco={escola.tem_logo ? enderecoDaLogo(escola.id) : null}
            formato={escola.logo_formato}
            cor={escola.cor}
            nome={escola.nome_do_sistema}
            tamanho={72}
            corSemFundo={cores.text}
          />
        )}
        <Text style={styles.ola} accessibilityRole="header">
          {usuario?.nome ? `Olá, ${usuario.nome.split(' ')[0]}` : 'Olá'}
        </Text>
        <Text style={styles.pergunta}>Qual dúvida você quer pensar comigo hoje?</Text>

        <View style={styles.campo}>
          <BotaoFoto
            aberto={menuFoto}
            desabilitado={preparandoFoto}
            ocupado={preparandoFoto}
            aoTocar={() => setMenuFoto((aberto) => !aberto)}
          />
          <TextInput
            style={[styles.input, Platform.OS === 'web' && SEM_CONTORNO_WEB]}
            placeholder={`Fale com a ${ia}`}
            placeholderTextColor={cores.textMuted}
            accessibilityLabel={`Fale com a ${ia}`}
            value={texto}
            onChangeText={setTexto}
            onSubmitEditing={enviar}
            returnKeyType="send"
            maxLength={2000}
          />
          <Pressable style={({ pressed }) => [styles.enviar, pressed && styles.pressionado]} onPress={enviar} accessibilityRole="button" accessibilityLabel="Enviar">
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M5 12h13M13 6l6 6-6 6" stroke={cores.onAction} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>
        {menuFoto && <MenuDaFoto aoEscolher={pegarFoto} />}
        {erroFoto && <AvisoErro mensagem={erroFoto} />}

        <View style={styles.atalhos}>
          {!!continuar && (
            <Atalho
              texto={`Continuar: ${continuar.nome}`}
              aoTocar={() => router.push({ pathname: '/chat', params: { topico: continuar.id, nome: continuar.nome } })}
            />
          )}
          <Atalho texto="Ver minha trilha" aoTocar={() => router.push('/trilha')} />
        </View>
      </View>
    </CascaDoAluno>
  );
}

function Atalho({ texto, aoTocar }: { texto: string; aoTocar: () => void }) {
  const styles = useEstilos(criarEstilos);
  return (
    <Pressable style={({ pressed }) => [styles.atalho, pressed && styles.pressionado]} onPress={aoTocar} accessibilityRole="button">
      <Text style={styles.atalhoTexto}>{texto}</Text>
    </Pressable>
  );
}

function ultimoEmAndamento(dados: ListaDeMaterias): Topico | undefined {
  return dados.materias
    .flatMap((m) => m.topicos)
    .filter((t) => t.status === 'em_andamento' && t.atividade_em)
    .sort((a, b) => (b.atividade_em ?? '').localeCompare(a.atividade_em ?? ''))[0];
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    pressionado: { opacity: 0.85 },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20 },
    ola: { fontFamily: FontesHorizonte.display, fontSize: 30, lineHeight: 36, color: cores.text, textAlign: 'center' },
    pergunta: { fontFamily: FontesHorizonte.corpo, fontSize: 16, lineHeight: 23, color: cores.textMuted, textAlign: 'center' },
    campo: {
      flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', maxWidth: 640, minHeight: 58, marginTop: 10,
      paddingLeft: 7, paddingRight: 7, borderRadius: 999, borderWidth: 1, borderColor: cores.fieldBorder, backgroundColor: cores.fieldBg,
    },
    input: { flex: 1, minHeight: 44, paddingHorizontal: 6, color: cores.text, fontFamily: FontesHorizonte.corpo, fontSize: 16 },
    enviar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.action },
    atalhos: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
    atalho: {
      minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 999,
      borderWidth: 1, borderColor: cores.hairline, backgroundColor: cores.surface,
    },
    atalhoTexto: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 14, color: cores.text },
  });
