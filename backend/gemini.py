import os

from google import genai
from google.genai import types

# Versão fixa, e não o alias `gemini-flash-lite-latest`: a bateria anti-cola precisa
# apontar sempre para o mesmo alvo. Decisão registrada em PROJECT-CONTEXT.md §6.
MODELO = "gemini-3.5-flash-lite"


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
    Levanta TutorIndisponivel em qualquer falha, para a rota devolver 503.
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

    # Ponto de encaixe do system prompt socrático (backend/prompt.py, issue #46).

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(model=MODELO, contents=contents)
    except Exception as e:
        _log_indisponivel(type(e).__name__)
        raise TutorIndisponivel() from e

    if not response.text:
        _log_indisponivel("resposta vazia")
        raise TutorIndisponivel()

    return response.text
