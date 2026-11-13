from uuid import UUID

import psycopg


def painel_da_turma(db: psycopg.Connection, turma_id: UUID) -> list[dict]:
    """
    Por tópico, quantos alunos da turma dominaram, estão em andamento (já trocaram mensagem
    com o tutor naquele tópico) ou não começaram. Só números: nenhuma conversa sai daqui.
    """
    return db.execute(
        """
        with alunos as (
            select aluno_id from matriculas where turma_id = %(turma)s
        ),
        por_topico as (
            select tp.id, tp.nome, tp.ordem, tp.criado_em, m.nome as materia, m.criado_em as materia_em,
                   (select count(*) from alunos as a
                    where exists (
                        select 1 from progresso as p
                        where p.aluno_id = a.aluno_id and p.topico_id = tp.id
                    )) as dominado,
                   (select count(*) from alunos as a
                    where not exists (
                        select 1 from progresso as p
                        where p.aluno_id = a.aluno_id and p.topico_id = tp.id
                    )
                    and exists (
                        select 1 from conversas as c
                        join mensagens as msg on msg.conversa_id = c.id
                        where c.aluno_id = a.aluno_id and c.topico_id = tp.id
                    )) as em_andamento,
                   (select count(*) from alunos) as total
            from topicos as tp
            join materias as m on m.id = tp.materia_id
            where m.turma_id = %(turma)s
        )
        select pt.id, pt.nome, pt.ordem, pt.materia, pt.dominado, pt.em_andamento,
               pt.total - pt.dominado - pt.em_andamento as nao_iniciado,
               r.texto as resumo, r.criado_em as resumo_em
        from por_topico as pt
        left join resumos_de_duvidas as r on r.topico_id = pt.id
        order by pt.materia_em, pt.ordem, pt.criado_em
        """,
        {"turma": turma_id},
    ).fetchall()


def falas_dos_alunos(db: psycopg.Connection, topico_id: UUID, limite: int) -> list[str]:
    """Só o texto das falas de aluno no tópico, as mais recentes, sem quem disse."""
    linhas = db.execute(
        """
        select msg.texto
        from mensagens as msg
        join conversas as c on c.id = msg.conversa_id
        where c.topico_id = %s and msg.autor = 'aluno'
        order by msg.criado_em desc
        limit %s
        """,
        (topico_id, limite),
    ).fetchall()
    return [linha["texto"] for linha in linhas]


def guardar_resumo(db: psycopg.Connection, topico_id: UUID, texto: str) -> dict:
    return db.execute(
        """
        insert into resumos_de_duvidas (topico_id, texto) values (%s, %s)
        on conflict (topico_id) do update set texto = excluded.texto, criado_em = now()
        returning texto as resumo, criado_em as resumo_em
        """,
        (topico_id, texto),
    ).fetchone()
