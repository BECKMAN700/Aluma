import os
from unittest.mock import MagicMock, patch

from chat.gemini import chat_com_gemini
from chat.prompt import MAX_OUTPUT_TOKENS, SYSTEM_PROMPT, TEMPERATURE, montar_prompt


@patch.dict(os.environ, {"GEMINI_API_KEY": "chave-de-teste"})
@patch("chat.gemini.genai.Client")
def test_chat_com_gemini_envia_o_system_prompt(client_cls):
    resposta_falsa = MagicMock(text="pergunta-guia, não a resposta")
    client_cls.return_value.models.generate_content.return_value = resposta_falsa

    resultado = chat_com_gemini("quanto é x em 3x + 5 = 20?", [])

    assert resultado == "pergunta-guia, não a resposta"
    _, kwargs = client_cls.return_value.models.generate_content.call_args
    config = kwargs["config"]
    assert config.system_instruction == SYSTEM_PROMPT
    assert config.temperature == TEMPERATURE
    assert config.max_output_tokens == MAX_OUTPUT_TOKENS


def test_trilha_mantem_a_regra_anti_cola_e_a_conversa_livre_nao():
    # Guarda contra uma edição de tom que apague a regra da trilha (regra inviolável 6).
    trilha = montar_prompt({"nome": "Frações", "material": None})
    assert "nunca entrega a resposta final" in trilha
    assert "nunca entrega a resposta final" not in SYSTEM_PROMPT
    assert "Luma" in SYSTEM_PROMPT
    assert "6º ao 9º ano" in SYSTEM_PROMPT
