/** Chamadas do painel do coordenador. Quem filtra pela escola dele é o servidor. */
import { chamar, type ResultadoApi } from '@/services/api';
import type {
  AlunoPreCadastrado,
  EscolaDoCoordenador,
  ProfessorCriado,
  ProfessorDaEscola,
  TurmaDaEscola,
} from '@/types/api';

const BASE = '/api/coordenacao';
const id = encodeURIComponent;

function enviar<T>(caminho: string, corpo: object, method = 'POST'): Promise<ResultadoApi<T>> {
  return chamar<T>(`${BASE}${caminho}`, { method, body: JSON.stringify(corpo) });
}

export function buscarEscola(): Promise<ResultadoApi<EscolaDoCoordenador>> {
  return chamar<EscolaDoCoordenador>(`${BASE}/escola`);
}

export function listarTurmasDaEscola(): Promise<ResultadoApi<{ turmas: TurmaDaEscola[] }>> {
  return chamar(`${BASE}/turmas`);
}

export function criarTurmaDaEscola(nome: string, serie: string): Promise<ResultadoApi<TurmaDaEscola>> {
  return enviar('/turmas', { nome, serie });
}

export function listarAlunos(turmaId: string): Promise<ResultadoApi<{ alunos: AlunoPreCadastrado[] }>> {
  return chamar(`${BASE}/turmas/${id(turmaId)}/alunos`);
}

/** nascimento em AAAA-MM-DD. 409 = matrícula já usada na escola. */
export function preCadastrarAluno(
  turmaId: string,
  nome: string,
  matricula: string,
  nascimento: string,
): Promise<ResultadoApi<AlunoPreCadastrado>> {
  return enviar(`/turmas/${id(turmaId)}/alunos`, { nome, matricula, nascimento });
}

export function transferirAluno(alunoId: string, turmaId: string): Promise<ResultadoApi<unknown>> {
  return enviar(`/alunos/${id(alunoId)}/transferir`, { turma_id: turmaId });
}

export function removerAluno(alunoId: string): Promise<ResultadoApi<undefined>> {
  return chamar(`${BASE}/alunos/${id(alunoId)}`, { method: 'DELETE' });
}

export function listarProfessores(): Promise<ResultadoApi<{ professores: ProfessorDaEscola[] }>> {
  return chamar(`${BASE}/professores`);
}

export function criarProfessor(nome: string, email: string): Promise<ResultadoApi<ProfessorCriado>> {
  return enviar('/professores', { nome, email });
}

export function ligarProfessor(
  turmaId: string,
  nome: string,
  professorId: string,
): Promise<ResultadoApi<{ id: string; nome: string }>> {
  return enviar(`/turmas/${id(turmaId)}/materias`, { nome, professor_id: professorId });
}
