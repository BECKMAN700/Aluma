import json
import os
from functools import partial
from unittest.mock import patch

import anthropic
import httpx2  # o cliente HTTP que o SDK anthropic 1.x usa por dentro
import pytest
from fastapi.testclient import TestClient

from chat.claude import MODELO, chat_com_claude
from chat.gemini import TutorIndisponivel
from main import app
from chat.prompt import MAX_OUTPUT_TOKENS, SYSTEM_PROMPT
from nucleo.rate_limit import ip_request_history


def anthropic_falso(status, corpo, pedidos):
    """
    SDK anthropic de verdade, só com a rede trocada por uma resposta pronta.

    Simular o SDK inteiro escondeu um TypeError em 28/09/2026 (parâmetro que o SDK 1.x
    não aceita); assim o teste quebra se a chamada não bater com o SDK instalado.
    """

    def responder(request):
        pedidos.append(json.loads(request.content))
        return httpx2.Response(status, json=corpo)

    http = httpx2.Client(transport=httpx2.MockTransport(responder))
    return partial(anthropic.Anthropic, http_client=http)


RESPOSTA_OK = {
    "id": "msg_teste",
    "type": "message",
    "role": "assistant",
    "model": MODELO,
    "content": [{"type": "text", "text": "pergunta-guia"}],
    "stop_reason": "end_turn",
    "stop_sequence": None,
    "usage": {"input_tokens": 1, "output_tokens": 1},
}


@patch.dict(os.environ, {"ANTHROPIC_API_KEY": "chave-de-teste"})
def test_envia_o_tutor_socratico_e_descarta_a_saudacao():
    pedidos = []
    historico = [
        {"autor": "tutor", "texto": "Olá! Sou o orientador de estudos do Aluma."},
        {"autor": "aluno", "texto": "me ajuda com 3x + 5 = 20"},
        {"autor": "tutor", "texto": "o que fazer com o +5?"},
    ]

    with patch("chat.claude.anthropic.Anthropic", anthropic_falso(200, RESPOSTA_OK, pedidos)):
        assert chat_com_claude("tirar dos dois lados?", historico) == "pergunta-guia"

    enviado = pedidos[0]
    assert enviado["model"] == MODELO
    assert enviado["system"] == SYSTEM_PROMPT
    assert enviado["max_tokens"] == MAX_OUTPUT_TOKENS
    assert [m["role"] for m in enviado["messages"]] == ["user", "assistant", "user"]
    assert enviado["messages"][-1]["content"] == "tirar dos dois lados?"


def test_sem_chave_vira_tutor_indisponivel(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    with pytest.raises(TutorIndisponivel):
        chat_com_claude("oi", [])


@patch.dict(os.environ, {"ANTHROPIC_API_KEY": "chave-de-teste"})
def test_anthropic_sobrecarregada_vira_tutor_indisponivel():
    sobrecarga = {"type": "error", "error": {"type": "overloaded_error", "message": "Overloaded"}}
    with patch("chat.claude.anthropic.Anthropic", anthropic_falso(529, sobrecarga, [])):
        with pytest.raises(TutorIndisponivel):
            chat_com_claude("oi", [])


@patch("chat.rotas.chat_com_gemini", return_value="resposta do gemini")
@patch("chat.rotas.chat_com_claude", side_effect=TutorIndisponivel)
def test_rota_cai_no_gemini_quando_o_claude_falha(claude, gemini):
    ip_request_history.clear()
    response = TestClient(app).post("/api/chat", json={"mensagem": "oi"})

    assert response.json() == {"resposta": "resposta do gemini"}
    claude.assert_called_once()
    gemini.assert_called_once()
