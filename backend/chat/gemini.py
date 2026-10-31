import os
import time

from google import genai
from google.genai import types

from chat.prompt import MAX_OUTPUT_TOKENS, SYSTEM_PROMPT, TEMPERATURE

# Versões fixas, e não aliases como `gemini-flash-lite-latest`: a bateria anti-cola precisa
# apontar sempre para o mesmo alvo. Decisão registrada em PROJECT-CONTEXT.md §6.
# Os reservas só entram quando o anterior falha: em 28/09/2026 o principal respondeu 503
# (Google sobrecarregado) por horas seguidas.
# ponytail: a bateria anti-cola só validou o principal; rodá-la contra os reservas.
MODELOS = ("gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash")

# Com o Google instável, uma chamada chegou a travar 52s: nenhuma passa de 15s.
TEMPO_POR_MODELO_MS = 15_000
# O 503 do Google vem em ondas: insistir nos modelos até perto dos 60s que o app espera
# (services/api.ts), descontados os 15s do Claude (claude.py), acha a janela em que ele
# responde. Desistir na 1ª rodada levava 5s.
# A pausa não é menor porque os 503 também podem contar na cota gratuita.
PRAZO_TOTAL_S = 40
PAUSA_ENTRE_RODADAS_S = 6


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
    Tenta os modelos de MODELOS em ordem, em rodadas, até PRAZO_TOTAL_S; levanta
    TutorIndisponivel só se nenhum responder no prazo, para a rota devolver 503.
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
    limite = time.monotonic() + PRAZO_TOTAL_S

    while True:
        for modelo in MODELOS:
            restante_ms = int((limite - time.monotonic()) * 1000)
            if restante_ms < 1000:
                raise TutorIndisponivel()
            config = types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=TEMPERATURE,
                max_output_tokens=MAX_OUTPUT_TOKENS,
                http_options=types.HttpOptions(timeout=min(TEMPO_POR_MODELO_MS, restante_ms)),
            )
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
        time.sleep(PAUSA_ENTRE_RODADAS_S)
