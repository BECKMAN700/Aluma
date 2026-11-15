import { chamar, type ResultadoApi } from '@/services/api';
import type { ListaDeAlunos, ListaDeTurmas, ResumoDoProfessor } from '@/types/api';

/** Só as turmas em que o professor logado tem matéria: quem filtra é o servidor. */
export function listarTurmas(): Promise<ResultadoApi<ListaDeTurmas>> {
  return chamar<ListaDeTurmas>('/api/turmas');
}

/** Totais de cada turma e os tópicos com mais alunos tentando, para o início do professor. */
export function buscarResumo(): Promise<ResultadoApi<ResumoDoProfessor>> {
  return chamar<ResumoDoProfessor>('/api/turmas/resumo');
}

export function alunosDaTurma(turmaId: string): Promise<ResultadoApi<ListaDeAlunos>> {
  return chamar<ListaDeAlunos>(`/api/turmas/${encodeURIComponent(turmaId)}/alunos`);
}
