import os

import anthropic

from gemini import TutorIndisponivel
from prompt import MAX_OUTPUT_TOKENS, SYSTEM_PROMPT, TEMPERATURE

# Versão fixa, pelo mesmo motivo do Gemini: a bateria anti-cola precisa apontar sempre para
# o mesmo alvo. Claude é o principal desde 28/09/2026, quando o Gemini gratuito caiu em ondas
# de 503; o Gemini segue como reserva em main.py.
MODELO = "claude-haiku-4-5-20251001"

# 15s aqui + PRAZO_TOTAL_S do Gemini cabem nos 60s que o app espera (services/api.ts).
# Sem retry do SDK: se o Claude falhar, quem insiste é o Gemini.
TEMPO_LIMITE_S = 15


def _log_indisponivel(motivo: str) -> None:
    """Mesmo cuidado de gemini.py: só o motivo, nunca conteúdo de conversa."""
    print(f"[claude] tutor indisponivel: {motivo}")


def chat_com_claude(mensagem: str, historico: list) -> str:
    """
    Pede a resposta do tutor ao Claude.

    O histórico é uma lista de dicionários com 'autor' ('aluno' ou 'tutor') e 'texto'.
    Levanta TutorIndisponivel se não houver chave ou se o Claude falhar, para a rota
    tentar o Gemini.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        _log_indisponivel("ANTHROPIC_API_KEY ausente")
        raise TutorIndisponivel()

    messages = [
        {"role": "user" if msg["autor"] == "aluno" else "assistant", "content": msg["texto"]}
        for msg in historico
    ]
    messages.append({"role": "user", "content": mensagem})
    # A conversa na API do Claude começa pelo usuário: sai a saudação do tutor (app/chat.tsx).
    while messages[0]["role"] == "assistant":
        messages.pop(0)

    client = anthropic.Anthropic(api_key=api_key, timeout=TEMPO_LIMITE_S, max_retries=0)
    try:
        response = client.messages.create(
            model=MODELO,
            system=SYSTEM_PROMPT,
            temperature=TEMPERATURE,
            max_tokens=MAX_OUTPUT_TOKENS,
            messages=messages,
        )
    except Exception as e:
        # 529 = Anthropic sobrecarregada, 429 = limite, 400 com crédito esgotado = teto de gasto.
        _log_indisponivel(f"{type(e).__name__} {getattr(e, 'status_code', '')}".strip())
        raise TutorIndisponivel() from None

    texto = "".join(bloco.text for bloco in response.content if bloco.type == "text")
    if not texto:
        _log_indisponivel("resposta vazia")
        raise TutorIndisponivel()
    return texto
