/** O link de convite da escola: a marca (sem login) e a entrada do aluno na turma. */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL, chamar, type ResultadoApi } from '@/services/api';
import type { EntradaPeloConvite, EscolaDoConvite } from '@/types/api';

export function buscarConvite(convite: string): Promise<ResultadoApi<EscolaDoConvite>> {
  return chamar(`/api/convites/${encodeURIComponent(convite)}`);
}

/** nascimento em AAAA-MM-DD. 404 = dados não batem (a frase não diz qual); 429 = tentativas demais. */
export function entrarPeloConvite(
  convite: string,
  matricula: string,
  nascimento: string,
): Promise<ResultadoApi<EntradaPeloConvite>> {
  return chamar(`/api/convites/${encodeURIComponent(convite)}/entrar`, {
    method: 'POST',
    body: JSON.stringify({ matricula, nascimento }),
  });
}

/** A logo é pública: aparece na tela do convite, antes do login. */
export function enderecoDaLogo(escolaId: string, versao = 0): string {
  return `${API_URL}/api/escolas/${encodeURIComponent(escolaId)}/logo?v=${versao}`;
}

// Quem abre o link sem conta vai criar uma: o convite fica guardado para a volta.
const CHAVE_PENDENTE = 'aluma.convite-pendente';
const FORMATO_UUID = /^[0-9a-f-]{36}$/i;

export function guardarConvitePendente(convite: string): Promise<void> {
  return AsyncStorage.setItem(CHAVE_PENDENTE, convite);
}

export async function convitePendente(): Promise<string | null> {
  const valor = await AsyncStorage.getItem(CHAVE_PENDENTE).catch(() => null);
  return valor && FORMATO_UUID.test(valor) ? valor : null;
}

export function esquecerConvitePendente(): Promise<void> {
  return AsyncStorage.removeItem(CHAVE_PENDENTE);
}
