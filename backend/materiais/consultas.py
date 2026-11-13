from uuid import UUID

import psycopg


def criar_materia(db: psycopg.Connection, turma_id: UUID, nome: str) -> dict:
    materia = db.execute(
        "insert into materias (turma_id, nome) values (%s, %s) returning id, nome",
        (turma_id, nome),
    ).fetchone()
    return {**materia, "topicos": []}


def materias_da_turma(db: psycopg.Connection, turma_id: UUID) -> list[dict]:
    """Cada matéria já com os tópicos em ordem: a tela faz uma chamada só."""
    return db.execute(
        """
        select m.id, m.nome,
               coalesce(
                   json_agg(
                       json_build_object('id', t.id, 'nome', t.nome, 'ordem', t.ordem)
                       order by t.ordem, t.criado_em
                   ) filter (where t.id is not null),
                   '[]'
               ) as topicos
        from materias as m
        left join topicos as t on t.materia_id = m.id
        where m.turma_id = %s
        group by m.id
        order by m.criado_em
        """,
        (turma_id,),
    ).fetchall()


def criar_topico(db: psycopg.Connection, materia_id: UUID, nome: str) -> dict:
    # shortcut: dois envios no mesmo instante podem ganhar a mesma ordem; o desempate é criado_em.
    return db.execute(
        """
        insert into topicos (materia_id, nome, ordem)
        select %s, %s, coalesce(max(ordem), 0) + 1
        from topicos
        where materia_id = %s
        returning id, nome, ordem
        """,
        (materia_id, nome, materia_id),
    ).fetchone()
