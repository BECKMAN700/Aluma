/**
 * Tela de entrar (rota /entrar): e-mail, senha e botão Entrar.
 * Valida os campos, mostra erros claros e bloqueia envio duplo enquanto envia.
 * A chamada de login fica em services/auth.ts.
 */

import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EstrelaNoHorizonte, Surgir } from '@/components/horizonte/ceu';
import {
  AvisoErro,
  BotaoPrincipal,
  CabecalhoVoltar,
  CampoTexto,
  LinkTexto,
  TelaFormulario,
  TituloTela,
} from '@/components/horizonte/formulario';
import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { emailValido, entrar, type CampoComErro, type Perfil } from '@/services/auth';

export default function EntrarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ perfil?: string }>();
  const perfil: Perfil = params.perfil === 'professor' ? 'professor' : 'aluno';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<Partial<Record<CampoComErro, string>>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const enviandoRef = useRef(false); // trava síncrona: dois toques rápidos não passam
  const senhaRef = useRef<TextInput>(null);

  const executar = async () => {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviando(true);
    setErroGeral(null);
    try {
      const r = await entrar(email, senha);
      // Deu certo: o layout raiz percebe a sessão nova e leva para a tela certa.
      if (r.ok) return;
      if (r.campo) {
        setErros({ [r.campo]: r.erro });
      } else {
        setErroGeral(r.erro);
      }
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  };

  const enviar = () => {
    if (enviandoRef.current) return;
    const novos: Partial<Record<CampoComErro, string>> = {};
    if (!emailValido(email)) novos.email = 'Digite um e-mail válido.';
    if (!senha) novos.senha = 'Digite sua senha.';
    setErros(novos);
    setErroGeral(null);
    if (Object.keys(novos).length) return;
    executar();
  };

  return (
    <TelaFormulario>
      <Surgir style={styles.camada}>
        <CabecalhoVoltar texto="Voltar para a página inicial" aoVoltar={() => router.replace('/')} />
      </Surgir>

      <TituloTela titulo="Entrar" subtitulo={`Entre com sua conta de ${perfil}.`} style={styles.textos} />

      <View style={styles.estrela}>
        <EstrelaNoHorizonte tamanho={36} />
      </View>

      <Surgir style={[styles.formulario, styles.camada]}>
        {!!erroGeral && <AvisoErro mensagem={erroGeral} />}

        <CampoTexto
          rotulo="E-mail"
          value={email}
          onChangeText={(t) => { setEmail(t); setErros((e) => ({ ...e, email: undefined })); setErroGeral(null); }}
          erro={erros.email}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => senhaRef.current?.focus()}
          editable={!enviando}
        />
        <CampoTexto
          rotulo="Senha"
          senha
          inputRef={senhaRef}
          value={senha}
          onChangeText={(t) => { setSenha(t); setErros((e) => ({ ...e, senha: undefined })); setErroGeral(null); }}
          erro={erros.senha}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="send"
          onSubmitEditing={enviar}
          editable={!enviando}
        />

        <View style={styles.acoes}>
          <BotaoPrincipal texto="Entrar" textoOcupado="Entrando…" ocupado={enviando} aoTocar={enviar} />
          {/* Só aluno cria conta pelo app; a conta de professor é criada pela equipe. */}
          {perfil === 'aluno' && (
            <LinkTexto
              texto="Não tem conta? Criar conta"
              rotulo="Criar conta"
              aoTocar={() => router.push('/criar-conta')}
            />
          )}
        </View>
      </Surgir>

      <View style={styles.espaco} />
      <Surgir style={styles.camada}>
        <Text style={styles.frase}>Aprender é descobrir a própria luz.</Text>
      </Surgir>
    </TelaFormulario>
  );
}

const styles = StyleSheet.create({
  camada: { zIndex: 1 },

  textos: { marginTop: 10, gap: 6 },

  estrela: { marginTop: 41, marginBottom: 28 },

  formulario: { gap: 16 },
  acoes: { marginTop: 8, gap: 8 },

  espaco: { flexGrow: 1, minHeight: 24 },
  frase: {
    fontFamily: FontesHorizonte.displayMedio,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: Horizonte.textMuted,
  },
});
