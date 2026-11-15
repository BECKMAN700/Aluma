"""
Cria uma conta de professor ou de coordenador: o login no Supabase e a linha em perfis
(docs/arquitetura.md §4). É assim que a equipe entrega o coordenador quando uma escola contrata;
depois disso, os professores quem cria é o próprio coordenador, pelo painel.
Roda só na máquina de quem tem a chave secreta do Supabase.

    cd backend
    python scripts/criar_professor.py --papel coordenador --escola "Colégio X" --nome "Maria" --email maria@colegiox.edu.br

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
    parser = argparse.ArgumentParser(description="Cria uma conta de professor ou coordenador.")
    parser.add_argument("--papel", choices=("professor", "coordenador"), default="professor")
    parser.add_argument("--escola", required=True, help="nome da escola (criada se não existir)")
    parser.add_argument("--nome", required=True, help="nome da pessoa")
    parser.add_argument("--email", required=True)
    args = parser.parse_args()

    load_dotenv()
    faltando = [v for v in ("DATABASE_URL", "SUPABASE_URL", "SUPABASE_SECRET_KEY") if not os.getenv(v)]
    if faltando:
        sys.exit(f"Faltam no backend/.env: {', '.join(faltando)}")

    senha = getpass.getpass(f"Senha do {args.papel} (mínimo 8 caracteres): ")
    if len(senha) < 8 or senha != getpass.getpass("Repita a senha: "):
        sys.exit("Senha curta demais ou as duas não conferem. Nada foi criado.")

    # Uma transação só: se o login falhar, a escola recém-criada é desfeita.
    with psycopg.connect(os.environ["DATABASE_URL"], prepare_threshold=None, connect_timeout=10) as db:
        escola = db.execute("select id from escolas where nome = %s", (args.escola,)).fetchone()
        if escola is None:
            escola = db.execute("insert into escolas (nome) values (%s) returning id", (args.escola,)).fetchone()
        usuario_id = criar_login(args.email, senha)
        db.execute(
            "insert into perfis (id, nome, papel, escola_id) values (%s, %s, %s, %s)",
            (usuario_id, args.nome, args.papel, escola[0]),
        )
    print(f"Conta de {args.papel} criada: {args.nome} <{args.email}> na escola {args.escola}.")


if __name__ == "__main__":
    main()
