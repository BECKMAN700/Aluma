/**
 * Marca da escola (rota /coordenacao/marca), opção A escolhida em 15/11: página única com a
 * prévia do celular do aluno mudando na hora. Nada muda para os outros até "Salvar marca".
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import { Cartao, Pilula, TelaSistema, estilosSistema } from '@/components/sistema';
import { AvisoCarregando, AvisoErro, AvisoInfo, CampoTexto } from '@/components/horizonte/formulario';
import { LogoDaEscola } from '@/components/logo-da-escola';
import {
  type FormatoDaLogo,
  PALETA_PRINCIPAL,
  ehClara,
  secundarias,
  textoSobre,
  tons,
} from '@/constants/marca';
import { FontesHorizonte } from '@/constants/theme';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { useSessao } from '@/hooks/use-sessao';
import { buscarEscola, enviarLogo, salvarMarca } from '@/services/coordenacao';
import { enderecoDaLogo } from '@/services/convites';
import type { EscolaDoCoordenador } from '@/types/api';
import { type Cores, useCores, useEstilos } from '@/hooks/use-tema';

const FORMATOS: { valor: FormatoDaLogo; nome: string }[] = [
  { valor: 'redondo', nome: 'Redonda' },
  { valor: 'quadrado', nome: 'Quadrada' },
  { valor: 'livre', nome: 'Sem fundo' },
];

export default function MarcaScreen() {
  const [escola, tentarDeNovo] = useDadosDaTela(buscarEscola);
  return (
    <TelaSistema titulo="Marca da escola">
      {escola.estado === 'carregando' && <AvisoCarregando texto="Carregando a marca…" />}
      {escola.estado === 'erro' && (
        <>
          <AvisoErro mensagem={escola.erro} />
          <Pilula texto="Tentar de novo" aoTocar={tentarDeNovo} />
        </>
      )}
      {escola.estado === 'pronto' && <Editor inicial={escola.dados} />}
    </TelaSistema>
  );
}

function Editor({ inicial }: { inicial: EscolaDoCoordenador }) {
  const cores = useCores();
  const styles = useEstilos(criarEstilos);
  const { recarregar } = useSessao();
  const [sistema, setSistema] = useState(inicial.nome_do_sistema);
  const [ia, setIa] = useState(inicial.nome_da_ia);
  const [formato, setFormato] = useState<FormatoDaLogo>(inicial.logo_formato);
  // Escola que ainda está com a marca do Aluma: começa sugerindo a primeira cor da paleta.
  const naPaleta = PALETA_PRINCIPAL.some((p) => p.cor === inicial.cor);
  const [cor, setCor] = useState(naPaleta ? inicial.cor : PALETA_PRINCIPAL[0].cor);
  const opcoes = secundarias(cor);
  const [secundaria, setSecundaria] = useState(inicial.cor_secundaria);
  const sec = opcoes.some((o) => o.cor === secundaria) ? secundaria : opcoes[0].cor;
  const [versaoLogo, setVersaoLogo] = useState(inicial.tem_logo ? 1 : 0);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<{ erro: boolean; texto: string } | null>(null);

  const endereco = versaoLogo ? enderecoDaLogo(inicial.id, versaoLogo) : null;

  const escolherLogo = async () => {
    const escolha = await DocumentPicker.getDocumentAsync({ type: ['image/png', 'image/jpeg'], copyToCacheDirectory: true });
    if (escolha.canceled) return;
    const arquivo = escolha.assets[0];
    if ((arquivo.size ?? 0) > 5 * 1024 * 1024) return setAviso({ erro: true, texto: 'A logo deve ter no máximo 5 MB.' });
    setEnviandoLogo(true);
    const r = await enviarLogo(arquivo.uri, arquivo.mimeType ?? 'image/png');
    setEnviandoLogo(false);
    if (!r.ok) return setAviso({ erro: true, texto: r.erro });
    setVersaoLogo((v) => v + 1);
    setAviso({ erro: false, texto: 'Logo enviada.' });
  };

  const salvar = async () => {
    setAviso(null);
    if (!sistema.trim() || !ia.trim()) return setAviso({ erro: true, texto: 'Preencha o nome do sistema e o nome da IA.' });
    setSalvando(true);
    const r = await salvarMarca({ nome_do_sistema: sistema.trim(), nome_da_ia: ia.trim(), cor, cor_secundaria: sec, logo_formato: formato });
    setSalvando(false);
    if (!r.ok) return setAviso({ erro: true, texto: r.erro });
    setAviso({ erro: false, texto: 'Marca salva. Alunos e professores já veem a nova cara da escola.' });
    recarregar();
  };

  const t = tons(cor);
  return (
    <View style={styles.linha}>
      <View style={styles.editor}>
        <Cartao titulo="Nomes">
          <View style={estilosSistema.formulario}>
            <CampoTexto rotulo="Nome do sistema" value={sistema} onChangeText={setSistema} maxLength={30} autoCapitalize="words" />
            <CampoTexto rotulo="Nome da IA" value={ia} onChangeText={setIa} maxLength={30} autoCapitalize="words" />
          </View>
        </Cartao>

        <Cartao titulo="Logo">
          <View style={styles.logoLinha}>
            <View style={formato === 'livre' && styles.molduraSemFundo}>
              <LogoDaEscola endereco={endereco} formato={formato} cor={cor} nome={sistema || 'Escola'} tamanho={72} corSemFundo={cores.text} />
            </View>
            <Pilula texto={enviandoLogo ? 'Enviando…' : 'Enviar imagem (PNG ou JPG, até 5 MB)'} ocupado={enviandoLogo} aoTocar={escolherLogo} />
          </View>
          <Text style={styles.rotulo}>Formato da logo</Text>
          <View style={estilosSistema.acoes}>
            {FORMATOS.map((f) => (
              <Pilula key={f.valor} texto={f.nome} destaque={formato === f.valor} aoTocar={() => setFormato(f.valor)} />
            ))}
          </View>
          <Text style={styles.ajuda}>Sem fundo: para logo em PNG com fundo transparente, que aparece solta sobre a cor da barra.</Text>
        </Cartao>

        <Cartao titulo="Cor principal">
          <View style={styles.paleta}>
            {PALETA_PRINCIPAL.map((p) => (
              <Pressable
                key={p.cor}
                onPress={() => setCor(p.cor)}
                style={[styles.amostra, { backgroundColor: p.cor }, cor === p.cor && styles.amostraEscolhida]}
                accessibilityRole="radio"
                accessibilityLabel={p.nome}
                accessibilityState={{ checked: cor === p.cor }}
              />
            ))}
          </View>
          <Text style={styles.ajuda}>{PALETA_PRINCIPAL.find((p) => p.cor === cor)?.nome} · tons gerados a partir dela</Text>
          <View style={styles.tons}>
            {[['Escura', t.escura], ['Principal', cor], ['Clara', t.clara]].map(([nome, valor]) => (
              <View key={nome} style={[styles.tom, { backgroundColor: valor }]}>
                <Text style={[styles.tomTexto, { color: textoSobre(valor) }]}>{nome}</Text>
              </View>
            ))}
          </View>
        </Cartao>

        <Cartao titulo="Cor secundária">
          <Text style={styles.ajuda}>Os básicos e três cores que combinam com a principal. Ela pinta a barra e o menu.</Text>
          <View style={estilosSistema.acoes}>
            {opcoes.map((o) => (
              <Pressable
                key={o.nome}
                onPress={() => setSecundaria(o.cor)}
                style={[styles.chip, sec === o.cor && styles.chipEscolhido]}
                accessibilityRole="radio"
                accessibilityState={{ checked: sec === o.cor }}
              >
                <View style={[styles.bolinha, { backgroundColor: o.cor }]} />
                <Text style={styles.chipTexto}>{o.nome}</Text>
              </Pressable>
            ))}
          </View>
        </Cartao>

        {!!aviso && (aviso.erro ? <AvisoErro mensagem={aviso.texto} /> : <AvisoInfo mensagem={aviso.texto} />)}
        <View style={estilosSistema.acoes}>
          <Pilula texto={salvando ? 'Salvando…' : 'Salvar marca'} destaque ocupado={salvando} aoTocar={salvar} />
        </View>
      </View>

      <Previa sistema={sistema} ia={ia} cor={cor} sec={sec} formato={formato} endereco={endereco} />
    </View>
  );
}

function Previa({ sistema, ia, cor, sec, formato, endereco }: {
  sistema: string; ia: string; cor: string; sec: string; formato: FormatoDaLogo; endereco: string | null;
}) {
  const cores = useCores();
  const styles = useEstilos(criarEstilos);
  const claro = ehClara(sec);
  const fundo = claro ? '#f7f8fa' : cores.bg;
  const texto = claro ? '#111318' : cores.text;
  const apoio = claro ? '#3b4252' : cores.textMuted;
  return (
    <View style={styles.previaColuna} accessibilityLabel="Prévia no celular do aluno">
      <Text style={styles.rotulo}>Prévia no celular do aluno</Text>
      <View style={[styles.celular, { backgroundColor: fundo }]}>
        <View style={[styles.barra, { backgroundColor: sec }]}>
          <LogoDaEscola endereco={endereco} formato={formato} cor={cor} nome={sistema || 'Escola'} tamanho={32} corSemFundo={textoSobre(sec)} />
          <Text style={[styles.barraTexto, { color: textoSobre(sec) }]} numberOfLines={1}>{sistema}</Text>
        </View>
        <View style={styles.meio}>
          <LogoDaEscola endereco={endereco} formato={formato} cor={cor} nome={sistema || 'Escola'} tamanho={64} corSemFundo={claro ? cor : '#ffffff'} />
          <Text style={[styles.ola, { color: texto }]}>Olá, Bruna</Text>
          <Text style={[styles.pergunta, { color: apoio }]}>Qual dúvida você quer pensar comigo hoje?</Text>
        </View>
        <View style={styles.rodapeCelular}>
          <View style={[styles.caixaChat, { borderColor: claro ? '#8a94a6' : cores.fieldBorder }]}>
            <Text style={{ color: apoio, fontFamily: FontesHorizonte.corpo }}>Fale com a {ia}</Text>
          </View>
          <View style={[styles.botaoPrevia, { backgroundColor: cor }]}>
            <Text style={[styles.botaoPreviaTexto, { color: textoSobre(cor) }]}>Continuar a trilha</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const criarEstilos = (cores: Cores) => StyleSheet.create({
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' },
  editor: { flexGrow: 1, flexBasis: 420, minWidth: 0, gap: 16 },
  logoLinha: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 },
  molduraSemFundo: { padding: 4, borderWidth: 1, borderStyle: 'dashed', borderColor: cores.fieldBorder, borderRadius: 12 },
  rotulo: { fontFamily: FontesHorizonte.corpoForte, fontSize: 14, color: cores.textMuted },
  ajuda: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: cores.textMuted },
  paleta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amostra: { width: 44, height: 44, borderRadius: 12 },
  amostraEscolhida: { borderWidth: 3, borderColor: cores.action },
  tons: { flexDirection: 'row', gap: 8 },
  tom: { flex: 1, height: 56, borderRadius: 12, justifyContent: 'flex-end', padding: 8 },
  tomTexto: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 13 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingLeft: 8, paddingRight: 14,
    borderRadius: 999, borderWidth: 1, borderColor: cores.fieldBorder,
  },
  chipEscolhido: { borderColor: cores.action, backgroundColor: cores.fieldBg },
  bolinha: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: cores.fieldBorder },
  chipTexto: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 14, color: cores.text },
  previaColuna: { flexGrow: 0, flexBasis: 320, gap: 10, alignItems: 'center' },
  celular: { width: 300, height: 580, borderRadius: 34, borderWidth: 1, borderColor: cores.hairline, overflow: 'hidden' },
  barra: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 16 },
  barraTexto: { flex: 1, fontFamily: FontesHorizonte.display, fontSize: 16 },
  meio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  ola: { fontFamily: FontesHorizonte.display, fontSize: 22 },
  pergunta: { fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  rodapeCelular: { padding: 14, gap: 10 },
  caixaChat: { height: 46, borderRadius: 999, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 18 },
  botaoPrevia: { height: 46, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  botaoPreviaTexto: { fontFamily: FontesHorizonte.display, fontSize: 15 },
});
