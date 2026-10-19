/**
 * Tela de entrar (rota /entrar): e-mail, senha, botão Entrar e login com Google.
 * Valida os campos, mostra erros claros e bloqueia envio duplo enquanto envia.
 * A chamada de login fica em services/auth.ts.
 */

import React, { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CampoTexto } from '@/components/auth/campo-text';
import { useEstilosAuth } from '@/components/auth/styles-auth';
import { IconeGoogle } from '@/components/auth/icone-google';
import { TelaAuth } from '@/components/auth/screen-auth';
import { emailValido, entrar, entrarComGoogle, type CampoComErro, type Perfil } from '@/services/auth';

export default function EntrarScreen() {
  const router = useRouter();
  const s = useEstilosAuth();
  const params = useLocalSearchParams<{ perfil?: string }>();
  const perfil: Perfil = params.perfil === 'professor' ? 'professor' : 'aluno';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<Partial<Record<CampoComErro, string>>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const enviandoRef = useRef(false); // trava síncrona: dois toques rápidos não passam
  const senhaRef = useRef<TextInput>(null);

  const executar = async (chamada: () => ReturnType<typeof entrar>) => {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviando(true);
    setErroGeral(null);
    try {
      const r = await chamada();
      if (r.ok) {
        router.replace('/home');
      } else if (r.campo) {
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
    executar(() => entrar(email, senha));
  };

  return (
    <TelaAuth
      titulo="Entrar"
      subtitulo={`Entre com sua conta de ${perfil}.`}
      voltar={() => router.replace('/')}
    >
      {!!erroGeral && (
        <View style={s.erroBanner}>
          <Text style={s.erroTexto} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {erroGeral}
          </Text>
        </View>
      )}

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

      <Pressable
        style={[s.botao, enviando && s.botaoDesativado]}
        onPress={enviar}
        disabled={enviando}
        accessibilityRole="button"
        accessibilityLabel={enviando ? 'Entrando' : 'Entrar'}
        accessibilityState={{ disabled: enviando, busy: enviando }}
      >
        <Text style={s.botaoTexto}>{enviando ? 'Entrando…' : 'Entrar'}</Text>
      </Pressable>

      <View style={s.divisor}>
        <View style={s.divisorLinha} />
        <Text style={s.divisorTexto}>ou</Text>
        <View style={s.divisorLinha} />
      </View>

      <Pressable
        style={[s.botaoSecundario, enviando && s.botaoDesativado]}
        onPress={() => executar(() => entrarComGoogle(perfil))}
        disabled={enviando}
        accessibilityRole="button"
        accessibilityLabel="Entrar com o Google"
        accessibilityState={{ disabled: enviando }}
      >
        <IconeGoogle />
        <Text style={s.botaoSecundarioTexto}>Entrar com o Google</Text>
      </Pressable>

      <Pressable
        style={s.link}
        onPress={() => router.push({ pathname: '/criar-conta', params: { perfil } })}
        accessibilityRole="button"
        accessibilityLabel="Criar conta"
      >
        <Text style={s.linkTexto}>Não tem conta? Criar conta</Text>
      </Pressable>
    </TelaAuth>
  );
}
