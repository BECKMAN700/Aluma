import os
import time

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.rate_limit import check_rate_limit
from gemini import TutorIndisponivel, chat_com_gemini

# Carrega as variáveis de ambiente do .env
load_dotenv()

app = FastAPI(title="Aluma Backend")

# Lista separada por vírgulas, por exemplo:
# CORS_ORIGINS=https://aluma.exemplo.com,http://localhost:8081
cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:8081").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Modelos Pydantic para validação do corpo da requisição
class Mensagem(BaseModel):
    autor: str
    texto: str


class ChatRequest(BaseModel):
    mensagem: str
    historico: list[Mensagem] = []


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware para registrar informações de cada requisição (log).
    Não registra o conteúdo da mensagem por questões de privacidade.
    """
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    # Formato: horario, rota, status da resposta, duracao
    # Ex: [2026-09-21 10:00:00] POST /api/chat - Status: 200 - Duração: 1.234s
    print(
        f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {request.method} {request.url.path}"
        f" - Status: {response.status_code} - Duração: {duration:.4f}s"
    )

    return response


@app.exception_handler(429)
async def rate_limit_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=429,
        content={"erro": "muitas perguntas seguidas, aguarde um pouco"},
    )


@app.get("/health")
def health_check():
    """Rota para verificar se o servidor está no ar"""
    return {"status": "ok"}


@app.post("/api/chat", dependencies=[Depends(check_rate_limit)])
async def chat_endpoint(payload: ChatRequest):
    """
    Rota de chat com o tutor. Recebe mensagem e histórico,
    retorna a resposta do Gemini ou erro se falhar.
    """
    try:
        # Converte os objetos Pydantic do histórico para dicionários para facilitar em gemini.py
        historico_dicts = [
            {"autor": msg.autor, "texto": msg.texto} for msg in payload.historico
        ]

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
