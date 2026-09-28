import os
import time

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from rate_limit import check_rate_limit
from claude import chat_com_claude
from gemini import TutorIndisponivel, chat_com_gemini
from validation import ChatRequest

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


# Tipos de erro padrão do Pydantic que não passam por um field_validator nosso
# (esses já levantam ValueError em português, ver validation.py).
_ERRO_POR_TIPO_PYDANTIC = {
    "missing": "faltou um campo obrigatorio na mensagem",
    "extra_forbidden": "a mensagem enviada tem um campo que o servidor nao reconhece",
    "string_type": "um dos campos enviados deveria ser texto",
}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Quem lê é aluno do 9º ano: nunca o JSON técnico do Pydantic (regra inviolável 3).
    primeiro_erro = exc.errors()[0]
    if primeiro_erro["type"] == "value_error":
        mensagem = primeiro_erro["msg"].removeprefix("Value error, ")
    else:
        mensagem = _ERRO_POR_TIPO_PYDANTIC.get(primeiro_erro["type"], "os dados enviados sao invalidos")

    return JSONResponse(status_code=422, content={"erro": mensagem})


@app.get("/health")
def health_check():
    """Rota para verificar se o servidor está no ar"""
    return {"status": "ok"}


@app.post("/api/chat", dependencies=[Depends(check_rate_limit)])
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
