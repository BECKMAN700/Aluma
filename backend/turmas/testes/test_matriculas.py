import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

from main import app
from nucleo.auth import usuario_atual, Usuario
from nucleo.db import conexao

client = TestClient(app)

aluno_mock = Usuario(id="123", papel="aluno", escola_id=None)
professor_mock = Usuario(id="456", papel="professor", escola_id=None)


@pytest.fixture(autouse=True)
def configurar_overrides():
    app.dependency_overrides[conexao] = lambda: object()
    app.dependency_overrides[usuario_atual] = lambda: aluno_mock
    yield
    app.dependency_overrides.clear()


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
