import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from chat.rotas import router as chat_router

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
# (esses já levantam ValueError em português, ver chat/esquemas.py).
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


app.include_router(chat_router)
