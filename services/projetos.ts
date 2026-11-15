/** Projetos do aluno: pastas com várias conversas, só dele (o professor não vê). */
import { chamar, type ResultadoApi } from '@/services/api';
import type { ConversaAtual, Projeto } from '@/types/api';

const id = encodeURIComponent;

export function listarProjetos(): Promise<ResultadoApi<{ projetos: Projeto[] }>> {
  return chamar('/api/projetos');
}

/** 409 = chegou ao limite de projetos. */
export function criarProjeto(nome: string): Promise<ResultadoApi<Projeto>> {
  return chamar('/api/projetos', { method: 'POST', body: JSON.stringify({ nome }) });
}

export function apagarProjeto(projetoId: string): Promise<ResultadoApi<undefined>> {
  return chamar(`/api/projetos/${id(projetoId)}`, { method: 'DELETE' });
}

export function novaConversaNoProjeto(projetoId: string): Promise<ResultadoApi<{ id: string; titulo: string | null }>> {
  return chamar(`/api/projetos/${id(projetoId)}/conversas`, { method: 'POST' });
}

export function mensagensDaConversa(conversaId: string): Promise<ResultadoApi<ConversaAtual>> {
  return chamar(`/api/conversas/${id(conversaId)}/mensagens`);
}
