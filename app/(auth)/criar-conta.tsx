/**
 * Tela de criar conta: nome, e-mail, senha e confirmação de senha.
 * Só existe para aluno: a conta de professor é criada pela equipe (arquitetura.md §4).
 */
import React, { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CampoTexto } from '@/components/auth/campo-text';
import { useEstilosAuth } from '@/components/auth/styles-auth';
import { TelaAuth } from '@/components/auth/screen-auth';
import { criarConta, emailValido, validarSenha, type CampoComErro } from '@/services/auth';

// O campo "confirmar senha" só existe na tela; o servidor nunca devolve erro nele.
type CampoForm = CampoComErro | 'confirmar';

export default function CriarContaScreen() {
  const router = useRouter();
  const s = useEstilosAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erros, setErros] = useState<Partial<Record<CampoForm, string>>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const enviandoRef = useRef(false);
  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const confirmarRef = useRef<TextInput>(null);

  const limpar = (campo: CampoForm) => {
    setErros((e) => ({ ...e, [campo]: undefined }));
    setErroGeral(null);
  };

  const enviar = async () => {
    if (enviandoRef.current) return;
    const novos: Partial<Record<CampoForm, string>> = {};
    if (nome.trim().length < 2) novos.nome = 'Digite seu nome.';
    if (!emailValido(email)) novos.email = 'Digite um e-mail válido.';
    const erroSenha = validarSenha(senha);
    if (erroSenha) novos.senha = erroSenha;
    if (!confirmar) novos.confirmar = 'Confirme a senha.';
    else if (confirmar !== senha) novos.confirmar = 'As senhas não são iguais.';
    setErros(novos);
    setErroGeral(null);
    if (Object.keys(novos).length) return;

    enviandoRef.current = true;
    setEnviando(true);
    try {
      const r = await criarConta(nome, email, senha);
      if (r.ok && r.precisaConfirmarEmail) {
        setAviso('Conta criada! Enviamos um link para o seu e-mail. Confirme e depois entre.');
      } else if (r.ok) {
        // Conta criada e logada: o layout raiz leva para a tela do código da turma.
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

  return (
    <TelaAuth
      titulo="Criar conta"
      subtitulo="Cadastro de aluno."
      voltar={() => router.replace('/')}
    >
      {!!aviso && (
        <View style={s.erroBanner}>
          <Text style={s.erroTexto} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {aviso}
          </Text>
        </View>
      )}
      {!!erroGeral && (
        <View style={s.erroBanner}>
          <Text style={s.erroTexto} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {erroGeral}
          </Text>
        </View>
      )}

      <CampoTexto
        rotulo="Nome"
        value={nome}
        onChangeText={(t) => { setNome(t); limpar('nome'); }}
        erro={erros.nome}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        editable={!enviando}
      />
      <CampoTexto
        rotulo="E-mail"
        inputRef={emailRef}
        value={email}
        onChangeText={(t) => { setEmail(t); limpar('email'); }}
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
        onChangeText={(t) => { setSenha(t); limpar('senha'); limpar('confirmar'); }}
        erro={erros.senha}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmarRef.current?.focus()}
        editable={!enviando}
      />
      <CampoTexto
        rotulo="Confirmar senha"
        senha
        inputRef={confirmarRef}
        value={confirmar}
        onChangeText={(t) => { setConfirmar(t); limpar('confirmar'); }}
        erro={erros.confirmar}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="send"
        onSubmitEditing={enviar}
        editable={!enviando}
      />

      <Pressable
        style={[s.botao, enviando && s.botaoDesativado]}
        onPress={enviar}
        disabled={enviando}
        accessibilityRole="button"
        accessibilityLabel={enviando ? 'Criando conta' : 'Criar conta'}
        accessibilityState={{ disabled: enviando, busy: enviando }}
      >
        <Text style={s.botaoTexto}>{enviando ? 'Criando conta…' : 'Criar conta'}</Text>
      </Pressable>

      <Pressable
        style={s.link}
        onPress={() => router.replace({ pathname: '/entrar', params: { perfil: 'aluno' } })}
        accessibilityRole="button"
        accessibilityLabel="Já tenho conta, entrar"
      >
        <Text style={s.linkTexto}>Já tem conta? Entrar</Text>
      </Pressable>
    </TelaAuth>
  );
}
