"""Projetos do aluno contra o Postgres de verdade: privados e fora da conversa geral."""

import os
import uuid

import psycopg
import pytest
from psycopg.rows import dict_row

from chat import consultas as chat
from projetos import consultas

pytestmark = pytest.mark.skipif(
    not (os.getenv("CI") and os.getenv("DATABASE_URL")), reason="requer o Postgres do CI"
)


@pytest.fixture
def db():
    conn = psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row, prepare_threshold=None)
    yield conn
    conn.rollback()
    conn.close()


def aluno(db) -> str:
    aid = str(uuid.uuid4())
    db.execute("insert into perfis (id, nome, papel) values (%s, 'A', 'aluno')", (aid,))
    return aid


def test_projeto_e_conversas_so_do_dono(db):
    ana, bia = aluno(db), aluno(db)
    projeto = consultas.criar_projeto(db, ana, "Feira de ciências")
    conversa = consultas.nova_conversa(db, projeto["id"], ana)

    assert consultas.nova_conversa(db, projeto["id"], bia) is None
    assert consultas.conversa_de_projeto_do_aluno(db, conversa["id"], ana)
    assert not consultas.conversa_de_projeto_do_aluno(db, conversa["id"], bia)
    assert consultas.projetos_do_aluno(db, bia) == []
    assert not consultas.apagar_projeto(db, projeto["id"], bia)

    chat.gravar_troca(db, conversa["id"], "  Como funciona   a fotossíntese? ", "Boa pergunta")
    consultas.dar_titulo(db, conversa["id"], "  Como funciona   a fotossíntese? ")
    consultas.dar_titulo(db, conversa["id"], "outra")  # o título não muda depois
    [p] = consultas.projetos_do_aluno(db, ana)
    assert p["conversas"] == [{"id": str(conversa["id"]), "titulo": "Como funciona a fotossíntese?"}]
    # A conversa de projeto não é confundida com o chat geral.
    assert chat.conversa_do_aluno(db, ana, None) is None

    assert consultas.apagar_projeto(db, projeto["id"], ana)
    assert db.execute("select count(*) as n from mensagens where conversa_id = %s", (conversa["id"],)).fetchone()["n"] == 0


def test_teto_de_projetos(db, monkeypatch):
    ana = aluno(db)
    monkeypatch.setattr(consultas, "MAXIMO_DE_PROJETOS", 2)
    assert consultas.criar_projeto(db, ana, "1") and consultas.criar_projeto(db, ana, "2")
    assert consultas.criar_projeto(db, ana, "3") is None
