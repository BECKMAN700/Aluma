"""Rotas de matéria e tópico com as permissões de verdade; só o banco é trocado."""

from uuid import UUID

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.testclient import TestClient

from main import http_exception_handler, validation_exception_handler
from materiais import rotas
from nucleo import consultas as permissao
from nucleo.auth import Usuario, usuario_atual
from nucleo.db import conexao

TURMA = UUID("dddddddd-dddd-dddd-dddd-dddddddddddd")
MATERIA = UUID("aaaaaaaa-0000-0000-0000-000000000001")
ESCOLA = "cccccccc-cccc-cccc-cccc-cccccccccccc"
PROFESSOR = Usuario(id="11111111-1111-1111-1111-111111111111", papel="professor", escola_id=ESCOLA)
OUTRO_PROFESSOR = Usuario(id="22222222-2222-2222-2222-222222222222", papel="professor", escola_id=ESCOLA)
ALUNO = Usuario(id="33333333-3333-3333-3333-333333333333", papel="aluno", escola_id=None)
OUTRO_ALUNO = Usuario(id="44444444-4444-4444-4444-444444444444", papel="aluno", escola_id=None)


@pytest.fixture
def cliente(monkeypatch):
    """O banco de mentira sabe só isto: a TURMA (e a MATERIA dela) são do PROFESSOR e do ALUNO."""
    monkeypatch.setattr(
        permissao, "professor_dono_da_turma", lambda db, t, p, e: (t, p) == (TURMA, PROFESSOR.id)
    )
    monkeypatch.setattr(
        permissao, "professor_dono_da_materia", lambda db, m, p, e: (m, p) == (MATERIA, PROFESSOR.id)
    )
    monkeypatch.setattr(
        permissao, "aluno_matriculado_na_turma", lambda db, t, a: (t, a) == (TURMA, ALUNO.id)
    )
    monkeypatch.setattr(rotas, "criar_materia", lambda **k: {"id": str(MATERIA), "nome": k["nome"], "topicos": []})
    monkeypatch.setattr(rotas, "materias_da_turma", lambda **k: [{"id": str(MATERIA), "nome": "Matemática", "topicos": []}])
    monkeypatch.setattr(rotas, "criar_topico", lambda **k: {"id": "t1", "nome": k["nome"], "ordem": 1})

    app = FastAPI()
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.include_router(rotas.router)
    app.dependency_overrides[conexao] = lambda: object()

    def como(usuario: Usuario) -> TestClient:
        app.dependency_overrides[usuario_atual] = lambda: usuario
        return TestClient(app)

    return como


def test_professor_dono_cria_materia(cliente):
    r = cliente(PROFESSOR).post(f"/api/turmas/{TURMA}/materias", json={"nome": "  Matemática "})

    assert r.status_code == 201
    assert r.json() == {"id": str(MATERIA), "nome": "Matemática", "topicos": []}


@pytest.mark.parametrize("usuario", [PROFESSOR, ALUNO])
def test_professor_dono_e_aluno_da_turma_listam_materias(cliente, usuario):
    r = cliente(usuario).get(f"/api/turmas/{TURMA}/materias")

    assert r.status_code == 200
    assert r.json()["materias"][0]["nome"] == "Matemática"


def test_professor_dono_cria_topico(cliente):
    r = cliente(PROFESSOR).post(f"/api/materias/{MATERIA}/topicos", json={"nome": "Frações"})

    assert r.status_code == 201
    assert r.json() == {"id": "t1", "nome": "Frações", "ordem": 1}


@pytest.mark.parametrize(
    "usuario, metodo, caminho, corpo, erro",
    [
        (OUTRO_PROFESSOR, "post", f"/api/turmas/{TURMA}/materias", {"nome": "X"}, "turma nao encontrada"),
        (OUTRO_PROFESSOR, "get", f"/api/turmas/{TURMA}/materias", None, "turma nao encontrada"),
        (OUTRO_ALUNO, "get", f"/api/turmas/{TURMA}/materias", None, "turma nao encontrada"),
        (OUTRO_PROFESSOR, "post", f"/api/materias/{MATERIA}/topicos", {"nome": "X"}, "materia nao encontrada"),
    ],
)
def test_quem_e_de_outra_turma_recebe_404(cliente, usuario, metodo, caminho, corpo, erro):
    r = cliente(usuario).request(metodo, caminho, json=corpo)

    assert r.status_code == 404
    assert r.json() == {"erro": erro}


@pytest.mark.parametrize(
    "metodo, caminho, corpo",
    [
        ("post", f"/api/turmas/{TURMA}/materias", {"nome": "X"}),
        ("post", f"/api/materias/{MATERIA}/topicos", {"nome": "X"}),
    ],
)
def test_aluno_da_turma_nao_cria_materia_nem_topico(cliente, metodo, caminho, corpo):
    r = cliente(ALUNO).request(metodo, caminho, json=corpo)

    assert r.status_code == 403


@pytest.mark.parametrize(
    "caminho",
    [f"/api/turmas/{TURMA}/materias", f"/api/materias/{MATERIA}/topicos"],
)
@pytest.mark.parametrize("corpo", [{"nome": "   "}, {"nome": "x" * 81}, {"nome": "X", "extra": 1}])
def test_nome_invalido_retorna_422(cliente, caminho, corpo):
    r = cliente(PROFESSOR).post(caminho, json=corpo)

    assert r.status_code == 422
    assert r.json()["erro"]


def test_sem_login_retorna_401():
    app = FastAPI()
    app.include_router(rotas.router)
    app.dependency_overrides[conexao] = lambda: object()

    r = TestClient(app).get(f"/api/turmas/{TURMA}/materias")

    assert r.status_code == 401
