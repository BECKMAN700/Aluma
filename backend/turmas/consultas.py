import secrets
from uuid import UUID

import psycopg
from psycopg import errors
from psycopg.rows import dict_row


ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def gerar_codigo_turma() -> str:
    """Gera um código de turma com seis caracteres sem símbolos ambíguos."""
    return "".join(
        secrets.choice(ALFABETO_CODIGO)
        for _ in range(6)
    )


def criar_turma(
    db: psycopg.Connection,
    escola_id: UUID,
    professor_id: UUID,
    nome: str,
    serie: str,
) -> dict:
    """Cria uma turma e tenta outro código se houver colisão."""
    for tentativa in range(5):
        codigo = gerar_codigo_turma()

        try:
            with db.transaction():
                with db.cursor(row_factory=dict_row) as cursor:
                    cursor.execute(
                        """
                        INSERT INTO turmas (
                            escola_id,
                            professor_id,
                            nome,
                            serie,
                            codigo
                        )
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING id, nome, serie, codigo
                        """,
                        (escola_id, professor_id, nome, serie, codigo),
                    )
                    turma = cursor.fetchone()

            if turma is None:
                raise RuntimeError("a turma nao foi retornada pelo banco")

            return turma

        except errors.UniqueViolation as erro:
            if erro.diag.constraint_name != "turmas_codigo_key":
                raise

            if tentativa == 4:
                raise

    raise RuntimeError("nao foi possivel gerar um codigo unico")


def turmas_do_professor(
    db: psycopg.Connection,
    professor_id: UUID,
) -> list[dict]:
    """Retorna somente as turmas do professor informado."""
    with db.cursor(row_factory=dict_row) as cursor:
        cursor.execute(
            """
            SELECT id, nome, serie, codigo
            FROM turmas
            WHERE professor_id = %s
            ORDER BY criado_em DESC
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