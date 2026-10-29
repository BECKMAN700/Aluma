from uuid import UUID

import psycopg


def conversa_do_aluno(db: psycopg.Connection, aluno_id: str) -> UUID | None:
    """A conversa em andamento do aluno: a mais recente sem tópico (os tópicos chegam na Sprint 4)."""
    linha = db.execute(
        """
        select id
        from conversas
        where aluno_id = %s and topico_id is null
        order by criado_em desc
        limit 1
        """,
        (aluno_id,),
    ).fetchone()
    return linha["id"] if linha else None


def criar_conversa(db: psycopg.Connection, aluno_id: str) -> UUID:
    return db.execute(
        "insert into conversas (aluno_id) values (%s) returning id",
        (aluno_id,),
    ).fetchone()["id"]


def ultimas_mensagens(db: psycopg.Connection, conversa_id: UUID, limite: int) -> list[dict]:
    """As `limite` mensagens mais recentes, da mais antiga para a mais nova."""
    return db.execute(
        """
        select autor, texto
        from (
            select autor, texto, criado_em
            from mensagens
            where conversa_id = %s
            order by criado_em desc
            limit %s
        ) as recentes
        order by criado_em
        """,
        (conversa_id, limite),
    ).fetchall()


def gravar_troca(
    db: psycopg.Connection, conversa_id: UUID, texto_aluno: str, texto_tutor: str
) -> None:
    # clock_timestamp(), não now(): o now() é a hora do início da transação, e as duas
    # mensagens empatariam, deixando a ordem da conversa ao acaso.
    for autor, texto in (("aluno", texto_aluno), ("tutor", texto_tutor)):
        db.execute(
            """
            insert into mensagens (conversa_id, autor, texto, criado_em)
            values (%s, %s, %s, clock_timestamp())
            """,
            (conversa_id, autor, texto),
        )
