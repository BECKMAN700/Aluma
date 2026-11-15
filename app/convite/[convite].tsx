/**
 * Link de convite da escola (rota /convite/[convite]), opção B escolhida em 15/11: dois passos.
 * 1. Sem login: a cara da escola e "Criar conta" ou "Já tenho conta" (o convite fica guardado).
 * 2. Logado sem escola: matrícula e data de nascimento; o servidor confere com o pré-cadastro.
 */
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { AvisoCarregando, AvisoErro, CampoTexto, LinkTexto, TelaFormulario } from '@/components/horizonte/formulario';
import { LogoDaEscola } from '@/components/logo-da-escola';
import { textoSobre } from '@/constants/marca';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { useSessao } from '@/hooks/use-sessao';
import { sair } from '@/services/auth';
import {
  buscarConvite,
  enderecoDaLogo,
  entrarPeloConvite,
  esquecerConvitePendente,
  guardarConvitePendente,
} from '@/services/convites';
import type { EscolaDoConvite } from '@/types/api';

export default function ConviteScreen() {
  const { convite } = useLocalSearchParams<{ convite: string }>();
  const { sessao } = useSessao();
  const buscar = useCallback(() => buscarConvite(convite), [convite]);
  const [escola] = useDadosDaTela(buscar);
  const logado = sessao.estado === 'pronto';

  return (
    <TelaFormulario>
      {escola.estado === 'carregando' && <AvisoCarregando texto="Abrindo o convite…" />}
      {escola.estado === 'erro' && (
        <View style={styles.passo}>
          <AvisoErro mensagem="Este convite não existe ou mudou. Peça o link de novo à sua escola." />
          {logado && <LinkTexto texto="Sair" rotulo="Sair" aoTocar={sair} />}
        </View>
      )}
      {escola.estado === 'pronto' && (
        <>
          <Pontos passo={logado ? 2 : 1} cor={escola.dados.cor} />
          {logado ? <Confirmar convite={convite} escola={escola.dados} /> : <Boasvindas convite={convite} escola={escola.dados} />}
        </>
      )}
    </TelaFormulario>
  );
}

function Pontos({ passo, cor }: { passo: number; cor: string }) {
  return (
    <View style={styles.pontos}>
      {[1, 2].map((p) => (
        <View key={p} style={[styles.ponto, p === passo && { width: 28, backgroundColor: cor }]} />
      ))}
      <Text style={styles.passoTexto}>Passo {passo} de 2</Text>
    </View>
  );
}

function Logo({ escola, tamanho }: { escola: EscolaDoConvite; tamanho: number }) {
  return (
    <LogoDaEscola
      endereco={escola.tem_logo ? enderecoDaLogo(escola.id) : null}
      formato={escola.logo_formato}
      cor={escola.cor}
      nome={escola.nome_do_sistema}
      tamanho={tamanho}
      corSemFundo={Horizonte.text}
    />
  );
}

function Boasvindas({ convite, escola }: { convite: string; escola: EscolaDoConvite }) {
  const ir = async (caminho: '/criar-conta' | '/entrar') => {
    await guardarConvitePendente(convite);
    router.push(caminho);
  };
  return (
    <View style={styles.passo}>
      <View style={styles.centro}>
        <Logo escola={escola} tamanho={112} />
        <Text style={styles.escola}>{escola.nome}</Text>
        <Text style={styles.titulo} accessibilityRole="header">
          Você foi convidado para o {escola.nome_do_sistema}
        </Text>
        <Text style={styles.apoio}>Crie a sua conta ou entre com a que você já tem. Pode ser o e-mail da escola ou o seu.</Text>
      </View>
      <View style={styles.botoes}>
        <BotaoDaEscola texto="Criar conta" cor={escola.cor} aoTocar={() => ir('/criar-conta')} />
        <Pressable style={({ pressed }) => [styles.secundario, pressed && styles.pressionado]} onPress={() => ir('/entrar')} accessibilityRole="button">
          <Text style={styles.secundarioTexto}>Já tenho conta</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** "DD/MM/AAAA" → "AAAA-MM-DD", ou null se não for uma data de verdade. */
function dataDoServidor(texto: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!m) return null;
  const [, dia, mes, ano] = m;
  const data = new Date(`${ano}-${mes}-${dia}T00:00:00`);
  return !isNaN(data.getTime()) && data.getDate() === Number(dia) ? `${ano}-${mes}-${dia}` : null;
}

function Confirmar({ convite, escola }: { convite: string; escola: EscolaDoConvite }) {
  const { recarregar } = useSessao();
  const [matricula, setMatricula] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (enviando) return;
    const data = dataDoServidor(nascimento);
    if (!matricula.trim()) return setErro('Digite a sua matrícula.');
    if (!data) return setErro('Escreva a data de nascimento como 10/04/2012.');
    setErro(null);
    setEnviando(true);
    const r = await entrarPeloConvite(convite, matricula.trim(), data);
    setEnviando(false);
    if (!r.ok) return setErro(r.status === 404 ? 'Não encontramos um aluno com esses dados nesta escola. Confira com a secretaria.' : r.erro);
    await esquecerConvitePendente();
    await recarregar(); // o /api/me agora tem a turma, e o layout leva o aluno para o início
  };

  return (
    <View style={styles.passo}>
      <View style={styles.cabecalho}>
        <Logo escola={escola} tamanho={44} />
        <Text style={styles.escola}>{escola.nome}</Text>
      </View>
      <Text style={[styles.titulo, styles.esquerda]} accessibilityRole="header">Confirme que é você</Text>
      <Text style={[styles.apoio, styles.esquerda]}>Use os dados que a escola cadastrou. Eles só servem para achar você na sua turma.</Text>
      {!!erro && <AvisoErro mensagem={erro} />}
      <CampoTexto rotulo="Matrícula" placeholder="2026002" value={matricula} onChangeText={setMatricula} maxLength={30} editable={!enviando} />
      <CampoTexto
        rotulo="Data de nascimento"
        placeholder="10/04/2012"
        value={nascimento}
        onChangeText={setNascimento}
        maxLength={10}
        keyboardType="numbers-and-punctuation"
        onSubmitEditing={enviar}
        editable={!enviando}
      />
      <View style={styles.botoes}>
        <BotaoDaEscola texto={enviando ? 'Entrando…' : 'Entrar na turma'} cor={escola.cor} ocupado={enviando} aoTocar={enviar} />
        <LinkTexto texto="Sair desta conta" rotulo="Sair desta conta" aoTocar={sair} />
      </View>
    </View>
  );
}

function BotaoDaEscola({ texto, cor, ocupado = false, aoTocar }: { texto: string; cor: string; ocupado?: boolean; aoTocar: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.principal, { backgroundColor: cor }, (pressed || ocupado) && styles.pressionado]}
      onPress={aoTocar}
      disabled={ocupado}
      accessibilityRole="button"
      accessibilityState={{ disabled: ocupado, busy: ocupado }}
    >
      <Text style={[styles.principalTexto, { color: textoSobre(cor) }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pontos: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  ponto: { width: 10, height: 10, borderRadius: 999, backgroundColor: Horizonte.hairline },
  passoTexto: { marginLeft: 'auto', fontFamily: FontesHorizonte.corpo, fontSize: 13, color: Horizonte.textMuted },
  passo: { flex: 1, gap: 16, paddingTop: 28 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 24 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  escola: { fontFamily: FontesHorizonte.corpo, fontSize: 14, color: Horizonte.textMuted },
  titulo: { fontFamily: FontesHorizonte.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.4, color: Horizonte.text, textAlign: 'center' },
  apoio: { fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, color: Horizonte.textMuted, textAlign: 'center' },
  esquerda: { textAlign: 'left' },
  botoes: { gap: 10, marginTop: 8 },
  principal: { minHeight: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  principalTexto: { fontFamily: FontesHorizonte.display, fontSize: 17 },
  secundario: {
    minHeight: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Horizonte.fieldBorder,
  },
  secundarioTexto: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 16, color: Horizonte.text },
  pressionado: { opacity: 0.85 },
});
