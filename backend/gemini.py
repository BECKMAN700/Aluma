import os

from google import genai
from google.genai import types

from prompt import MAX_OUTPUT_TOKENS, SYSTEM_PROMPT, TEMPERATURE

# Versões fixas, e não aliases como `gemini-flash-lite-latest`: a bateria anti-cola precisa
# apontar sempre para o mesmo alvo. Decisão registrada em PROJECT-CONTEXT.md §6.
# Os reservas só entram quando o anterior falha: em 28/09/2026 o principal respondeu 503
# (Google sobrecarregado) por horas seguidas.
# ponytail: a bateria anti-cola só validou o principal; rodá-la contra os reservas.
MODELOS = ("gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash")

# Com o Google instável, uma chamada chegou a travar 52s. Três tentativas de 15s cabem
# nos 60s que o app espera antes de desistir (services/api.ts).
TEMPO_POR_MODELO_MS = 15_000


class TutorIndisponivel(Exception):
    """
    A IA não respondeu.

    A mensagem desta exceção nunca carrega detalhe da conversa nem da chave:
    quem a captura decide o que mostrar ao aluno.
    """


def _log_indisponivel(motivo: str) -> None:
    """
    Registra por que o tutor caiu, sem nunca gravar conteúdo de conversa.

    Só o tipo do erro ou um motivo fixo entram no log. A mensagem crua de uma
    exceção da biblioteca pode trazer trecho do payload enviado — e payload é
    conversa de aluno menor de idade (regras invioláveis 2 e 8).
    """
    print(f"[gemini] tutor indisponivel: {motivo}")


def chat_com_gemini(mensagem: str, historico: list) -> str:
    """
    Comunica-se com o Gemini para obter a resposta do tutor.

    O histórico é uma lista de dicionários com 'autor' ('aluno' ou 'tutor') e 'texto'.
    Tenta os modelos de MODELOS em ordem; levanta TutorIndisponivel só se todos
    falharem, para a rota devolver 503.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        _log_indisponivel("GEMINI_API_KEY ausente")
        raise TutorIndisponivel()

    # Constrói a lista de contents seguindo o formato esperado pela API do genai.
    # O histórico chega como [{"autor": "aluno", "texto": "..."}, ...]
    contents = []
    for msg in historico:
        role = "user" if msg["autor"] == "aluno" else "model"
        contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=msg["texto"])])
        )

    # Adiciona a mensagem atual
    contents.append(
        types.Content(role="user", parts=[types.Part.from_text(text=mensagem)])
    )

    client = genai.Client(api_key=api_key)
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=TEMPERATURE,
        max_output_tokens=MAX_OUTPUT_TOKENS,
        http_options=types.HttpOptions(timeout=TEMPO_POR_MODELO_MS),
    )

    for modelo in MODELOS:
        try:
            response = client.models.generate_content(
                model=modelo, contents=contents, config=config
            )
        except Exception as e:
            # Tipo e código HTTP bastam para diagnosticar (503 = Google instável,
            # 429 = cota, 404 = modelo inexistente); a mensagem crua fica de fora.
            _log_indisponivel(f"{modelo} {type(e).__name__} {getattr(e, 'code', '')}".strip())
            continue
        if response.text:
            return response.text
        _log_indisponivel(f"{modelo} resposta vazia")

    raise TutorIndisponivel()
