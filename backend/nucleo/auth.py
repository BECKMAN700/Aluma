from dataclasses import dataclass
import os
import re
from typing import Any
import uuid

from fastapi import Depends, Header, HTTPException, status
import jwt
from jwt import PyJWKClient
import psycopg

from nucleo.db import conexao


@dataclass
class Usuario:
    """Contrato do usuário autenticado no sistema."""
    id: str
    papel: str
    escola_id: str | None


class NaoAutenticado(HTTPException):
    """Exceção levantada em qualquer falha de autenticação (HTTP 401)."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="faca login de novo",
        )


def sanitizar_nome(valor: Any) -> str:
    """
    Sanitiza a entrada do nome inicial do usuário.
    Remove caracteres de controle, blocos de scripts, tags HTML e múltiplos espaços.
    Fallback para 'Aluno' caso esteja vazio ou inválido.
    """
    if not valor or not isinstance(valor, str):
        return "Aluno"
    # Mantém apenas caracteres imprimíveis
    limpo = "".join(ch for ch in valor if ch.isprintable())
    # Remove blocos de script/style inteiros
    limpo = re.sub(r"<(script|style).*?>.*?</\1>", "", limpo, flags=re.IGNORECASE | re.DOTALL)
    # Remove quaisquer outras tags HTML
    limpo = re.sub(r"<[^>]+>", "", limpo)
    # Normaliza espaços em branco repetidos
    limpo = " ".join(limpo.split()).strip()
    limpo = limpo[:100]
    return limpo if limpo else "Aluno"


_jwk_client: PyJWKClient | None = None
_jwk_client_url: str | None = None


def obter_jwk_client() -> PyJWKClient:
    """
    Obtém ou instancia o cliente JWKS do Supabase configurado com cache de 10 minutos (600s).
    """
    global _jwk_client, _jwk_client_url
    supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    if not supabase_url:
        raise NaoAutenticado()
    jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
    if _jwk_client is None or _jwk_client_url != jwks_url:
        _jwk_client = PyJWKClient(jwks_url, lifespan=600)
        _jwk_client_url = jwks_url
    return _jwk_client


def decodificar_token(token: str, client: PyJWKClient | None = None) -> dict[str, Any]:
    """
    Decodifica e valida o token JWT do Supabase:
    - Aceita apenas algoritmos ES256 e RS256.
    - Rejeita explicitamente HS256 e none.
    - Valida audience ('authenticated'), issuer (SUPABASE_URL + '/auth/v1'), exp e nbf (quando presente).
    - Exige apenas exp e sub (Supabase não emite nbf por padrão).
    - Qualquer falha levanta NaoAutenticado (HTTP 401).
    """
    if not token or not isinstance(token, str):
        raise NaoAutenticado()

    # Validação segura do cabeçalho sem decodificar a assinatura
    try:
        header = jwt.get_unverified_header(token)
    except Exception:
        raise NaoAutenticado()

    alg = header.get("alg")
    if alg not in ("ES256", "RS256"):
        raise NaoAutenticado()

    if client is None:
        client = obter_jwk_client()

    try:
        signing_key = client.get_signing_key_from_jwt(token)
        chave_publica = signing_key.key
    except Exception:
        raise NaoAutenticado()

    supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    if not supabase_url:
        raise NaoAutenticado()
    issuer = f"{supabase_url}/auth/v1"

    try:
        payload = jwt.decode(
            token,
            chave_publica,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            issuer=issuer,
            options={
                "verify_signature": True,
                "verify_aud": True,
                "verify_iss": True,
                "verify_exp": True,
                "verify_nbf": True,
                "require": ["exp", "sub"],
            },
        )
    except Exception:
        raise NaoAutenticado()

    return payload


def buscar_ou_criar_perfil(
    db: psycopg.Connection,
    user_id: str,
    nome: str,
) -> tuple[str, str | None]:
    """
    Busca o usuário na tabela 'perfis'. Se não existir, cria automaticamente
    com papel 'aluno' e escola_id None.
    Garante que perfis existentes nunca sejam duplicados ou sobrescritos.
    Retorna (papel, escola_id).
    """
    with db.cursor() as cur:
        cur.execute(
            "SELECT id, papel, escola_id FROM perfis WHERE id = %s",
            (user_id,),
        )
        linha = cur.fetchone()

        if linha is None:
            cur.execute(
                """
                INSERT INTO perfis (id, nome, papel, escola_id)
                VALUES (%s, %s, 'aluno', NULL)
                ON CONFLICT (id) DO NOTHING
                """,
                (user_id, nome),
            )
            cur.execute(
                "SELECT id, papel, escola_id FROM perfis WHERE id = %s",
                (user_id,),
            )
            linha = cur.fetchone()

        if linha is None:
            raise RuntimeError(f"Nao foi possivel obter perfil para o usuario {user_id}")

        papel = linha["papel"]
        escola_id = linha["escola_id"]
        return str(papel), str(escola_id) if escola_id is not None else None


def usuario_atual(
    authorization: str | None = Header(default=None),
    db: psycopg.Connection = Depends(conexao),
) -> Usuario:
    """
    Dependência do FastAPI para rotas protegidas.
    Valida o token JWT recebido no cabeçalho Authorization: Bearer <token>,
    identifica o usuário pelo claim 'sub' e carrega seu papel e escola do banco de dados.
    """
    if not authorization:
        raise NaoAutenticado()

    partes = authorization.split()
    if len(partes) != 2 or partes[0].lower() != "bearer":
        raise NaoAutenticado()

    token = partes[1]
    if not token:
        raise NaoAutenticado()

    payload = decodificar_token(token)

    sub = payload.get("sub")
    if not sub or not isinstance(sub, str):
        raise NaoAutenticado()

    try:
        user_uuid = uuid.UUID(sub)
        user_id = str(user_uuid)
    except (ValueError, TypeError, AttributeError):
        raise NaoAutenticado()

    user_metadata = payload.get("user_metadata")
    if not isinstance(user_metadata, dict):
        user_metadata = {}
    nome_bruto = user_metadata.get("nome")
    if not nome_bruto or not isinstance(nome_bruto, str):
        nome_bruto = user_metadata.get("name")
    nome = sanitizar_nome(nome_bruto)

    papel, escola_id = buscar_ou_criar_perfil(db, user_id, nome)

    return Usuario(
        id=user_id,
        papel=papel,
        escola_id=escola_id,
    )
