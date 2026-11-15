"""
SQL do coordenador. Toda consulta recebe a escola dele e filtra por ela: turma, aluno ou
professor de outra escola simplesmente não existe aqui (regra inviolável 7).
"""

from datetime import date
from uuid import UUID

import psycopg


class MatriculaRepetida(Exception):
    pass


def turmas_da_escola(db: psycopg.Connection, escola_id: str) -> list[dict]:
    return db.execute(
        """
        select t.id, t.nome, t.serie,
               (select count(*) from matriculas as mt where mt.turma_id = t.id) as alunos,
               coalesce(
                   (select json_agg(
                               json_build_object('id', m.id, 'nome', m.nome, 'professor', p.nome)
                               order by m.nome)
                    from materias as m join perfis as p on p.id = m.professor_id
                    where m.turma_id = t.id),
                   '[]'
               ) as materias
        from turmas as t
        where t.escola_id = %s
        order by t.nome
        """,
        (escola_id,),
    ).fetchall()


def turma_da_escola(db: psycopg.Connection, turma_id: UUID, escola_id: str) -> bool:
    return db.execute(
        "select 1 from turmas where id = %s and escola_id = %s", (turma_id, escola_id)
    ).fetchone() is not None


def professor_da_escola(db: psycopg.Connection, professor_id: UUID, escola_id: str) -> bool:
    return db.execute(
        "select 1 from perfis where id = %s and escola_id = %s and papel = 'professor'",
        (professor_id, escola_id),
    ).fetchone() is not None


def alunos_da_turma(db: psycopg.Connection, turma_id: UUID, escola_id: str) -> list[dict]:
    """Com a matrícula e se já entrou pelo convite. A data de nascimento não sai daqui."""
    return db.execute(
        """
        select p.id, p.nome, p.matricula, p.entrou_em is not null as entrou
        from matriculas as mt
        join perfis as p on p.id = mt.aluno_id
        join turmas as t on t.id = mt.turma_id
        where mt.turma_id = %s and t.escola_id = %s and p.papel = 'aluno'
        order by p.nome
        """,
        (turma_id, escola_id),
    ).fetchall()


def pre_cadastrar_aluno(
    db: psycopg.Connection,
    escola_id: str,
    turma_id: UUID,
    nome: str,
    matricula: str,
    nascimento: date,
) -> dict:
    """O aluno nasce sem login (entrou_em vazio) e já matriculado na turma."""
    try:
        with db.transaction():  # savepoint: a matrícula repetida desfaz só isto
            aluno = db.execute(
                """
                insert into perfis (id, nome, papel, escola_id, matricula, nascimento, entrou_em)
                values (gen_random_uuid(), %s, 'aluno', %s, %s, %s, null)
                returning id, nome, matricula, false as entrou
                """,
                (nome, escola_id, matricula, nascimento),
            ).fetchone()
            db.execute(
                "insert into matriculas (aluno_id, turma_id) values (%s, %s)", (aluno["id"], turma_id)
            )
    except psycopg.errors.UniqueViolation:
        raise MatriculaRepetida(matricula) from None
    return aluno


def transferir_aluno(
    db: psycopg.Connection, aluno_id: UUID, turma_id: UUID, escola_id: str
) -> bool:
    """Aluno e turma de destino precisam ser da escola. O histórico dele fica com ele."""
    linha = db.execute(
        """
        update matriculas as mt set turma_id = %(turma)s
        from perfis as p
        where mt.aluno_id = %(aluno)s and p.id = mt.aluno_id
          and p.escola_id = %(escola)s and p.papel = 'aluno'
          and exists (select 1 from turmas where id = %(turma)s and escola_id = %(escola)s)
        returning mt.aluno_id
        """,
        {"aluno": aluno_id, "turma": turma_id, "escola": escola_id},
    ).fetchone()
    return linha is not None


def remover_aluno(db: psycopg.Connection, aluno_id: UUID, escola_id: str) -> bool:
    """Saiu da escola: apaga as conversas (e as mensagens, em cascata), o progresso e o perfil."""
    if db.execute(
        "select 1 from perfis where id = %s and escola_id = %s and papel = 'aluno'",
        (aluno_id, escola_id),
    ).fetchone() is None:
        return False
    db.execute("delete from progresso where aluno_id = %s", (aluno_id,))
    db.execute("delete from conversas where aluno_id = %s", (aluno_id,))
    db.execute("delete from matriculas where aluno_id = %s", (aluno_id,))
    db.execute("delete from perfis where id = %s", (aluno_id,))
    # shortcut: o login do aluno continua no Supabase; se ele entrar de novo, ganha um perfil
    # vazio, sem escola, que não acessa nada. Apagar pelo admin do Supabase se virar problema.
    return True


def professores_da_escola(db: psycopg.Connection, escola_id: str) -> list[dict]:
    return db.execute(
        """
        select p.id, p.nome,
               (select count(*) from materias as m where m.professor_id = p.id) as materias
        from perfis as p
        where p.escola_id = %s and p.papel = 'professor'
        order by p.nome
        """,
        (escola_id,),
    ).fetchall()


def criar_perfil_professor(
    db: psycopg.Connection, professor_id: str, nome: str, escola_id: str
) -> dict:
    return db.execute(
        """
        insert into perfis (id, nome, papel, escola_id, trocar_senha)
        values (%s, %s, 'professor', %s, true)
        returning id, nome, 0 as materias
        """,
        (professor_id, nome, escola_id),
    ).fetchone()
