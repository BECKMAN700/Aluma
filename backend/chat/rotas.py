from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from chat.claude import chat_com_claude
from chat.esquemas import ChatRequest
from chat.gemini import TutorIndisponivel, chat_com_gemini
from nucleo.rate_limit import check_rate_limit

router = APIRouter()


@router.post("/api/chat", dependencies=[Depends(check_rate_limit)])
def chat(payload: ChatRequest):
    """
    Rota de chat com o tutor. Recebe mensagem e histórico,
    retorna a resposta do Claude (ou do Gemini, de reserva) ou erro se os dois falharem.
    """
    try:
        # Converte os objetos Pydantic do histórico para dicionários para facilitar em gemini.py
        historico_dicts = [
            {"autor": msg.autor, "texto": msg.texto} for msg in payload.historico
        ]

        # Claude primeiro; sem chave, sem crédito ou fora do ar, o Gemini assume.
        try:
            resposta = chat_com_claude(payload.mensagem, historico_dicts)
        except TutorIndisponivel:
            resposta = chat_com_gemini(payload.mensagem, historico_dicts)
        return {"resposta": resposta}

    except TutorIndisponivel:
        # A falha já foi registrada em gemini.py, sem conteúdo de conversa.
        return JSONResponse(status_code=503, content={"erro": "tutor indisponivel"})

    except Exception as e:
        # Só o tipo do erro vai para o log: a mensagem crua pode carregar
        # trecho da conversa do aluno (regra inviolável 8).
        print(f"[chat] erro interno: {type(e).__name__}")
        return JSONResponse(status_code=500, content={"erro": "erro interno do servidor"})
