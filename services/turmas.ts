import { chamar, type ResultadoApi } from '@/services/api';
import type { ListaDeAlunos, ListaDeTurmas, Turma } from '@/types/api';

/** Só as turmas do professor logado: quem filtra é o servidor. */
export function listarTurmas(): Promise<ResultadoApi<ListaDeTurmas>> {
  return chamar<ListaDeTurmas>('/api/turmas');
}

export function criarTurma(nome: string, serie: string): Promise<ResultadoApi<Turma>> {
  return chamar<Turma>('/api/turmas', {
    method: 'POST',
    body: JSON.stringify({ nome, serie }),
  });
}

export function alunosDaTurma(turmaId: string): Promise<ResultadoApi<ListaDeAlunos>> {
  return chamar<ListaDeAlunos>(`/api/turmas/${encodeURIComponent(turmaId)}/alunos`);
}
