import os
from unittest.mock import MagicMock, patch

import pytest
from google.genai import errors

from gemini import MODELOS, PRAZO_TOTAL_S, TEMPO_POR_MODELO_MS, TutorIndisponivel, chat_com_gemini

SOBRECARGA = errors.ServerError(
    503, {"error": {"code": 503, "message": "The model is overloaded.", "status": "UNAVAILABLE"}}
)


class RelogioFalso:
    """Cada leitura avança `passo` segundos, para testar o prazo sem esperar de verdade."""

    def __init__(self, passo):
        self.agora = 0.0
        self.passo = passo

    def __call__(self):
        self.agora += self.passo
        return self.agora


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
@patch("gemini.time.sleep")
@patch("gemini.genai.Client")
def test_insiste_em_nova_rodada_quando_todos_falham(client_cls, sleep):
    gerar = client_cls.return_value.models.generate_content
    gerar.side_effect = [SOBRECARGA] * len(MODELOS) + [MagicMock(text="pergunta-guia")]

    assert chat_com_gemini("oi", []) == "pergunta-guia"

    assert gerar.call_count == len(MODELOS) + 1
    sleep.assert_called_once()


@patch.dict(os.environ, {"GEMINI_API_KEY": "chave-de-teste"})
@patch("gemini.time.sleep")
@patch("gemini.time.monotonic", new_callable=lambda: RelogioFalso(passo=5))
@patch("gemini.genai.Client")
def test_desiste_no_prazo_e_vira_tutor_indisponivel(client_cls, relogio, sleep):
    gerar = client_cls.return_value.models.generate_content
    gerar.side_effect = SOBRECARGA

    with pytest.raises(TutorIndisponivel):
        chat_com_gemini("oi", [])

    # Cada leitura do relógio avança 5s: o prazo acaba antes de 50s de tentativas.
    assert 0 < gerar.call_count < PRAZO_TOTAL_S / 5
    for chamada in gerar.call_args_list:
        assert chamada.kwargs["config"].http_options.timeout <= TEMPO_POR_MODELO_MS
