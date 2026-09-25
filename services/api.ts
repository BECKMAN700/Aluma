/**
 * Único lugar do app que conhece o endereço do servidor.
 *
 * A URL vem de EXPO_PUBLIC_API_URL (arquivo .env na raiz, ver .env.example).
 * Ela não é segredo, por isso pode ficar no app; a chave do Gemini, sim, e
 * vive só no servidor (regra inviolável 2).
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
