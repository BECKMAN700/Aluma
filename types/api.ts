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
  historico: ChatHistoryItem[];
}

export interface ChatResponse {
  resposta: string;
}

export interface ChatErrorResponse {
  erro: string;
}
