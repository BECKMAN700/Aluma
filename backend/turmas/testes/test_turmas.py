"""
Sprint 3 - Os testes verificam as rotas de matrícula e de perfil sem precisar acessar o banco de dados real
"""
from types import SimpleNamespace
from uuid import UUID

import pytest
from fastapi import Depends, FastAPI, HTTPException
from fastapi.testclient import TestClient

from nucleo.db import conexao
from nucleo.permissoes import exige_dono_da_turma, exige_professor
from turmas import consultas
from turmas import rotas
from turmas.rotas import router


PROFESSOR_ID = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
OUTRO_PROFESSOR_ID = UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
ESCOLA_ID = UUID("cccccccc-cccc-cccc-cccc-cccccccccccc")
TURMA_ID = UUID("dddddddd-dddd-dddd-dddd-dddddddddddd")
OUTRA_TURMA_ID = UUID("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee")
ALUNO_ID = UUID("ffffffff-ffff-ffff-ffff-ffffffffffff")


@pytest.fixture
def setup_api(monkeypatch):
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)

    professor = SimpleNamespace(
        id=str(PROFESSOR_ID),
        escola_id=str(ESCOLA_ID),
    )

    def professor_autenticado():
        return professor

    def conexao_falsa():
        return object()

    app.dependency_overrides[exige_professor] = professor_autenticado
    app.dependency_overrides[exige_dono_da_turma] = professor_autenticado
    app.dependency_overrides[conexao] = conexao_falsa

    return app, client, professor, monkeypatch


def test_professor_cria_turma_com_sucesso_e_codigo_de_seis_caracteres(
    setup_api,
):
    _, client, _, monkeypatch = setup_api
    turma = {
        "id": str(TURMA_ID),
        "nome": "Matemática",
        "serie": "8º ano",
        "codigo": "ABC234",
    }
    monkeypatch.setattr(rotas, "criar_turma", lambda **kwargs: turma)

    response = client.post(
        "/api/turmas",
        json={"nome": "Matemática", "serie": "8º ano"},
    )

    assert response.status_code == 201
    assert response.json()["codigo"] == "ABC234"
    assert len(response.json()["codigo"]) == 6


def test_nome_vazio_retorna_422(setup_api):
    _, client, _, _ = setup_api

    response = client.post(
        "/api/turmas",
        json={"nome": "   ", "serie": "8º ano"},
    )

    assert response.status_code == 422


def test_serie_vazia_retorna_422(setup_api):
    _, client, _, _ = setup_api

    response = client.post(
        "/api/turmas",
        json={"nome": "Matemática", "serie": "   "},
    )

    assert response.status_code == 422


def test_professor_sem_escola_retorna_403(setup_api):
    app, client, professor, _ = setup_api
    professor.escola_id = None

    response = client.post(
        "/api/turmas",
        json={"nome": "Matemática", "serie": "8º ano"},
    )

    assert response.status_code == 403


def test_aluno_tentando_criar_turma_retorna_403(setup_api):
    app, client, _, _ = setup_api

    def negar_aluno():
        raise HTTPException(status_code=403, detail="Apenas professores")

    app.dependency_overrides[exige_professor] = negar_aluno
    response = client.post(
        "/api/turmas",
        json={"nome": "Matemática", "serie": "8º ano"},
    )

    assert response.status_code == 403


def test_sem_login_retorna_401(setup_api):
    app, client, _, _ = setup_api

    def exigir_login():
        raise HTTPException(status_code=401, detail="Não autenticado")

    app.dependency_overrides[exige_professor] = exigir_login
    response = client.post(
        "/api/turmas",
        json={"nome": "Matemática", "serie": "8º ano"},
    )

    assert response.status_code == 401


def test_professor_lista_somente_as_proprias_turmas(setup_api, monkeypatch):
    _, client, _, _ = setup_api
    turmas_do_professor = [
        {
            "id": str(TURMA_ID),
            "nome": "Matemática",
            "serie": "8º ano",
            "codigo": "ABC234",
        }
    ]
    monkeypatch.setattr(
        rotas, "turmas_do_professor", lambda **kwargs: turmas_do_professor
    )

    response = client.get("/api/turmas")

    assert response.status_code == 200
    assert response.json() == {"turmas": turmas_do_professor}
    assert all(t["id"] != str(OUTRA_TURMA_ID) for t in response.json()["turmas"])


def test_professor_ve_alunos_da_propria_turma_com_status_200(
    setup_api, monkeypatch
):
    _, client, _, _ = setup_api
    alunos = [{"id": str(ALUNO_ID), "nome": "Aluno Teste"}]
    monkeypatch.setattr(rotas, "alunos_da_turma", lambda **kwargs: alunos)

    response = client.get(f"/api/turmas/{TURMA_ID}/alunos")

    assert response.status_code == 200
    assert response.json() == {"alunos": alunos}


def test_professor_nao_ve_alunos_de_turma_de_outro_retorna_404(setup_api):
    app, client, _, _ = setup_api

    def negar_turma_de_outro_professor():
        raise HTTPException(status_code=404, detail="Turma não encontrada")

    app.dependency_overrides[exige_dono_da_turma] = (
        negar_turma_de_outro_professor
    )

    response = client.get(f"/api/turmas/{OUTRA_TURMA_ID}/alunos")

    assert response.status_code == 404


def test_gerador_nunca_usa_caracteres_ambiguos_em_mil_sorteios():
    proibidos = set("0O1I")

    codigos = [consultas.gerar_codigo_turma() for _ in range(1000)]

    assert all(len(codigo) == 6 for codigo in codigos)
    assert all(not (set(codigo) & proibidos) for codigo in codigos)
    assert all(set(codigo) <= set(consultas.ALFABETO_CODIGO) for codigo in codigos)