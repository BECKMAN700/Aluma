import os
import uuid

import psycopg
import pytest
from psycopg.rows import dict_row

from scripts import seed_demo

# Só no CI: na máquina da equipe o main.py carrega o .env, e o DATABASE_URL seria o Supabase real.
pytestmark = pytest.mark.skipif(
    not (os.getenv("CI") and os.getenv("DATABASE_URL")), reason="requer o Postgres do CI"
)


@pytest.fixture
def db(monkeypatch):
    # Login falso: o teste não fala com o Supabase, só com o Postgres do CI.
    monkeypatch.setattr(seed_demo, "criar_login", lambda email, senha: str(uuid.uuid4()))
    conn = psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row, prepare_threshold=None)
    yield conn
    conn.rollback()  # nada do teste fica no banco
    conn.close()


def test_cria_aluno_matriculado_na_turma_da_escola_ficticia(db):
    codigo = seed_demo.semear(db, "senha-de-teste")

    linha = db.execute(
        """
        select p.papel, e.nome
        from matriculas m
        join turmas t on t.id = m.turma_id
        join perfis p on p.id = m.aluno_id
        join escolas e on e.id = t.escola_id
        where t.codigo = %s
        """,
        (codigo,),
    ).fetchone()
    assert linha == {"papel": "aluno", "nome": seed_demo.ESCOLA}


def test_segunda_vez_nao_cria_nada(db):
    seed_demo.semear(db, "senha-de-teste")
    with pytest.raises(SystemExit):
        seed_demo.semear(db, "senha-de-teste")


def test_trilha_vem_com_tres_topicos_em_ordem_e_material(db):
    from materiais.consultas import materias_da_turma

    codigo = seed_demo.semear(db, "senha-de-teste")
    turma = db.execute("select id from turmas where codigo = %s", (codigo,)).fetchone()["id"]

    [materia] = materias_da_turma(db, turma)
    assert materia["nome"] == seed_demo.MATERIA
    assert [t["nome"] for t in materia["topicos"]] == [nome for nome, _ in seed_demo.TOPICOS]
    assert all(t["material"] for t in materia["topicos"])
    with pytest.raises(SystemExit):  # rodar --trilha de novo não duplica
        seed_demo.semear_trilha(db)
