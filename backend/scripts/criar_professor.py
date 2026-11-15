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
import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv

# Rodando como `python scripts/criar_professor.py`, a pasta backend/ não está no caminho de import.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from nucleo import supabase_admin  # noqa: E402


def criar_login(email: str, senha: str) -> str:
    try:
        return supabase_admin.criar_login(email, senha)
    except (supabase_admin.EmailJaCadastrado, supabase_admin.AdminIndisponivel) as e:
        sys.exit(f"O Supabase recusou criar o login: {e}")


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
