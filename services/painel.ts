import { chamar, type ResultadoApi } from '@/services/api';
import type { PainelDaTurma, ResumoDeDuvidas } from '@/types/api';

/** Só números por tópico e o resumo da IA: a conversa do aluno nunca chega ao professor. */
export function buscarPainel(turmaId: string): Promise<ResultadoApi<PainelDaTurma>> {
  return chamar<PainelDaTurma>(`/api/turmas/${encodeURIComponent(turmaId)}/painel`);
}

/** Pede à IA as dúvidas mais comuns do tópico. 422 = ainda há poucas perguntas para resumir. */
export function resumirDuvidas(topicoId: string): Promise<ResultadoApi<ResumoDeDuvidas>> {
  return chamar<ResumoDeDuvidas>(`/api/topicos/${encodeURIComponent(topicoId)}/resumo-de-duvidas`, {
    method: 'POST',
  });
}
