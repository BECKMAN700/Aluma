import os
from unittest.mock import MagicMock, patch

from chat.gemini import chat_com_gemini
from chat.prompt import MAX_OUTPUT_TOKENS, SYSTEM_PROMPT, TEMPERATURE


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
