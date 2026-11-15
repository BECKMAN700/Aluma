/**
 * Professor no primeiro acesso troca a senha provisória (rota /trocar-senha), opção A escolhida
 * em 15/11: tela cheia, com as regras marcando conforme digita. O painel só abre depois.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvisoErro, CampoTexto, LinkTexto, TelaFormulario } from '@/components/horizonte/formulario';
import { LogoDaEscola } from '@/components/logo-da-escola';
import { textoSobre } from '@/constants/marca';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { useSessao } from '@/hooks/use-sessao';
import { sair, trocarSenha } from '@/services/auth';
import { enderecoDaLogo } from '@/services/convites';

export default function TrocarSenhaScreen() {
  const { sessao, recarregar } = useSessao();
  const escola = sessao.estado === 'pronto' ? sessao.usuario.escola : null;
  const cor = escola?.cor ?? Horizonte.action;
  const [nova, setNova] = useState('');
  const [repetida, setRepetida] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // As mesmas regras do validarSenha (services/auth.ts), uma por linha para o professor ver.
  const regras = [
    { texto: 'Pelo menos 8 caracteres', ok: nova.length >= 8 },
    { texto: 'Letras e números', ok: /[A-Za-z]/.test(nova) && /\d/.test(nova) },
    { texto: 'As duas senhas iguais', ok: nova.length > 0 && nova === repetida },
  ];
  const valida = regras.every((r) => r.ok);

  const salvar = async () => {
    if (!valida || salvando) return;
    setErro(null);
    setSalvando(true);
    const r = await trocarSenha(nova);
    setSalvando(false);
    if (!r.ok) return setErro(r.erro);
    await recarregar(); // trocar_senha some do /api/me e o layout abre o painel
  };

  return (
    <TelaFormulario>
      {escola && (
        <View style={styles.cabecalho}>
          <LogoDaEscola
            endereco={escola.tem_logo ? enderecoDaLogo(escola.id) : null}
            formato={escola.logo_formato}
            cor={escola.cor}
            nome={escola.nome_do_sistema}
            tamanho={36}
            corSemFundo={Horizonte.text}
          />
          <Text style={styles.sistema}>{escola.nome_do_sistema}</Text>
        </View>
      )}

      <View style={styles.corpo}>
        <Text style={styles.titulo} accessibilityRole="header">Crie a sua senha</Text>
        <Text style={styles.apoio}>
          Você entrou com a senha provisória que a coordenação passou. Troque agora: só você vai saber a nova.
        </Text>
        {!!erro && <AvisoErro mensagem={erro} />}
        <CampoTexto rotulo="Nova senha" value={nova} onChangeText={setNova} senha autoComplete="new-password" editable={!salvando} />
        <CampoTexto rotulo="Repita a nova senha" value={repetida} onChangeText={setRepetida} senha autoComplete="new-password" onSubmitEditing={salvar} editable={!salvando} />

        <View style={styles.regras} accessibilityLabel="Regras da senha">
          {regras.map((r) => (
            <View key={r.texto} style={styles.regra}>
              <View style={[styles.marca, r.ok && styles.marcaOk]}>
                <Text style={[styles.marcaTexto, r.ok && styles.ok]}>{r.ok ? '✓' : '·'}</Text>
              </View>
              <Text style={[styles.regraTexto, r.ok && styles.ok]}>{r.texto}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        style={[styles.botao, valida ? { backgroundColor: cor } : styles.botaoApagado, salvando && styles.pressionado]}
        onPress={salvar}
        disabled={salvando}
        accessibilityRole="button"
        accessibilityState={{ disabled: !valida || salvando, busy: salvando }}
      >
        <Text style={[styles.botaoTexto, { color: valida ? textoSobre(cor) : Horizonte.textMuted }]}>
          {salvando ? 'Salvando…' : 'Salvar e entrar'}
        </Text>
      </Pressable>
      <LinkTexto texto="Sair" rotulo="Sair da conta" aoTocar={sair} />
    </TelaFormulario>
  );
}

const styles = StyleSheet.create({
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  sistema: { fontFamily: FontesHorizonte.displayMedio, fontSize: 16, color: Horizonte.text },
  corpo: { flex: 1, gap: 16, paddingTop: 40 },
  titulo: { fontFamily: FontesHorizonte.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.4, color: Horizonte.text },
  apoio: { fontFamily: FontesHorizonte.corpo, fontSize: 15, lineHeight: 22, color: Horizonte.textMuted },
  regras: { gap: 8 },
  regra: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  marca: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: Horizonte.fieldBg },
  marcaOk: { backgroundColor: '#123824' },
  marcaTexto: { fontFamily: FontesHorizonte.corpoForte, fontSize: 13, color: Horizonte.textMuted },
  regraTexto: { fontFamily: FontesHorizonte.corpo, fontSize: 14, color: Horizonte.textMuted },
  ok: { color: '#9fe6bd' },
  botao: { minHeight: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 8 },
  botaoApagado: { backgroundColor: Horizonte.fieldBg, borderWidth: 1, borderColor: Horizonte.hairline },
  botaoTexto: { fontFamily: FontesHorizonte.display, fontSize: 17 },
  pressionado: { opacity: 0.85 },
});
