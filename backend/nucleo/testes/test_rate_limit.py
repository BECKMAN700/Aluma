import time
import pytest
from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
from nucleo.auth import Usuario, usuario_atual
from nucleo.rate_limit import check_rate_limit, user_request_history

# Cria uma aplicação FastAPI de teste isolada (sem chamar a API do Gemini)
app_test = FastAPI()


def usuario_teste(request: Request) -> Usuario:
    return Usuario(
        id=request.headers.get("X-Test-User-ID", "usuario-1"),
        papel="aluno",
        escola_id=None,
    )


app_test.dependency_overrides[usuario_atual] = usuario_teste

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
def reset_user_history():
    """Zera o histórico de usuários antes de cada teste."""
    user_request_history.clear()


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


def test_different_users_on_same_ip_do_not_block_each_other():
    client = TestClient(app_test)

    for _ in range(30):
        response = client.post(
            "/api/chat",
            headers={"X-Test-User-ID": "aluno-1", "X-Forwarded-For": "200.1.1.1"},
        )
        assert response.status_code == 200

    response = client.post(
        "/api/chat",
        headers={"X-Test-User-ID": "aluno-2", "X-Forwarded-For": "200.1.1.1"},
    )
    assert response.status_code == 200

    response = client.post(
        "/api/chat",
        headers={"X-Test-User-ID": "aluno-1", "X-Forwarded-For": "200.1.1.1"},
    )
    assert response.status_code == 429
    assert response.json() == {"erro": "muitas perguntas seguidas, aguarde um pouco"}


def test_rate_limit_daily_limit():
    client = TestClient(app_test)
    
    # Simula 500 requisições já registradas no dia para o usuário de teste.
    now = time.time()
    user_request_history["usuario-1"] = [now - 1000] * 500

    # A próxima requisição deve falhar no limite diário
    response = client.post("/api/chat")
    assert response.status_code == 429
    assert response.json() == {"erro": "muitas perguntas seguidas, aguarde um pouco"}