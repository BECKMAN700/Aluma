"""
Cria login no Supabase com a chave secreta. Usado pelo coordenador (professor com senha
provisória) e pelos scripts da equipe. A chave fica só no Render e no .env de quem roda script.
"""

import json
import os
import secrets
import urllib.error
import urllib.request

# Sem os que confundem ao ditar ou copiar do papel: 0/O, 1/l/I.
_ALFABETO_SENHA = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"


class EmailJaCadastrado(Exception):
    pass


class AdminIndisponivel(Exception):
    pass


def gerar_senha_provisoria() -> str:
    return "".join(secrets.choice(_ALFABETO_SENHA) for _ in range(10))


def criar_login(email: str, senha: str) -> str:
    """Cria o usuário no Supabase Auth e devolve o id dele."""
    chave = os.getenv("SUPABASE_SECRET_KEY")
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    if not chave or not url:
        raise AdminIndisponivel("SUPABASE_SECRET_KEY ou SUPABASE_URL nao configurada")
    pedido = urllib.request.Request(
        url + "/auth/v1/admin/users",
        # email_confirm: a confirmação por e-mail está desligada no projeto (arquitetura.md §8)
        data=json.dumps({"email": email, "password": senha, "email_confirm": True}).encode(),
        headers={"apikey": chave, "Authorization": f"Bearer {chave}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(pedido, timeout=20) as resposta:
            return json.load(resposta)["id"]
    except urllib.error.HTTPError as e:
        if e.code == 422:  # o Supabase responde 422 para e-mail já usado
            raise EmailJaCadastrado(email) from None
        # from None e sem o corpo: a resposta pode ecoar o cabeçalho com a chave (regra 2).
        raise AdminIndisponivel(f"o Supabase recusou criar o login ({e.code})") from None
    except (urllib.error.URLError, TimeoutError):
        raise AdminIndisponivel("nao foi possivel falar com o Supabase") from None
