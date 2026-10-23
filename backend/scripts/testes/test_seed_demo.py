import os
import uuid

import psycopg
import pytest

from scripts import seed_demo

# Só no CI: na máquina da equipe o main.py carrega o .env, e o DATABASE_URL seria o Supabase real.
pytestmark = pytest.mark.skipif(
    not (os.getenv("CI") and os.getenv("DATABASE_URL")), reason="requer o Postgres do CI"
)


@pytest.fixture
def db(monkeypatch):
    # Login falso: o teste não fala com o Supabase, só com o Postgres do CI.
    monkeypatch.setattr(seed_demo, "criar_login", lambda email, senha: str(uuid.uuid4()))
    conn = psycopg.connect(os.environ["DATABASE_URL"], prepare_threshold=None)
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
    assert linha == ("aluno", seed_demo.ESCOLA)


def test_segunda_vez_nao_cria_nada(db):
    seed_demo.semear(db, "senha-de-teste")
    with pytest.raises(SystemExit):
        seed_demo.semear(db, "senha-de-teste")
