/** O link de convite da escola: a marca (sem login) e a entrada do aluno na turma. */
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
