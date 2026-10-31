"""
Cria uma conta de professor: o login no Supabase e a linha em perfis (docs/arquitetura.md §4).
Roda só na máquina de quem tem a chave secreta do Supabase, nunca no servidor.

    cd backend
    python scripts/criar_professor.py --escola "Escola Demonstração" --nome "Prof. Demo" --email prof@exemplo.com

Lê do backend/.env: DATABASE_URL, SUPABASE_URL e SUPABASE_SECRET_KEY. A senha é pedida no
terminal, sem aparecer na tela. A escola é criada se ainda não existir uma com esse nome.
"""

import argparse
import getpass
import json
import os
import sys
import urllib.error
import urllib.request

import psycopg
from dotenv import load_dotenv


def criar_login(email: str, senha: str) -> str:
    """Cria o usuário no Supabase Auth e devolve o id dele."""
    chave = os.environ["SUPABASE_SECRET_KEY"]
    pedido = urllib.request.Request(
        os.environ["SUPABASE_URL"].rstrip("/") + "/auth/v1/admin/users",
        # email_confirm: a confirmação por e-mail está desligada no projeto (arquitetura.md §8)
        data=json.dumps({"email": email, "password": senha, "email_confirm": True}).encode(),
        headers={"apikey": chave, "Authorization": f"Bearer {chave}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(pedido, timeout=20) as resposta:
            return json.load(resposta)["id"]
    except urllib.error.HTTPError as e:
        sys.exit(f"O Supabase recusou criar o login ({e.code}): {e.read().decode(errors='replace')}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Cria uma conta de professor.")
    parser.add_argument("--escola", required=True, help="nome da escola (criada se não existir)")
    parser.add_argument("--nome", required=True, help="nome do professor")
    parser.add_argument("--email", required=True)
    args = parser.parse_args()

    load_dotenv()
    faltando = [v for v in ("DATABASE_URL", "SUPABASE_URL", "SUPABASE_SECRET_KEY") if not os.getenv(v)]
    if faltando:
        sys.exit(f"Faltam no backend/.env: {', '.join(faltando)}")

    senha = getpass.getpass("Senha do professor (mínimo 8 caracteres): ")
    if len(senha) < 8 or senha != getpass.getpass("Repita a senha: "):
        sys.exit("Senha curta demais ou as duas não conferem. Nada foi criado.")

    # Uma transação só: se o login falhar, a escola recém-criada é desfeita.
    with psycopg.connect(os.environ["DATABASE_URL"], prepare_threshold=None, connect_timeout=10) as db:
        escola = db.execute("select id from escolas where nome = %s", (args.escola,)).fetchone()
        if escola is None:
            escola = db.execute("insert into escolas (nome) values (%s) returning id", (args.escola,)).fetchone()
        usuario_id = criar_login(args.email, senha)
        db.execute(
            "insert into perfis (id, nome, papel, escola_id) values (%s, %s, 'professor', %s)",
            (usuario_id, args.nome, escola[0]),
        )
    print(f"Professor criado: {args.nome} <{args.email}> na escola {args.escola}.")


if __name__ == "__main__":
    main()
