from uuid import UUID

import psycopg
from psycopg.rows import dict_row


def criar_turma(db: psycopg.Connection, escola_id: UUID, nome: str, serie: str) -> dict:
    """Quem cria é o coordenador; os professores entram depois, um por matéria."""
    return db.execute(
        "insert into turmas (escola_id, nome, serie) values (%s, %s, %s) returning id, nome, serie",
        (escola_id, nome, serie),
    ).fetchone()


def turmas_do_professor(
    db: psycopg.Connection,
    professor_id: UUID,
) -> list[dict]:
    """As turmas em que o professor tem pelo menos uma matéria."""
    with db.cursor(row_factory=dict_row) as cursor:
        cursor.execute(
            """
            SELECT t.id, t.nome, t.serie
            FROM turmas AS t
            WHERE EXISTS (
                SELECT 1 FROM materias AS m
                WHERE m.turma_id = t.id AND m.professor_id = %s
            )
            ORDER BY t.nome
            """,
            (professor_id,),
        )
        return cursor.fetchall()


def alunos_da_turma(
    db: psycopg.Connection,
    turma_id: UUID,
) -> list[dict]:
    """Retorna os alunos matriculados na turma."""
    with db.cursor(row_factory=dict_row) as cursor:
        cursor.execute(
            """
            SELECT p.id, p.nome
            FROM matriculas AS m
            JOIN perfis AS p ON p.id = m.aluno_id
            WHERE m.turma_id = %s
              AND p.papel = 'aluno'
            ORDER BY p.nome
            """,
            (turma_id,),
        )
        return cursor.fetchall()
