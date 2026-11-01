/**
 * Atalhos "Por onde começar?": abrem o chat já com a primeira mensagem enviada.
 * O endereço leva só o id, nunca o texto: um link de fora não consegue falar em nome do aluno.
 */
export const PARTIDAS = {
  exercicio: 'Travei num exercício',
  materia: 'Quero entender uma matéria',
  prova: 'Vou revisar para a prova',
} as const;

export type Partida = keyof typeof PARTIDAS;

export function textoDaPartida(id: string | undefined): string | null {
  return id && Object.hasOwn(PARTIDAS, id) ? PARTIDAS[id as Partida] : null;
}
