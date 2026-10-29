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
