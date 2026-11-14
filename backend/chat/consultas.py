from uuid import UUID

import psycopg


def conversa_do_aluno(
    db: psycopg.Connection, aluno_id: str, topico_id: UUID | None = None
) -> UUID | None:
    """A conversa em andamento do aluno naquele tópico; sem tópico, a do chat geral."""
    linha = db.execute(
        """
        select id
        from conversas
        where aluno_id = %s and topico_id is not distinct from %s::uuid
        order by criado_em desc
        limit 1
        """,
        (aluno_id, topico_id),
    ).fetchone()
    return linha["id"] if linha else None


def criar_conversa(db: psycopg.Connection, aluno_id: str, topico_id: UUID | None = None) -> UUID:
    return db.execute(
        "insert into conversas (aluno_id, topico_id) values (%s, %s) returning id",
        (aluno_id, topico_id),
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


def material_do_topico(db: psycopg.Connection, topico_id: UUID) -> str | None:
    linha = db.execute("select texto from materiais where topico_id = %s", (topico_id,)).fetchone()
    return linha["texto"] if linha else None
