import { useEffect, useState } from 'react';

import { checkHealth } from '@/services/api';

/**
 * - checando: primeira pergunta ao servidor, ainda sem resposta
 * - acordando: o servidor não respondeu; no Render grátis, ele dorme depois de
 *   15 min parado e leva de 30 a 50s para acordar
 * - pronto: respondeu, pode conversar
 * - indisponivel: 90s sem resposta; paramos de tentar
 */
export type BackendStatus = 'checando' | 'acordando' | 'pronto' | 'indisponivel';

const TEMPO_POR_TENTATIVA_MS = 8_000;
const PAUSA_ENTRE_TENTATIVAS_MS = 2_000;
// Folga sobre os ~50s do Render. Depois disso insistir só gasta bateria e
// dados do aluno.
const DESISTE_DEPOIS_DE_MS = 90_000;

/**
 * Verifica se o servidor está no ar ao abrir a tela e continua tentando
 * enquanto ele acorda. Desistir de uma tentativa não cancela o despertar:
 * a primeira requisição já acordou o servidor.
 */
export function useBackendStatus(): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>('checando');

  useEffect(() => {
    // Se a tela fechar no meio, o laço para e não mexe mais no estado.
    let ativo = true;
    const inicio = Date.now();

    async function verificar() {
      while (ativo) {
        if (await checkHealth(TEMPO_POR_TENTATIVA_MS)) {
          if (ativo) setStatus('pronto');
          return;
        }
        if (!ativo) return;
        if (Date.now() - inicio >= DESISTE_DEPOIS_DE_MS) {
          setStatus('indisponivel');
          return;
        }
        setStatus('acordando');
        await new Promise((resolve) => setTimeout(resolve, PAUSA_ENTRE_TENTATIVAS_MS));
      }
    }

    verificar();
    return () => {
      ativo = false;
    };
  }, []);

  return status;
}
