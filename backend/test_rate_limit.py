import time
import pytest
from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
from rate_limit import check_rate_limit, ip_request_history

# Cria uma aplicação FastAPI de teste isolada (sem chamar a API do Gemini)
app_test = FastAPI()

@app_test.exception_handler(429)
async def custom_429_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=429,
        content={"erro": "muitas perguntas seguidas, aguarde um pouco"}
    )

@app_test.post("/api/chat", dependencies=[Depends(check_rate_limit)])
def dummy_chat():
    return {"status": "ok"}


@pytest.fixture(autouse=True)
def reset_ip_history():
    """Zera o dicionário de IPs antes de cada teste."""
    ip_request_history.clear()


def test_rate_limit_per_minute():
    client = TestClient(app_test)
    
    # 30 requisições devem passar normalmente (HTTP 200)
    for _ in range(30):
        response = client.post("/api/chat")
        assert response.status_code == 200
        
    # A 31ª requisição deve ser bloqueada (HTTP 429) com o payload exato
    response = client.post("/api/chat")
    assert response.status_code == 429
    assert response.json() == {"erro": "muitas perguntas seguidas, aguarde um pouco"}


def test_rate_limit_with_x_forwarded_for_spoofing():
    client = TestClient(app_test)
    
    # Simula requisições com IPs forjados na frente, mas com o IP real (200.1.1.1) mantido pelo proxy no final
    for i in range(30):
        headers = {"X-Forwarded-For": f"10.0.0.{i}, 200.1.1.1"}
        response = client.post("/api/chat", headers=headers)
        assert response.status_code == 200

    # A 31ª requisição vinda do mesmo IP real (200.1.1.1) deve estourar o limite
    headers = {"X-Forwarded-For": "10.0.0.99, 200.1.1.1"}
    response = client.post("/api/chat", headers=headers)
    assert response.status_code == 429
    assert response.json() == {"erro": "muitas perguntas seguidas, aguarde um pouco"}


def test_rate_limit_fallback_to_client_host():
    client = TestClient(app_test)
    
    # Sem o cabeçalho X-Forwarded-For, deve utilizar o request.client.host
    for _ in range(30):
        response = client.post("/api/chat")
        assert response.status_code == 200
        
    response = client.post("/api/chat")
    assert response.status_code == 429


def test_rate_limit_daily_limit():
    client = TestClient(app_test)
    
    # Simula 500 requisições já registradas no dia para o IP 200.1.1.1.
    # O IP vai explícito no cabeçalho: sem ele, o TestClient se apresenta
    # como "testclient", e o histórico preenchido seria de outro IP.
    now = time.time()
    ip_request_history["200.1.1.1"] = [now - 1000] * 500

    # A próxima requisição deve falhar no limite diário
    response = client.post("/api/chat", headers={"X-Forwarded-For": "200.1.1.1"})
    assert response.status_code == 429
    assert response.json() == {"erro": "muitas perguntas seguidas, aguarde um pouco"}