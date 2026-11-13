/**
 * Formatos que a API do Aluma recebe e devolve. O contrato de cada rota está em
 * docs/arquitetura.md; mudou lá, mude aqui no mesmo PR.
 */

/** Contrato de POST /api/chat (backend/chat/rotas.py e backend/chat/esquemas.py). */
export type ChatApiAuthor = 'aluno' | 'tutor';

export interface ChatHistoryItem {
  autor: ChatApiAuthor;
  texto: string;
}

export interface ChatRequestBody {
  mensagem: string;
  // Só o professor manda; o histórico do aluno o servidor lê do banco.
  historico?: ChatHistoryItem[];
  /** Sem tópico = chat geral. Com tópico, o tutor usa o PDF do professor. */
  topico_id?: string;
}

/** Contrato de GET /api/conversas/atual: as últimas mensagens do aluno, da mais antiga à mais nova. */
export interface ConversaAtual {
  mensagens: ChatHistoryItem[];
}

export interface ChatResponse {
  resposta: string;
}

export interface ChatErrorResponse {
  erro: string;
}

/** Contrato de GET /api/me (backend/turmas/rotas_matriculas.py). */
export type Papel = 'aluno' | 'professor';

export interface Me {
  id: string;
  nome: string;
  papel: Papel;
  escola: { id: string; nome: string } | null;
  turma: { id: string; nome: string } | null;
}

/** Contrato de POST /api/matriculas. */
export interface MatriculaResponse {
  turma: { id: string; nome: string };
}

/** Contrato de /api/turmas (backend/turmas/rotas.py). */
export interface Turma {
  id: string;
  nome: string;
  serie: string;
  codigo: string;
}

export interface ListaDeTurmas {
  turmas: Turma[];
}

/** Só id e nome: o professor nunca recebe a conversa do aluno. */
export interface AlunoDaTurma {
  id: string;
  nome: string;
}

export interface ListaDeAlunos {
  alunos: AlunoDaTurma[];
}

/** Contrato de /api/turmas/{id}/materias e /api/materias/{id}/topicos (backend/materiais/rotas.py). */
export interface Topico {
  id: string;
  nome: string;
  ordem: number;
  /** Nome do PDF do tópico; null enquanto o professor não enviou. */
  material: string | null;
  /** Só para o aluno: sai da conversa salva (já conversou sobre o tópico = em andamento). */
  status?: StatusDoTopico | null;
  /** Só para o aluno: hora da última mensagem dele no tópico (ISO). Null se nunca conversou. */
  atividade_em?: string | null;
}

export type StatusDoTopico = 'nao_iniciado' | 'em_andamento' | 'dominado';

/** Contrato de POST /api/topicos/{id}/dominar: a frase já vem pronta para a tela. */
export interface ResultadoDominar {
  dominado: boolean;
  mensagem: string;
}

/** Contrato de POST /api/topicos/{id}/materiais. */
export interface MaterialEnviado {
  topico_id: string;
  nome_arquivo: string;
  caracteres: number;
}

export interface Materia {
  id: string;
  nome: string;
  /** Já em ordem: a tela não reordena. */
  topicos: Topico[];
}

export interface ListaDeMaterias {
  materias: Materia[];
}

/** Contrato de GET /api/turmas/{id}/painel (backend/painel/rotas.py). */
export interface TopicoNoPainel {
  id: string;
  nome: string;
  ordem: number;
  materia: string;
  dominado: number;
  em_andamento: number;
  nao_iniciado: number;
  /** Uma dúvida por linha, começando com "- ". Null até o professor pedir. */
  resumo: string | null;
  resumo_em: string | null;
}

export interface PainelDaTurma {
  topicos: TopicoNoPainel[];
}

export interface ResumoDeDuvidas {
  resumo: string;
  resumo_em: string;
}
