import time
import uuid

from cryptography.hazmat.primitives.asymmetric import ec, rsa
from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
import jwt
import psycopg
import pytest

from nucleo.auth import (
    NaoAutenticado,
    Usuario,
    decodificar_token,
    sanitizar_nome,
    usuario_atual,
)
from nucleo.db import conexao


# Geração de chaves em memória para testes
RSA_KEY_1 = rsa.generate_private_key(public_exponent=65537, key_size=2048)
RSA_PUB_1 = RSA_KEY_1.public_key()

RSA_KEY_2 = rsa.generate_private_key(public_exponent=65537, key_size=2048)
RSA_PUB_2 = RSA_KEY_2.public_key()

EC_KEY = ec.generate_private_key(ec.SECP256R1())
EC_PUB = EC_KEY.public_key()

SUPABASE_URL = "https://exemplo.supabase.co"


class MockSigningKey:
    def __init__(self, key):
        self.key = key


class MockJWKClient:
    def __init__(self, key=RSA_PUB_1):
        self.key = key

    def get_signing_key_from_jwt(self, token: str):
        return MockSigningKey(self.key)


class FakeCursor:
    def __init__(self, db):
        self.db = db
        self.last_result = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    def execute(self, query, params=None):
        q = " ".join(query.strip().split()).upper()
        if "SELECT ID, PAPEL, ESCOLA_ID FROM PERFIS WHERE ID =" in q:
            uid = str(params[0])
            row = self.db.perfis.get(uid)
            self.last_result = row.copy() if row else None
        elif "INSERT INTO PERFIS" in q:
            uid = str(params[0])
            nome = params[1]
            # ON CONFLICT DO NOTHING: só insere se ainda não existe
            if uid not in self.db.perfis:
                self.db.perfis[uid] = {
                    "id": uid,
                    "nome": nome,
                    "papel": "aluno",
                    "escola_id": None,
                }
            self.last_result = None

    def fetchone(self):
        return self.last_result


class FakeDB:
    def __init__(self):
        self.perfis = {}

    def cursor(self):
        return FakeCursor(self)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass


app_test = FastAPI()


@app_test.exception_handler(401)
async def custom_401_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=401, content={"erro": "faca login de novo"})


@app_test.get("/api/protegida")
def rota_protegida(usuario: Usuario = Depends(usuario_atual)):
    return {
        "id": usuario.id,
        "papel": usuario.papel,
        "escola_id": usuario.escola_id,
    }


def gerar_token(
    sub=None,
    aud="authenticated",
    iss=f"{SUPABASE_URL}/auth/v1",
    exp=None,
    nbf=None,
    user_metadata=None,
    headers=None,
    private_key=RSA_KEY_1,
    alg="RS256",
    role=None,
):
    now = int(time.time())
    payload = {
        "sub": sub or str(uuid.uuid4()),
        "aud": aud,
        "iss": iss,
        "exp": exp if exp is not None else (now + 3600),
    }
    if nbf is not None:
        payload["nbf"] = nbf
    if user_metadata is not None:
        payload["user_metadata"] = user_metadata
    if role is not None:
        payload["role"] = role

    jwt_headers = headers if headers is not None else {"kid": "key-1", "alg": alg}
    return jwt.encode(payload, private_key, algorithm=alg, headers=jwt_headers)


@pytest.fixture
def fake_db():
    return FakeDB()


@pytest.fixture
def client(monkeypatch, fake_db):
    monkeypatch.setenv("SUPABASE_URL", SUPABASE_URL)
    mock_jwk = MockJWKClient(RSA_PUB_1)
    monkeypatch.setattr("nucleo.auth.obter_jwk_client", lambda: mock_jwk)

    app_test.dependency_overrides[conexao] = lambda: fake_db
    test_client = TestClient(app_test)
    yield test_client, fake_db
    app_test.dependency_overrides.clear()


# --- TESTES DE AUTORIZAÇÃO E SEGURANÇA ---


def test_ausencia_do_authorization(client):
    test_client, _ = client
    response = test_client.get("/api/protegida")
    assert response.status_code == 401
    assert response.json() == {"erro": "faca login de novo"}


def test_header_authorization_sem_bearer(client):
    test_client, _ = client
    # Formato inválido: Basic em vez de Bearer
    response = test_client.get("/api/protegida", headers={"Authorization": "Basic 12345"})
    assert response.status_code == 401
    assert response.json() == {"erro": "faca login de novo"}

    # Bearer sem token
    response = test_client.get("/api/protegida", headers={"Authorization": "Bearer "})
    assert response.status_code == 401
    assert response.json() == {"erro": "faca login de novo"}


def test_token_malformado(client):
    test_client, _ = client
    response = test_client.get("/api/protegida", headers={"Authorization": "Bearer isto-nao-e-um-token-jwt"})
    assert response.status_code == 401
    assert response.json() == {"erro": "faca login de novo"}


def test_assinatura_invalida(client):
    test_client, _ = client
    # Token assinado com RSA_KEY_2, mas o JWKClient fornece a chave pública RSA_PUB_1
    token = gerar_token(private_key=RSA_KEY_2)
    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json() == {"erro": "faca login de novo"}


def test_token_expirado(client):
    test_client, _ = client
    now = int(time.time())
    token = gerar_token(exp=now - 100)
    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json() == {"erro": "faca login de novo"}


def test_token_nbf_futuro(client):
    test_client, _ = client
    now = int(time.time())
    token = gerar_token(nbf=now + 500)
    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json() == {"erro": "faca login de novo"}


def test_algoritmo_nao_permitido_hs256(client):
    test_client, _ = client
    now = int(time.time())
    payload = {
        "sub": str(uuid.uuid4()),
        "aud": "authenticated",
        "iss": f"{SUPABASE_URL}/auth/v1",
        "exp": now + 3600,
        "nbf": now - 60,
    }
    token = jwt.encode(payload, "chave-secreta-simetrica-de-teste-32bytes!", algorithm="HS256")
    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json() == {"erro": "faca login de novo"}


def test_algoritmo_nao_permitido_none(client):
    test_client, _ = client
    now = int(time.time())
    payload = {
        "sub": str(uuid.uuid4()),
        "aud": "authenticated",
        "iss": f"{SUPABASE_URL}/auth/v1",
        "exp": now + 3600,
        "nbf": now - 60,
    }
    token = jwt.encode(payload, "", algorithm="none")
    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json() == {"erro": "faca login de novo"}


def test_audience_incorreto(client):
    test_client, _ = client
    token = gerar_token(aud="app-outro")
    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json() == {"erro": "faca login de novo"}


def test_issuer_incorreto(client):
    test_client, _ = client
    token = gerar_token(iss="https://outro-projeto.supabase.co/auth/v1")
    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json() == {"erro": "faca login de novo"}


def test_sub_invalido_nao_uuid(client):
    test_client, _ = client
    token = gerar_token(sub="nao-e-um-uuid")
    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json() == {"erro": "faca login de novo"}


def test_token_valido_e_criacao_automatica_de_perfil(client):
    test_client, db = client
    user_id = str(uuid.uuid4())
    token = gerar_token(sub=user_id, user_metadata={"nome": "Joãozinho da Silva"})

    assert user_id not in db.perfis

    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    dados = response.json()
    assert dados["id"] == user_id
    assert dados["papel"] == "aluno"
    assert dados["escola_id"] is None

    # Verifica que o perfil foi criado automaticamente no banco
    assert user_id in db.perfis
    perfil_salvo = db.perfis[user_id]
    assert perfil_salvo["nome"] == "Joãozinho da Silva"
    assert perfil_salvo["papel"] == "aluno"
    assert perfil_salvo["escola_id"] is None


def test_idempotencia_de_perfil_existente(client):
    test_client, db = client
    user_id = str(uuid.uuid4())
    escola_id = str(uuid.uuid4())

    # Pré-cadastra usuário como professor de uma escola
    db.perfis[user_id] = {
        "id": user_id,
        "nome": "Prof. Roberto",
        "papel": "professor",
        "escola_id": escola_id,
    }

    # O token tem user_metadata querendo se passar por aluno
    token = gerar_token(sub=user_id, user_metadata={"nome": "Tentativa de Troca"})

    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    dados = response.json()

    # O papel e escola devem permanecer inalterados
    assert dados["id"] == user_id
    assert dados["papel"] == "professor"
    assert dados["escola_id"] == escola_id

    # No banco, não foi sobrescrito nem duplicado
    perfil_banco = db.perfis[user_id]
    assert perfil_banco["papel"] == "professor"
    assert perfil_banco["escola_id"] == escola_id
    assert perfil_banco["nome"] == "Prof. Roberto"


def test_nunca_confia_no_papel_do_jwt(client):
    test_client, db = client
    user_id = str(uuid.uuid4())

    # Usuário novo envia claim de role no token tentando burlar
    token = gerar_token(sub=user_id, role="admin", user_metadata={"nome": "Hacker", "papel": "admin"})

    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    dados = response.json()

    # O sistema ignora qualquer role no token e define 'aluno' no banco
    assert dados["papel"] == "aluno"
    assert db.perfis[user_id]["papel"] == "aluno"


def test_pyjwkclient_substituido_por_mock(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", SUPABASE_URL)
    mock_jwk = MockJWKClient(RSA_PUB_1)

    # Substitui a fábrica do cliente pelo mock sem tocar a rede
    token = gerar_token()
    payload = decodificar_token(token, client=mock_jwk)
    assert payload["aud"] == "authenticated"
    assert payload["iss"] == f"{SUPABASE_URL}/auth/v1"


def test_algoritmo_es256_valido(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", SUPABASE_URL)
    mock_jwk = MockJWKClient(EC_PUB)

    # Token assinado com curva elíptica ECDSA (ES256)
    token = gerar_token(private_key=EC_KEY, alg="ES256", headers={"kid": "ec-1", "alg": "ES256"})
    payload = decodificar_token(token, client=mock_jwk)
    assert payload["aud"] == "authenticated"


def test_sanitizacao_nome():
    assert sanitizar_nome("   Carlos   Eduardo   ") == "Carlos Eduardo"
    assert sanitizar_nome("<script>alert(1)</script>Lucas") == "Lucas"
    assert sanitizar_nome("Maria\x00\x08Silva") == "MariaSilva"
    assert sanitizar_nome("") == "Aluno"
    assert sanitizar_nome(None) == "Aluno"
    assert sanitizar_nome("A" * 150) == "A" * 100


def test_token_sem_nbf_retorna_200(client):
    test_client, _ = client
    # Supabase não inclui a claim 'nbf' nos tokens JWT reais
    token = gerar_token()
    unverified = jwt.decode(token, options={"verify_signature": False})
    assert "nbf" not in unverified

    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


def test_token_com_nbf_valido_retorna_200(client):
    test_client, _ = client
    now = int(time.time())
    token = gerar_token(nbf=now - 60)
    response = test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


def test_erro_de_banco_nao_e_mascarado_como_401(client, monkeypatch):
    test_client, db = client
    token = gerar_token()

    def cursor_com_falha():
        raise psycopg.OperationalError("Conexao com o banco perdida")

    monkeypatch.setattr(db, "cursor", cursor_com_falha)

    # Exceções de banco de dados devem subir naturalmente e não virar 401
    with pytest.raises(psycopg.OperationalError):
        test_client.get("/api/protegida", headers={"Authorization": f"Bearer {token}"})
