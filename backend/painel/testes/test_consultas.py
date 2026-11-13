"""O SQL do painel contra o Postgres de verdade (migrations aplicadas pelo CI)."""

import os
import uuid

import psycopg
import pytest
from psycopg.rows import dict_row

from chat import consultas as chat
from materiais import consultas as materiais
from painel import consultas
from turmas.consultas import gerar_codigo_turma

pytestmark = pytest.mark.skipif(
    not (os.getenv("CI") and os.getenv("DATABASE_URL")), reason="requer o Postgres do CI"
)


@pytest.fixture
def db():
    conn = psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row, prepare_threshold=None)
    yield conn
    conn.rollback()
    conn.close()


def novo_perfil(db, papel: str, escola=None) -> str:
    pid = str(uuid.uuid4())
    db.execute("insert into perfis (id, nome, papel, escola_id) values (%s, 'X', %s, %s)", (pid, papel, escola))
    return pid


def test_painel_conta_cada_aluno_uma_vez_e_resumo_substitui(db):
    escola = db.execute("insert into escolas (nome) values ('E') returning id").fetchone()["id"]
    professor = novo_perfil(db, "professor", escola)
    turma = db.execute(
        "insert into turmas (escola_id, professor_id, nome, serie, codigo) values (%s, %s, 'T', '9', %s) returning id",
        (escola, professor, gerar_codigo_turma()),
    ).fetchone()["id"]
    mat = materiais.criar_materia(db, turma, "Matemática")
    topico = materiais.criar_topico(db, mat["id"], "Frações")
    ana, bia, caio = (novo_perfil(db, "aluno") for _ in range(3))
    for aluno in (ana, bia, caio):
        db.execute("insert into matriculas (aluno_id, turma_id) values (%s, %s)", (aluno, turma))
    for aluno in (ana, bia):
        conversa = chat.criar_conversa(db, aluno, topico["id"])
        chat.gravar_troca(db, conversa, f"dúvida de {aluno[:4]}", "pergunta-guia")
    chat.marcar_dominado(db, ana, topico["id"])

    [linha] = consultas.painel_da_turma(db, turma)

    assert (linha["dominado"], linha["em_andamento"], linha["nao_iniciado"]) == (1, 1, 1)
    assert len(consultas.falas_dos_alunos(db, topico["id"], 10)) == 2
    consultas.guardar_resumo(db, topico["id"], "- v1")
    assert consultas.guardar_resumo(db, topico["id"], "- v2")["resumo"] == "- v2"
    assert consultas.painel_da_turma(db, turma)[0]["resumo"] == "- v2"
