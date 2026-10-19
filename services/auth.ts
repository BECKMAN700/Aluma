// Autenticação via Supabase Auth. O backend (nucleo/auth.py) só valida o JWT recebido
// em "Authorization: Bearer <token>" e cria o perfil como 'aluno' no primeiro acesso.
import { supabase } from '@/services/supabase';

export type Perfil = 'aluno' | 'professor';
export type CampoComErro = 'nome' | 'email' | 'senha';

export type ResultadoAuth =
  | { ok: true; precisaConfirmarEmail?: boolean }
  | { ok: false; erro: string; campo?: CampoComErro };

const MSG_SEM_INTERNET = 'Sem conexão com a internet. Verifique sua rede e tente de novo.';
const MSG_GENERICO = 'Não foi possível concluir agora. Tente de novo.';
const MSG_EMAIL_USADO = 'Este e-mail já está em uso. Tente entrar na sua conta.';
const MSG_SENHA_FRACA = 'Senha fraca: use pelo menos 8 caracteres, com letras e números.';

export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validarSenha(senha: string): string | null {
  if (senha.length < 8) return 'Senha fraca: use pelo menos 8 caracteres.';
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
    return 'Senha fraca: misture letras e números.';
  }
  return null;
}

// Os campos que o Supabase põe nos erros dele; um erro de rede pode não ter nenhum.
type ErroSupabase = { name?: string; status?: number; code?: string; message?: string };

function semConexao(erro: ErroSupabase | undefined): boolean {
  return (
    erro?.name === 'AuthRetryableFetchError' ||
    erro?.status === 0 ||
    /network|failed to fetch/i.test(erro?.message ?? '')
  );
}

function traduzirErro(e: unknown): ResultadoAuth {
  const erro = e as ErroSupabase | undefined;
  if (semConexao(erro)) return { ok: false, erro: MSG_SEM_INTERNET };
  switch (erro?.code) {
    case 'invalid_credentials':
      return { ok: false, erro: 'E-mail ou senha incorretos.' };
    case 'email_not_confirmed':
      return { ok: false, erro: 'Confirme seu e-mail pelo link que enviamos antes de entrar.' };
    case 'user_already_exists':
    case 'email_exists':
      return { ok: false, campo: 'email', erro: MSG_EMAIL_USADO };
    case 'weak_password':
      return { ok: false, campo: 'senha', erro: MSG_SENHA_FRACA };
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return { ok: false, erro: 'Muitas tentativas. Aguarde um pouco e tente de novo.' };
    default:
      return { ok: false, erro: MSG_GENERICO };
  }
}

export async function entrar(email: string, senha: string): Promise<ResultadoAuth> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });
    return error ? traduzirErro(error) : { ok: true };
  } catch (e) {
    return traduzirErro(e);
  }
}

export async function criarConta(nome: string, email: string, senha: string): Promise<ResultadoAuth> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
      // O backend lê user_metadata.nome ao criar o perfil.
      options: { data: { nome: nome.trim() } },
    });
    if (error) return traduzirErro(error);
    // Com confirmação de e-mail ligada, e-mail já cadastrado não dá erro: volta usuário sem identities.
    if (data.user && data.user.identities?.length === 0) {
      return { ok: false, campo: 'email', erro: MSG_EMAIL_USADO };
    }
    return { ok: true, precisaConfirmarEmail: !data.session };
  } catch (e) {
    return traduzirErro(e);
  }
}

/** Encerra a sessão e apaga o token guardado no aparelho. */
export async function sair(): Promise<void> {
  await supabase.auth.signOut();
}

/** Token para o services/api.ts mandar em "Authorization: Bearer ...". */
export async function obterToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}