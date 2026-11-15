"""A entrada pelo convite contra o Postgres de verdade."""

import os
import uuid
from datetime import date

import psycopg
import pytest
from psycopg.rows import dict_row

from convites import consultas
from coordenacao.consultas import pre_cadastrar_aluno
from nucleo.auth import buscar_ou_criar_perfil
from nucleo.consultas import aluno_matriculado_na_turma
from turmas.consultas import criar_turma

pytestmark = pytest.mark.skipif(
    not (os.getenv("CI") and os.getenv("DATABASE_URL")), reason="requer o Postgres do CI"
)
NASCEU = date(2012, 3, 4)


@pytest.fixture
def db():
    conn = psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row, prepare_threshold=None)
    yield conn
    conn.rollback()
    conn.close()


def escola(db):
    e = db.execute("insert into escolas (nome) values ('Colégio') returning id, convite").fetchone()
    turma = criar_turma(db, str(e["id"]), "9º ano 01", "9º ano")["id"]
    return e["convite"], str(e["id"]), turma


def login_novo(db) -> str:
    """Como o usuario_atual faz no primeiro login: perfil de aluno, sem escola."""
    login = str(uuid.uuid4())
    buscar_ou_criar_perfil(db, login, "Nome do Google")
    return login


def test_aluno_assume_o_pre_cadastro_uma_vez_so(db):
    convite, escola_id, turma = escola(db)
    pre = pre_cadastrar_aluno(db, escola_id, turma, "Ana Souza", "001", NASCEU)["id"]
    login = login_novo(db)

    resultado = consultas.entrar_pelo_convite(db, convite, login, "001", NASCEU)

    assert resultado == {"escola": {"id": uuid.UUID(escola_id), "nome": "Colégio"}, "turma": {"id": turma, "nome": "9º ano 01"}}
    perfil = db.execute("select nome, escola_id, entrou_em from perfis where id = %s", (login,)).fetchone()
    assert perfil["nome"] == "Ana Souza"  # vale o nome que a escola cadastrou
    assert perfil["entrou_em"] is not None
    assert aluno_matriculado_na_turma(db, turma, login)  # a matrícula veio junto
    assert db.execute("select 1 from perfis where id = %s", (pre,)).fetchone() is None
    # Outra conta com os mesmos dados não entra mais.
    assert consultas.entrar_pelo_convite(db, convite, login_novo(db), "001", NASCEU) is None


def test_dados_errados_ou_convite_de_outra_escola_nao_entram(db):
    convite, escola_id, turma = escola(db)
    outro_convite, _, _ = escola(db)
    pre_cadastrar_aluno(db, escola_id, turma, "Ana", "001", NASCEU)
    login = login_novo(db)

    assert consultas.entrar_pelo_convite(db, convite, login, "001", date(2012, 3, 5)) is None
    assert consultas.entrar_pelo_convite(db, convite, login, "002", NASCEU) is None
    assert consultas.entrar_pelo_convite(db, outro_convite, login, "001", NASCEU) is None
    assert consultas.entrar_pelo_convite(db, convite, login, "001", NASCEU) is not None


def test_conta_que_ja_e_de_uma_escola_nao_assume_outro_cadastro(db):
    convite, escola_id, turma = escola(db)
    pre_cadastrar_aluno(db, escola_id, turma, "Ana", "001", NASCEU)
    pre_cadastrar_aluno(db, escola_id, turma, "Bia", "002", NASCEU)
    login = login_novo(db)
    consultas.entrar_pelo_convite(db, convite, login, "001", NASCEU)

    with pytest.raises(consultas.ContaJaNaEscola):
        consultas.entrar_pelo_convite(db, convite, login, "002", NASCEU)


def test_tela_do_convite_mostra_so_a_marca(db):
    convite, escola_id, _ = escola(db)
    assert consultas.escola_do_convite(db, convite) == {
        "id": uuid.UUID(escola_id), "nome": "Colégio", "nome_da_ia": "Luma", "cor": "#f5a623"
    }
    assert consultas.escola_do_convite(db, uuid.uuid4()) is None
