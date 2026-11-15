"""SQL dos projetos do aluno. Toda consulta filtra pelo aluno: projeto de outro não existe aqui."""

from uuid import UUID

import psycopg

# Um teto simples contra quem tenta encher o banco; um aluno de verdade não chega perto.
MAXIMO_DE_PROJETOS = 30


def projetos_do_aluno(db: psycopg.Connection, aluno_id: str) -> list[dict]:
    """Cada projeto com as conversas dele, a mais recente primeiro."""
    return db.execute(
        """
        select p.id, p.nome,
               coalesce(
                   (select json_agg(json_build_object('id', c.id, 'titulo', c.titulo) order by c.criado_em desc)
                    from conversas as c where c.projeto_id = p.id),
                   '[]'
               ) as conversas
        from projetos as p
        where p.aluno_id = %s
        order by p.criado_em desc
        """,
        (aluno_id,),
    ).fetchall()


def criar_projeto(db: psycopg.Connection, aluno_id: str, nome: str) -> dict | None:
    """None quando o aluno já chegou ao teto."""
    return db.execute(
        """
        insert into projetos (aluno_id, nome)
        select %s, %s
        where (select count(*) from projetos where aluno_id = %s) < %s
        returning id, nome, '[]'::json as conversas
        """,
        (aluno_id, nome, aluno_id, MAXIMO_DE_PROJETOS),
    ).fetchone()


def apagar_projeto(db: psycopg.Connection, projeto_id: UUID, aluno_id: str) -> bool:
    """As conversas e mensagens vão junto (on delete cascade)."""
    return db.execute(
        "delete from projetos where id = %s and aluno_id = %s returning id", (projeto_id, aluno_id)
    ).fetchone() is not None


def nova_conversa(db: psycopg.Connection, projeto_id: UUID, aluno_id: str) -> dict | None:
    return db.execute(
        """
        insert into conversas (aluno_id, projeto_id)
        select %s, p.id from projetos as p where p.id = %s and p.aluno_id = %s
        returning id, titulo
        """,
        (aluno_id, projeto_id, aluno_id),
    ).fetchone()


def conversa_de_projeto_do_aluno(db: psycopg.Connection, conversa_id: UUID, aluno_id: str) -> bool:
    return db.execute(
        "select 1 from conversas where id = %s and aluno_id = %s and projeto_id is not null",
        (conversa_id, aluno_id),
    ).fetchone() is not None


def dar_titulo(db: psycopg.Connection, conversa_id: UUID, primeira_mensagem: str) -> None:
    """A conversa ganha o começo da primeira pergunta como nome, como no app do Claude."""
    titulo = " ".join(primeira_mensagem.split())[:60]
    db.execute(
        "update conversas set titulo = %s where id = %s and titulo is null", (titulo, conversa_id)
    )
