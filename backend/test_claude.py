import os
from unittest.mock import MagicMock, patch

import anthropic
import httpx
import pytest
from fastapi.testclient import TestClient

from claude import MODELO, TEMPO_LIMITE_S, chat_com_claude
from gemini import TutorIndisponivel
from main import app
from prompt import MAX_OUTPUT_TOKENS, SYSTEM_PROMPT, TEMPERATURE
from rate_limit import ip_request_history

SOBRECARGA = anthropic.APIStatusError(
    "Overloaded",
    response=httpx.Response(529, request=httpx.Request("POST", "https://api.anthropic.com")),
    body=None,
)


def resposta(texto):
    return MagicMock(content=[MagicMock(type="text", text=texto)])


@patch.dict(os.environ, {"ANTHROPIC_API_KEY": "chave-de-teste"})
@patch("claude.anthropic.Anthropic")
def test_envia_o_tutor_socratico_e_descarta_a_saudacao(client_cls):
    criar = client_cls.return_value.messages.create
    criar.return_value = resposta("pergunta-guia")
    historico = [
        {"autor": "tutor", "texto": "Olá! Sou o orientador de estudos do Aluma."},
        {"autor": "aluno", "texto": "me ajuda com 3x + 5 = 20"},
        {"autor": "tutor", "texto": "o que fazer com o +5?"},
    ]

    assert chat_com_claude("tirar dos dois lados?", historico) == "pergunta-guia"

    assert client_cls.call_args.kwargs["timeout"] == TEMPO_LIMITE_S
    kwargs = criar.call_args.kwargs
    assert kwargs["model"] == MODELO
    assert kwargs["system"] == SYSTEM_PROMPT
    assert kwargs["temperature"] == TEMPERATURE
    assert kwargs["max_tokens"] == MAX_OUTPUT_TOKENS
    assert [m["role"] for m in kwargs["messages"]] == ["user", "assistant", "user"]
    assert kwargs["messages"][-1]["content"] == "tirar dos dois lados?"


def test_sem_chave_vira_tutor_indisponivel(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    with pytest.raises(TutorIndisponivel):
        chat_com_claude("oi", [])


@patch.dict(os.environ, {"ANTHROPIC_API_KEY": "chave-de-teste"})
@patch("claude.anthropic.Anthropic")
def test_erro_da_anthropic_vira_tutor_indisponivel(client_cls):
    client_cls.return_value.messages.create.side_effect = SOBRECARGA
    with pytest.raises(TutorIndisponivel):
        chat_com_claude("oi", [])


@patch("main.chat_com_gemini", return_value="resposta do gemini")
@patch("main.chat_com_claude", side_effect=TutorIndisponivel)
def test_rota_cai_no_gemini_quando_o_claude_falha(claude, gemini):
    ip_request_history.clear()
    response = TestClient(app).post("/api/chat", json={"mensagem": "oi"})

    assert response.json() == {"resposta": "resposta do gemini"}
    claude.assert_called_once()
    gemini.assert_called_once()
