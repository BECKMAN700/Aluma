"""O SQL de matérias e tópicos contra o Postgres de verdade (migrations aplicadas pelo CI)."""

import os
import uuid

import psycopg
import pytest
from psycopg.rows import dict_row

from materiais import consultas
from nucleo import consultas as permissao
from turmas.consultas import gerar_codigo_turma

# Só no CI: na máquina da equipe o main.py carrega o .env, e o DATABASE_URL seria o Supabase real.
pytestmark = pytest.mark.skipif(
    not (os.getenv("CI") and os.getenv("DATABASE_URL")), reason="requer o Postgres do CI"
)


@pytest.fixture
def db():
    conn = psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row, prepare_threshold=None)
    yield conn
    conn.rollback()  # nada do teste fica no banco
    conn.close()


def nova_turma(db) -> tuple[str, str, str]:
    escola = db.execute("insert into escolas (nome) values ('Escola') returning id").fetchone()["id"]
    professor = str(uuid.uuid4())
    db.execute(
        "insert into perfis (id, nome, papel, escola_id) values (%s, 'Prof', 'professor', %s)",
        (professor, escola),
    )
    turma = db.execute(
        "insert into turmas (escola_id, professor_id, nome, serie, codigo)"
        " values (%s, %s, 'T', '8', %s) returning id",
        (escola, professor, gerar_codigo_turma()),
    ).fetchone()["id"]
    return turma, professor, str(escola)


def test_topicos_voltam_em_ordem_dentro_da_materia_certa(db):
    turma, professor, escola = nova_turma(db)
    vazia = consultas.criar_materia(db, turma, "Português")
    mat = consultas.criar_materia(db, turma, "Matemática")
    for nome in ("Frações", "Decimais", "Porcentagem"):
        consultas.criar_topico(db, mat["id"], nome)

    materias = consultas.materias_da_turma(db, turma)

    assert [m["nome"] for m in materias] == ["Português", "Matemática"]
    assert materias[0]["topicos"] == []
    assert [(t["nome"], t["ordem"]) for t in materias[1]["topicos"]] == [
        ("Frações", 1),
        ("Decimais", 2),
        ("Porcentagem", 3),
    ]
    assert permissao.professor_dono_da_materia(db, vazia["id"], professor, escola)
    assert not permissao.professor_dono_da_materia(db, vazia["id"], str(uuid.uuid4()), escola)


def test_reenviar_material_substitui_e_aparece_na_lista(db):
    turma, professor, escola = nova_turma(db)
    mat = consultas.criar_materia(db, turma, "Matemática")
    topico = consultas.criar_topico(db, mat["id"], "Frações")

    consultas.guardar_material(db, topico["id"], "v1.pdf", "texto antigo")
    salvo = consultas.guardar_material(db, topico["id"], "v2.pdf", "texto novo")

    assert salvo["caracteres"] == len("texto novo")
    assert db.execute("select count(*) as n from materiais where topico_id = %s", (topico["id"],)).fetchone()["n"] == 1
    assert consultas.materias_da_turma(db, turma)[0]["topicos"][0]["material"] == "v2.pdf"
    assert permissao.professor_dono_do_topico(db, topico["id"], professor, escola)
    assert not permissao.professor_dono_do_topico(db, topico["id"], str(uuid.uuid4()), escola)
