from datetime import date
from uuid import UUID

import psycopg

from coordenacao.consultas import COLUNAS_DA_MARCA


class ContaJaNaEscola(Exception):
    pass


def escola_do_convite(db: psycopg.Connection, convite: UUID) -> dict | None:
    """O que a tela do convite mostra antes do login: nome e marca da escola, nada de aluno."""
    return db.execute(
        f"select id, nome, {COLUNAS_DA_MARCA} from escolas where convite = %s", (convite,)
    ).fetchone()


def entrar_pelo_convite(
    db: psycopg.Connection, convite: UUID, login_id: str, matricula: str, nascimento: date
) -> dict | None:
    """
    A conta nova assume o pré-cadastro: o perfil vazio criado no login sai, e o pré-cadastro
    troca de id para o id do login (a matrícula vai junto, em cascata). Devolve escola e turma,
    ou None se os dados não batem ou o pré-cadastro já foi usado.
    """
    with db.transaction():
        alvo = db.execute(
            """
            select p.id, e.id as escola_id, e.nome as escola, t.id as turma_id, t.nome as turma
            from perfis as p
            join escolas as e on e.id = p.escola_id
            left join matriculas as mt on mt.aluno_id = p.id
            left join turmas as t on t.id = mt.turma_id
            where e.convite = %s and p.matricula = %s and p.nascimento = %s
              and p.papel = 'aluno' and p.entrou_em is null
            for update of p
            """,
            (convite, matricula, nascimento),
        ).fetchone()
        if alvo is None:
            return None
        # Só uma conta que ainda não é de escola nenhuma pode assumir o pré-cadastro.
        apagou = db.execute(
            "delete from perfis where id = %s and papel = 'aluno' and escola_id is null returning id",
            (login_id,),
        ).fetchone()
        if apagou is None:
            raise ContaJaNaEscola(login_id)
        db.execute(
            "update perfis set id = %s, entrou_em = now() where id = %s", (login_id, alvo["id"])
        )
    return {
        "escola": {"id": alvo["escola_id"], "nome": alvo["escola"]},
        "turma": {"id": alvo["turma_id"], "nome": alvo["turma"]} if alvo["turma_id"] else None,
    }
