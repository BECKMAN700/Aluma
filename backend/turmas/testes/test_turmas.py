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


def test_professor_lista_somente_as_proprias_turmas(setup_api, monkeypatch):
    _, client, _, _ = setup_api
    turmas_do_professor = [
        {
            "id": str(TURMA_ID),
            "nome": "Matemática",
            "serie": "8º ano",
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


def test_resumo_soma_a_turma_e_lista_so_quem_esta_tentando(setup_api, monkeypatch):
    _, client, _, _ = setup_api
    monkeypatch.setattr(rotas, "turmas_do_professor", lambda **k: [{"id": TURMA_ID, "nome": "9º ano 01", "serie": "9º"}])
    monkeypatch.setattr(rotas, "alunos_da_turma", lambda **k: [{"id": "a"}, {"id": "b"}])
    monkeypatch.setattr(rotas, "painel_da_turma", lambda **k: [
        {"id": "t1", "nome": "Frações", "dominado": 1, "em_andamento": 1, "nao_iniciado": 0},
        {"id": "t2", "nome": "Equações", "dominado": 0, "em_andamento": 0, "nao_iniciado": 2},
    ])

    corpo = client.get("/api/turmas/resumo").json()

    [turma] = corpo["turmas"]
    assert (turma["alunos"], turma["topicos"], turma["dominado"], turma["nao_iniciado"]) == (2, 2, 1, 2)
    assert [a["topico"] for a in corpo["atencao"]] == ["Frações"]
