import { chamar, type ResultadoApi } from '@/services/api';
import type { ListaDeMaterias, Materia, Topico } from '@/types/api';

/** Matérias da turma, cada uma com os tópicos em ordem. Turma de outro professor: 404. */
export function listarMaterias(turmaId: string): Promise<ResultadoApi<ListaDeMaterias>> {
  return chamar<ListaDeMaterias>(`/api/turmas/${encodeURIComponent(turmaId)}/materias`);
}

export function criarMateria(turmaId: string, nome: string): Promise<ResultadoApi<Materia>> {
  return chamar<Materia>(`/api/turmas/${encodeURIComponent(turmaId)}/materias`, {
    method: 'POST',
    body: JSON.stringify({ nome }),
  });
}

/** A ordem quem define é o servidor: o tópico novo entra no fim. */
export function criarTopico(materiaId: string, nome: string): Promise<ResultadoApi<Topico>> {
  return chamar<Topico>(`/api/materias/${encodeURIComponent(materiaId)}/topicos`, {
    method: 'POST',
    body: JSON.stringify({ nome }),
  });
}
