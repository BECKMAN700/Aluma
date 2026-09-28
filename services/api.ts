import type { ChatErrorResponse, ChatHistoryItem, ChatRequestBody, ChatResponse } from '@/types/aluma';

/**
 * Único lugar do app que conhece o endereço do servidor.
 *
 * A URL vem de EXPO_PUBLIC_API_URL (arquivo .env na raiz, ver .env.example).
 * Ela não é segredo, por isso pode ficar no app; a chave do Gemini, sim, e
 * vive só no servidor (regra inviolável 2).
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

// O Render leva até ~50s para acordar de um cold start; 60s dá folga.
const TIMEOUT_ENVIO_MS = 60_000;

const ERRO_SEM_URL = 'Endereço do servidor não configurado.';
const ERRO_REDE_OU_TIMEOUT =
  'Não foi possível falar com o tutor. Verifique sua internet e tente de novo.';

export type SendMessageResult = { ok: true; resposta: string } | { ok: false; erro: string };

/**
 * Pergunta ao servidor "você está aí?" pela rota /health, que não gasta cota
 * do Gemini. Devolve true se ele respondeu dentro do tempo, false se demorou,
 * se a internet falhou ou se o servidor respondeu com erro.
 */
export async function checkHealth(timeoutMs: number): Promise<boolean> {
  if (!API_URL) {
    // Sem endereço não há como saber: tratar como fora do ar, nunca fingir
    // que está tudo bem (regra inviolável 4).
    console.error('EXPO_PUBLIC_API_URL não definida: crie o .env a partir do .env.example');
    return false;
  }

  // AbortController + setTimeout em vez de AbortSignal.timeout: o Hermes,
  // motor de JavaScript do app no celular, não garante suporte a este último.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_URL}/health`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Envia a mensagem do aluno e o histórico da conversa para o tutor.
 *
 * Nunca loga `mensagem` nem `historico`: é conversa de aluno menor de idade
 * (regra inviolável 8). 422, 429 e 503 já chegam com `{"erro": "..."}` pronto
 * em português (backend/main.py) — só repassamos.
 */
export async function sendMessage(
  mensagem: string,
  historico: ChatHistoryItem[],
): Promise<SendMessageResult> {
  if (!API_URL) {
    console.error('EXPO_PUBLIC_API_URL não definida: crie o .env a partir do .env.example');
    return { ok: false, erro: ERRO_SEM_URL };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_ENVIO_MS);
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem, historico } satisfies ChatRequestBody),
      signal: controller.signal,
    });

    if (response.ok) {
      const data: ChatResponse = await response.json();
      return { ok: true, resposta: data.resposta };
    }

    const data: ChatErrorResponse = await response.json();
    return { ok: false, erro: data.erro || ERRO_REDE_OU_TIMEOUT };
  } catch {
    return { ok: false, erro: ERRO_REDE_OU_TIMEOUT };
  } finally {
    clearTimeout(timer);
  }
}
