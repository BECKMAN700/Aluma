import os
from unittest.mock import MagicMock, patch

import pytest
from google.genai import errors

from gemini import MODELOS, TEMPO_POR_MODELO_MS, TutorIndisponivel, chat_com_gemini

SOBRECARGA = errors.ServerError(
    503, {"error": {"code": 503, "message": "The model is overloaded.", "status": "UNAVAILABLE"}}
)


@patch.dict(os.environ, {"GEMINI_API_KEY": "chave-de-teste"})
@patch("gemini.genai.Client")
def test_modelo_reserva_assume_quando_o_principal_da_503(client_cls):
    gerar = client_cls.return_value.models.generate_content
    gerar.side_effect = [SOBRECARGA, MagicMock(text="pergunta-guia")]

    assert chat_com_gemini("quanto é x em 3x + 5 = 20?", []) == "pergunta-guia"

    modelos_chamados = [c.kwargs["model"] for c in gerar.call_args_list]
    assert modelos_chamados == [MODELOS[0], MODELOS[1]]
    assert gerar.call_args.kwargs["config"].http_options.timeout == TEMPO_POR_MODELO_MS


@patch.dict(os.environ, {"GEMINI_API_KEY": "chave-de-teste"})
@patch("gemini.genai.Client")
def test_todos_os_modelos_falhando_vira_tutor_indisponivel(client_cls):
    gerar = client_cls.return_value.models.generate_content
    gerar.side_effect = SOBRECARGA

    with pytest.raises(TutorIndisponivel):
        chat_com_gemini("oi", [])

    assert gerar.call_count == len(MODELOS)
