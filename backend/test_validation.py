from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from main import app
from rate_limit import ip_request_history

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_ip_history():
    # Outros arquivos de teste também batem em /api/chat com o mesmo IP de
    # teste ("testclient"); sem isso o rate limit derrubaria estes testes
    # com 429 antes de chegar na validação.
    ip_request_history.clear()


def test_mensagem_vazia_retorna_422():
    response = client.post("/api/chat", json={"mensagem": ""})
    assert response.status_code == 422
    assert "vazia" in response.json()["erro"]


def test_mensagem_so_espacos_retorna_422():
    response = client.post("/api/chat", json={"mensagem": "   "})
    assert response.status_code == 422
    assert "vazia" in response.json()["erro"]


def test_mensagem_longa_demais_retorna_422():
    response = client.post("/api/chat", json={"mensagem": "a" * 2001})
    assert response.status_code == 422
    assert "2000" in response.json()["erro"]


def test_autor_invalido_no_historico_retorna_422():
    response = client.post(
        "/api/chat",
        json={
            "mensagem": "como resolvo essa equacao?",
            "historico": [{"autor": "professor", "texto": "oi"}],
        },
    )
    assert response.status_code == 422
    assert "aluno" in response.json()["erro"]


@patch("main.chat_com_gemini", return_value="pergunta-guia, nao a resposta pronta")
def test_mensagem_valida_passa(mock_chat_com_gemini):
    response = client.post("/api/chat", json={"mensagem": "como resolvo essa equacao?"})
    assert response.status_code == 200
    assert response.json() == {"resposta": "pergunta-guia, nao a resposta pronta"}
    mock_chat_com_gemini.assert_called_once()


def test_campo_desconhecido_e_rejeitado():
    response = client.post("/api/chat", json={"mensagem": "oi", "hack": "1=1"})
    assert response.status_code == 422


def test_historico_com_mais_de_10_itens_corta_os_mais_antigos():
    historico = [{"autor": "aluno", "texto": f"pergunta {i}"} for i in range(15)]
    with patch("main.chat_com_gemini", return_value="ok") as mock_chat_com_gemini:
        response = client.post("/api/chat", json={"mensagem": "oi", "historico": historico})

    assert response.status_code == 200
    historico_enviado = mock_chat_com_gemini.call_args.args[1]
    assert len(historico_enviado) == 10
    assert historico_enviado[0]["texto"] == "pergunta 5"
    assert historico_enviado[-1]["texto"] == "pergunta 14"
