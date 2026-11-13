import { chamar, type ResultadoApi } from '@/services/api';
import type { ListaDeMaterias, MaterialEnviado, Materia, ResultadoDominar, Topico } from '@/types/api';

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

/**
 * Envia o PDF cru no corpo (sem formulário multipart): o servidor para de ler em 5 MB.
 * `uri` é o que o seletor de arquivos devolve, no celular e na web.
 */
export async function enviarMaterial(
  topicoId: string,
  uri: string,
  nomeArquivo: string,
): Promise<ResultadoApi<MaterialEnviado>> {
  let arquivo: Blob;
  try {
    arquivo = await (await fetch(uri)).blob();
  } catch {
    return { ok: false, status: 0, erro: 'Não foi possível abrir o arquivo escolhido.' };
  }
  return chamar<MaterialEnviado>(`/api/topicos/${encodeURIComponent(topicoId)}/materiais`, {
    method: 'POST',
    body: arquivo,
    // Cabeçalho HTTP não aceita acento: o nome vai codificado e o servidor decodifica.
    headers: { 'Content-Type': 'application/pdf', 'X-Nome-Arquivo': encodeURIComponent(nomeArquivo) },
  });
}

/** Pede ao servidor para avaliar o desafio do tópico. Quem julga é uma IA no servidor, não o app. */
export function dominarTopico(topicoId: string): Promise<ResultadoApi<ResultadoDominar>> {
  return chamar<ResultadoDominar>(`/api/topicos/${encodeURIComponent(topicoId)}/dominar`, { method: 'POST' });
}
