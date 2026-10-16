from uuid import UUID

import psycopg


def professor_dono_da_turma(
    db: psycopg.Connection,
    turma_id: UUID,
    professor_id: str,
    escola_id: str,
) -> bool:
    linha = db.execute(
        """
        select 1
        from turmas
        where id = %s and professor_id = %s and escola_id = %s
        """,
        (turma_id, professor_id, escola_id),
    ).fetchone()
    return linha is not None


def aluno_matriculado_na_turma(
    db: psycopg.Connection,
    turma_id: UUID,
    aluno_id: str,
) -> bool:
    linha = db.execute(
        """
        select 1
        from matriculas
        where turma_id = %s and aluno_id = %s
        """,
        (turma_id, aluno_id),
    ).fetchone()
    return linha is not None


def aluno_tem_turma(db: psycopg.Connection, aluno_id: str) -> bool:
    linha = db.execute(
        "select 1 from matriculas where aluno_id = %s",
        (aluno_id,),
    ).fetchone()
    return linha is not None