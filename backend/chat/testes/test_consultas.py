"""O SQL do chat contra o Postgres de verdade (migrations aplicadas pelo CI)."""

import os
import uuid

import psycopg
import pytest
from psycopg.rows import dict_row

from chat import consultas

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


def novo_aluno(db) -> str:
    aluno_id = str(uuid.uuid4())
    db.execute("insert into perfis (id, nome, papel) values (%s, 'Aluno Teste', 'aluno')", (aluno_id,))
    return aluno_id


def test_cada_aluno_so_ve_a_propria_conversa(db):
    ana, bia = novo_aluno(db), novo_aluno(db)
    conversa_ana = consultas.criar_conversa(db, ana)
    consultas.gravar_troca(db, conversa_ana, "pergunta da Ana", "resposta para a Ana")

    assert consultas.conversa_do_aluno(db, bia) is None
    conversa_bia = consultas.criar_conversa(db, bia)
    assert consultas.conversa_do_aluno(db, bia) == conversa_bia
    assert consultas.ultimas_mensagens(db, conversa_bia, 50) == []


def test_mensagens_voltam_em_ordem_e_cortadas_no_limite(db):
    aluno = novo_aluno(db)
    conversa = consultas.criar_conversa(db, aluno)
    for i in range(3):
        consultas.gravar_troca(db, conversa, f"pergunta {i}", f"resposta {i}")

    assert consultas.ultimas_mensagens(db, conversa, 3) == [
        {"autor": "tutor", "texto": "resposta 1"},
        {"autor": "aluno", "texto": "pergunta 2"},
        {"autor": "tutor", "texto": "resposta 2"},
    ]
