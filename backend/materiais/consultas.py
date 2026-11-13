from uuid import UUID

import psycopg


def criar_materia(db: psycopg.Connection, turma_id: UUID, nome: str) -> dict:
    materia = db.execute(
        "insert into materias (turma_id, nome) values (%s, %s) returning id, nome",
        (turma_id, nome),
    ).fetchone()
    return {**materia, "topicos": []}


def materias_da_turma(
    db: psycopg.Connection, turma_id: UUID, aluno_id: str | None = None
) -> list[dict]:
    """
    Cada matéria já com os tópicos em ordem: a tela faz uma chamada só. Com `aluno_id`, cada
    tópico ganha o status dele: em andamento se já houve troca com o tutor naquele tópico.
    """
    return db.execute(
        """
        select m.id, m.nome,
               coalesce(
                   json_agg(
                       json_build_object(
                           'id', t.id, 'nome', t.nome, 'ordem', t.ordem, 'material', mat.nome_arquivo,
                           'status', case
                               when %(aluno)s::uuid is null then null
                               when exists (
                                   select 1 from progresso as p
                                   where p.aluno_id = %(aluno)s::uuid and p.topico_id = t.id
                               ) then 'dominado'
                               when exists (
                                   select 1
                                   from conversas as c
                                   join mensagens as msg on msg.conversa_id = c.id
                                   where c.aluno_id = %(aluno)s::uuid and c.topico_id = t.id
                               ) then 'em_andamento'
                               else 'nao_iniciado'
                           end
                       )
                       order by t.ordem, t.criado_em
                   ) filter (where t.id is not null),
                   '[]'
               ) as topicos
        from materias as m
        left join topicos as t on t.materia_id = m.id
        left join materiais as mat on mat.topico_id = t.id
        where m.turma_id = %(turma)s
        group by m.id
        order by m.criado_em
        """,
        {"turma": turma_id, "aluno": aluno_id},
    ).fetchall()


def criar_topico(db: psycopg.Connection, materia_id: UUID, nome: str) -> dict:
    # shortcut: dois envios no mesmo instante podem ganhar a mesma ordem; o desempate é criado_em.
    return db.execute(
        """
        insert into topicos (materia_id, nome, ordem)
        select %s, %s, coalesce(max(ordem), 0) + 1
        from topicos
        where materia_id = %s
        returning id, nome, ordem, null::text as material
        """,
        (materia_id, nome, materia_id),
    ).fetchone()


def guardar_material(db: psycopg.Connection, topico_id: UUID, nome_arquivo: str, texto: str) -> dict:
    """Um material por tópico: enviar de novo substitui o anterior."""
    return db.execute(
        """
        insert into materiais (topico_id, nome_arquivo, texto)
        values (%s, %s, %s)
        on conflict (topico_id) do update
            set nome_arquivo = excluded.nome_arquivo, texto = excluded.texto, criado_em = now()
        returning topico_id, nome_arquivo, length(texto) as caracteres
        """,
        (topico_id, nome_arquivo, texto),
    ).fetchone()
