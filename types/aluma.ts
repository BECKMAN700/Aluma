export interface Aluno {
  id: string;
  nome: string;
  serie: string;
  turmaId: string;
}

export interface Professor {
  id: string;
  nome: string;
  materias: string[];
}

export interface Turma {
  id: string;
  nome: string;
  serie: string;
  professorId: string;
  alunosIds: string[];
}

export interface Materia {
  id: string;
  nome: string;
}

export interface Duvida {
  id: string;
  alunoId: string;
  materiaId: string;
  pergunta: string;
  resolvida: boolean;
  criadaEm: Date;
}

export interface Mensagem {
  id: string;
  autor: 'aluno' | 'tutor';
  texto: string;
  enviadaEm: Date;
}
