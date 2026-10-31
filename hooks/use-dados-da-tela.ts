import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import type { ResultadoApi } from '@/services/api';
import { sair } from '@/services/auth';

export type DadosDaTela<T> =
  | { estado: 'carregando' }
  | { estado: 'erro'; erro: string }
  | { estado: 'pronto'; dados: T };

/**
 * Busca os dados sempre que a tela ganha foco: quem volta de "criar turma" já vê a turma nova.
 * `buscar` precisa ser estável (useCallback). Sessão vencida leva de volta ao login.
 */
export function useDadosDaTela<T>(
  buscar: () => Promise<ResultadoApi<T>>,
): [DadosDaTela<T>, () => void] {
  const [dados, setDados] = useState<DadosDaTela<T>>({ estado: 'carregando' });
  // Só a busca mais recente mexe na tela; sair da tela invalida a que estiver no ar.
  const ultimaBusca = useRef(0);

  const carregar = useCallback(() => {
    const estaBusca = ++ultimaBusca.current;
    buscar().then((r) => {
      if (estaBusca !== ultimaBusca.current) return;
      if (r.ok) setDados({ estado: 'pronto', dados: r.dados });
      else if (r.status === 401) sair();
      else setDados({ estado: 'erro', erro: r.erro });
    });
  }, [buscar]);

  useFocusEffect(
    useCallback(() => {
      carregar();
      return () => {
        ultimaBusca.current++;
      };
    }, [carregar]),
  );

  const tentarDeNovo = () => {
    setDados({ estado: 'carregando' });
    carregar();
  };

  return [dados, tentarDeNovo];
}
