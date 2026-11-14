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

def professor_dono_da_materia(
    db: psycopg.Connection,
    materia_id: UUID,
    professor_id: str,
    escola_id: str,
) -> bool:
    linha = db.execute(
        """
        select 1
        from materias as m
        join turmas as t on t.id = m.turma_id
        where m.id = %s and t.professor_id = %s and t.escola_id = %s
        """,
        (materia_id, professor_id, escola_id),
    ).fetchone()
    return linha is not None


def professor_dono_do_topico(
    db: psycopg.Connection,
    topico_id: UUID,
    professor_id: str,
    escola_id: str,
) -> bool:
    linha = db.execute(
        """
        select 1
        from topicos as tp
        join materias as m on m.id = tp.materia_id
        join turmas as t on t.id = m.turma_id
        where tp.id = %s and t.professor_id = %s and t.escola_id = %s
        """,
        (topico_id, professor_id, escola_id),
    ).fetchone()
    return linha is not None


def aluno_da_turma_do_topico(db: psycopg.Connection, topico_id: UUID, aluno_id: str) -> bool:
    linha = db.execute(
        """
        select 1
        from topicos as tp
        join materias as m on m.id = tp.materia_id
        join matriculas as mt on mt.turma_id = m.turma_id
        where tp.id = %s and mt.aluno_id = %s
        """,
        (topico_id, aluno_id),
    ).fetchone()
    return linha is not None
