/**
 * Quem está usando o app: sem login, ou logado com o perfil que o GET /api/me devolveu.
 * O papel e a turma vêm sempre do servidor; o app só decide qual tela mostrar.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { sair } from '@/services/auth';
import { buscarMe } from '@/services/api';
import { supabase } from '@/services/supabase';
import type { Me } from '@/types/api';

export type Sessao =
  | { estado: 'carregando' }
  | { estado: 'sem-login' }
  | { estado: 'erro'; erro: string }
  | { estado: 'pronto'; usuario: Me };

type ValorSessao = {
  sessao: Sessao;
  /** Busca o /api/me de novo, por exemplo depois que o aluno entra na turma. */
  recarregar: () => Promise<void>;
};

const SessaoContext = createContext<ValorSessao | null>(null);

export function SessaoProvider({ children }: { children: React.ReactNode }) {
  const [sessao, setSessao] = useState<Sessao>({ estado: 'carregando' });
  // Usuário cujo /api/me já foi pedido: o Supabase repete SIGNED_IN (ex.: ao voltar para a aba).
  const usuarioCarregado = useRef<string | null>(null);

  const carregar = useCallback(async () => {
    const r = await buscarMe();
    if (r.ok && (r.dados.papel === 'aluno' || r.dados.papel === 'professor')) {
      setSessao({ estado: 'pronto', usuario: r.dados });
    } else if (r.ok) {
      // Papel desconhecido: na dúvida, nega (regra inviolável 4).
      setSessao({ estado: 'erro', erro: 'Sua conta não tem um perfil válido. Fale com a equipe.' });
    } else if (r.status === 401) {
      // Token vencido ou inválido: volta para o login em vez de ficar preso.
      usuarioCarregado.current = null;
      setSessao({ estado: 'sem-login' });
      await sair();
    } else {
      setSessao({ estado: 'erro', erro: r.erro });
    }
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (!session) {
        usuarioCarregado.current = null;
        setSessao({ estado: 'sem-login' });
        return;
      }
      if (usuarioCarregado.current === session.user.id) return;
      usuarioCarregado.current = session.user.id;
      setSessao({ estado: 'carregando' });
      // Fora do callback: chamar o Supabase dentro dele trava (aviso da documentação do supabase-js).
      setTimeout(carregar, 0);
    });
    return () => data.subscription.unsubscribe();
  }, [carregar]);

  return (
    <SessaoContext.Provider value={{ sessao, recarregar: carregar }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao(): ValorSessao {
  const valor = useContext(SessaoContext);
  if (!valor) throw new Error('useSessao precisa estar dentro do SessaoProvider');
  return valor;
}
