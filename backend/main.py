from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import time
import os
from dotenv import load_dotenv

from gemini import chat_com_gemini

# Carrega as variáveis de ambiente do .env
load_dotenv()

app = FastAPI(title="Aluma Backend")

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
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {request.method} {request.url.path} - Status: {response.status_code} - Duração: {duration:.4f}s")
    
    return response

@app.get("/health")
def health_check():
    """Rota para verificar se o servidor está no ar"""
    return {"status": "ok"}

@app.post("/api/chat")
def chat(payload: ChatRequest):
    """
    Rota de chat com o tutor. Recebe mensagem e histórico,
    retorna a resposta do Gemini ou erro se falhar.
    """
    try:
        # Converte os objetos Pydantic do histórico para dicionários para facilitar em gemini.py
        historico_dicts = [{"autor": msg.autor, "texto": msg.texto} for msg in payload.historico]
        
        resposta = chat_com_gemini(payload.mensagem, historico_dicts)
        return {"resposta": resposta}
        
    except Exception as e:
        if str(e) == "tutor indisponivel":
            return JSONResponse(status_code=503, content={"erro": "tutor indisponivel"})
        return JSONResponse(status_code=500, content={"erro": "erro interno do servidor"})
