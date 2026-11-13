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
                           end,
                           'atividade_em', (
                               select max(msg.criado_em)
                               from conversas as c
                               join mensagens as msg on msg.conversa_id = c.id
                               where c.aluno_id = %(aluno)s::uuid and c.topico_id = t.id
                           )
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


def renomear_materia(db: psycopg.Connection, materia_id: UUID, nome: str) -> dict:
    return db.execute(
        "update materias set nome = %s where id = %s returning id, nome", (nome, materia_id)
    ).fetchone()


def renomear_topico(db: psycopg.Connection, topico_id: UUID, nome: str) -> dict:
    return db.execute(
        "update topicos set nome = %s where id = %s returning id, nome, ordem", (nome, topico_id)
    ).fetchone()


def mover_topico(db: psycopg.Connection, topico_id: UUID, direcao: str) -> list[dict]:
    """
    Troca o tópico de lugar com o vizinho e renumera a matéria de 1 a n. Renumerar tudo
    desfaz de quebra algum empate de ordem (dois tópicos criados no mesmo instante).
    """
    ids = [
        linha["id"]
        for linha in db.execute(
            """
            select id from topicos
            where materia_id = (select materia_id from topicos where id = %s)
            order by ordem, criado_em
            """,
            (topico_id,),
        ).fetchall()
    ]
    i = ids.index(topico_id)
    j = i - 1 if direcao == "cima" else i + 1
    if 0 <= j < len(ids):
        ids[i], ids[j] = ids[j], ids[i]
    for ordem, tid in enumerate(ids, start=1):
        db.execute("update topicos set ordem = %s where id = %s", (ordem, tid))
    return [{"id": tid, "ordem": ordem} for ordem, tid in enumerate(ids, start=1)]


def excluir_topico_vazio(db: psycopg.Connection, topico_id: UUID) -> bool:
    """Só apaga tópico sem conversa e sem PDF: nada que um aluno ou o professor fez se perde."""
    linha = db.execute(
        """
        delete from topicos as t
        where t.id = %s
          and not exists (select 1 from conversas as c where c.topico_id = t.id)
          and not exists (select 1 from materiais as m where m.topico_id = t.id)
        returning t.id
        """,
        (topico_id,),
    ).fetchone()
    return linha is not None


def excluir_materia_vazia(db: psycopg.Connection, materia_id: UUID) -> bool:
    linha = db.execute(
        """
        delete from materias as m
        where m.id = %s and not exists (select 1 from topicos as t where t.materia_id = m.id)
        returning m.id
        """,
        (materia_id,),
    ).fetchone()
    return linha is not None
