import os
import uuid

import psycopg
import pytest
from psycopg.rows import dict_row

from materiais.consultas import materias_da_turma
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
    seed_demo.limpar(conn)  # outra execução no mesmo banco não atrapalha
    yield conn
    conn.rollback()  # nada do teste fica no banco
    conn.close()


def test_cria_duas_escolas_com_marca_e_papeis(db):
    criadas = seed_demo.semear(db, "senha-de-teste")

    assert [c["escola"] for c in criadas] == [e["nome"] for e in seed_demo.ESCOLAS]
    linhas = db.execute(
        """
        select e.nome_da_ia, p.papel, count(*) as n, count(*) filter (where p.entrou_em is null) as pre
        from perfis p join escolas e on e.id = p.escola_id
        where e.nome like %s group by e.nome_da_ia, p.papel order by 1, 2
        """,
        (f"%{seed_demo.SINAL}",),
    ).fetchall()
    for ia in ("Iara", "Luma"):
        por_papel = {r["papel"]: (r["n"], r["pre"]) for r in linhas if r["nome_da_ia"] == ia}
        assert por_papel == {"aluno": (4, 3), "coordenador": (1, 0), "professor": (2, 0)}


def test_segunda_vez_nao_cria_nada(db):
    seed_demo.semear(db, "senha-de-teste")
    with pytest.raises(SystemExit):
        seed_demo.semear(db, "senha-de-teste")


def test_trilha_de_matematica_com_material_e_limpar_apaga_tudo(db):
    seed_demo.semear(db, "senha-de-teste")
    turma = db.execute(
        "select t.id from turmas t join escolas e on e.id = t.escola_id where e.nome = %s",
        (seed_demo.ESCOLAS[0]["nome"],),
    ).fetchone()["id"]

    materias = {m["nome"]: m for m in materias_da_turma(db, turma)}
    assert sorted(materias) == ["Matemática", "Português"]
    topicos = materias[seed_demo.MATERIA]["topicos"]
    assert [t["nome"] for t in topicos] == [nome for nome, _ in seed_demo.TOPICOS]
    assert all(t["material"] for t in topicos)

    logins = seed_demo.limpar(db)
    assert len(logins) == 8  # 4 contas com login por escola; pré-cadastro não tem login
    assert db.execute("select 1 from escolas where nome like %s", (f"%{seed_demo.SINAL}",)).fetchone() is None
