/**
 * Cores da tela com a marca da escola de quem está logado (decisão de 15/11). As chaves são as
 * mesmas do Horizonte, então uma tela troca `Horizonte.x` por `cores.x` e passa a seguir a escola.
 * Sem escola (login, convite antes de entrar), vale o Horizonte do Aluma.
 *
 *   const cores = useCores();                  // cor solta no JSX
 *   const styles = useEstilos(criarEstilos);   // criarEstilos = (cores: Cores) => StyleSheet.create(...)
 */
import React, { createContext, useContext, useMemo } from 'react';

import { ehClara, legivelSobre, textoSobre } from '@/constants/marca';
import { Horizonte } from '@/constants/theme';
import { useSessao } from '@/hooks/use-sessao';
import type { MarcaDaEscola } from '@/types/api';

export type Cores = { [K in keyof typeof Horizonte]: string } & {
  /** A secundária da escola: menu lateral e barra de baixo. */
  menu: string;
  sobreMenu: string;
  /** Tema claro (secundária clara): sem o céu estrelado. */
  claro: boolean;
};

export const CORES_ALUMA: Cores = { ...Horizonte, menu: Horizonte.surface, sobreMenu: Horizonte.text, claro: false };

export function coresDaEscola(marca: Pick<MarcaDaEscola, 'cor' | 'cor_secundaria'>): Cores {
  const claro = ehClara(marca.cor_secundaria);
  const base = claro
    ? {
        bg: '#f7f8fa', surface: '#ffffff', fieldBg: '#ffffff', fieldBorder: '#8a94a6', hairline: '#e1e5ec',
        text: '#111318', textMuted: '#3b4252', lumaText: '#1f2430', star: '#5b6475', error: '#b42318',
      }
    : { ...Horizonte };
  const acao = legivelSobre(marca.cor, base.bg);
  return {
    ...Horizonte,
    ...base,
    action: acao,
    onAction: textoSobre(acao),
    luma: acao,
    studentBubble: acao,
    studentText: textoSobre(acao),
    menu: marca.cor_secundaria,
    sobreMenu: textoSobre(marca.cor_secundaria),
    claro,
  };
}

const CoresContext = createContext<Cores>(CORES_ALUMA);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const { sessao } = useSessao();
  const escola = sessao.estado === 'pronto' ? sessao.usuario.escola : null;
  const cor = escola?.cor;
  const secundaria = escola?.cor_secundaria;
  const cores = useMemo(
    () => (cor && secundaria ? coresDaEscola({ cor, cor_secundaria: secundaria }) : CORES_ALUMA),
    [cor, secundaria],
  );
  return <CoresContext.Provider value={cores}>{children}</CoresContext.Provider>;
}

export function useCores(): Cores {
  return useContext(CoresContext);
}

/** Estilos que dependem das cores: recriados só quando a marca muda. */
export function useEstilos<T>(criar: (cores: Cores) => T): T {
  const cores = useCores();
  return useMemo(() => criar(cores), [criar, cores]);
}
