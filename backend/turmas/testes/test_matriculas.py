import pytest
from unittest.mock import patch, ANY
from fastapi.testclient import TestClient

from main import app
from nucleo.auth import usuario_atual, Usuario
from nucleo.permissoes import exige_aluno
from nucleo.db import conexao

client = TestClient(app)

aluno_mock = Usuario(id="123", papel="aluno", escola_id=None)
professor_mock = Usuario(id="456", papel="professor", escola_id=None)


@pytest.fixture(autouse=True)
def configurar_overrides():
    app.dependency_overrides[conexao] = lambda: object()
    yield
    app.dependency_overrides.clear()


# --- Testes de Matrícula ---

def test_matricula_sucesso():
    app.dependency_overrides[exige_aluno] = lambda: aluno_mock

    with patch("turmas.consultas_matriculas.buscar_turma_por_codigo") as mock_turma, \
            patch("turmas.consultas_matriculas.turma_do_aluno") as mock_aluno_turma, \
            patch("turmas.consultas_matriculas.matricular") as mock_matricular:
        mock_turma.return_value = {"id": "turma-1", "nome": "9º A"}
        mock_aluno_turma.return_value = None

        response = client.post("/api/matriculas", json={"codigo": "K7M2QP"})

        assert response.status_code == 201
        assert response.json() == {"turma": {"id": "turma-1", "nome": "9º A"}}
        mock_turma.assert_called_with(ANY, "K7M2QP")


def test_matricula_codigo_inexistente():
    app.dependency_overrides[exige_aluno] = lambda: aluno_mock

    with patch("turmas.consultas_matriculas.buscar_turma_por_codigo") as mock_turma:
        mock_turma.return_value = None

        response = client.post("/api/matriculas", json={"codigo": "XXXXXX"})
        assert response.status_code == 404
        assert response.json() == {"erro": "código não encontrado"}


def test_matricula_aluno_ja_com_turma():
    app.dependency_overrides[exige_aluno] = lambda: aluno_mock

    with patch("turmas.consultas_matriculas.buscar_turma_por_codigo") as mock_turma, \
            patch("turmas.consultas_matriculas.turma_do_aluno") as mock_aluno_turma:
        mock_turma.return_value = {"id": "turma-1", "nome": "9º A"}
        mock_aluno_turma.return_value = {"id": "turma-1", "nome": "9º A"}

        response = client.post("/api/matriculas", json={"codigo": "K7M2QP"})
        assert response.status_code == 409
        assert response.json() == {"erro": "você já está em uma turma"}


def test_matricula_codigo_tamanho_invalido():
    app.dependency_overrides[exige_aluno] = lambda: aluno_mock
    response = client.post("/api/matriculas", json={"codigo": "K7M"})
    assert response.status_code == 422


# --- Teste de Rota /me ---

def test_get_me_aluno_sem_turma():
    app.dependency_overrides[usuario_atual] = lambda: aluno_mock

    with patch("turmas.consultas_matriculas.buscar_perfil_completo") as mock_perfil:
        mock_perfil.return_value = {
            "id": "123",
            "nome": "Maria",
            "papel": "aluno",
            "escola_id": None,
            "escola_nome": None,
            "turma_id": None,
            "turma_nome": None
        }

        response = client.get("/api/me")
        assert response.status_code == 200
        assert response.json() == {
            "id": "123",
            "nome": "Maria",
            "papel": "aluno",
            "escola": None,
            "turma": None
        }


# --- Teste de Permissão ---

def test_matricula_professor_bloqueado():
    app.dependency_overrides[usuario_atual] = lambda: professor_mock

    response = client.post("/api/matriculas", json={"codigo": "K7M2QP"})
    assert response.status_code == 403


# --- Teste de Normalização do Código ---

def test_matricula_codigo_minusculo_com_espacos():
    app.dependency_overrides[exige_aluno] = lambda: aluno_mock

    with patch("turmas.consultas_matriculas.buscar_turma_por_codigo") as mock_turma, \
            patch("turmas.consultas_matriculas.turma_do_aluno") as mock_aluno_turma, \
            patch("turmas.consultas_matriculas.matricular"):
        mock_turma.return_value = {"id": "turma-1", "nome": "9º A"}
        mock_aluno_turma.return_value = None

        response = client.post("/api/matriculas", json={"codigo": " k7m2qp "})

        assert response.status_code == 201
        mock_turma.assert_called_with(ANY, "K7M2QP")