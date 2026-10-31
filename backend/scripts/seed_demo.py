"""
Cria a demonstração inteira, toda fictícia (regra inviolável 5): escola, professor, turma do 9º
ano e um aluno já matriculado, pronto para entrar no app e abrir o chat.
Roda só na máquina de quem tem a chave secreta do Supabase, nunca no servidor.

    cd backend
    python scripts/seed_demo.py

Lê do backend/.env: DATABASE_URL, SUPABASE_URL e SUPABASE_SECRET_KEY. A senha das duas contas é
pedida no terminal, sem aparecer na tela. Se a escola de demonstração já existir, nada é criado.
"""

import getpass
import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv

# Rodando como `python scripts/seed_demo.py`, a pasta backend/ não está no caminho de import.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.criar_professor import criar_login  # noqa: E402
from turmas.consultas import criar_turma  # noqa: E402

# O "(fictícia)" no nome é o sinal: dá para achar e apagar tudo da demo pela escola.
ESCOLA = "Escola Demonstração (fictícia)"
PROFESSOR = ("Prof. Demonstração", "prof.demo@exemplo.com")
ALUNO = ("Aluno Demonstração", "aluno.demo@exemplo.com")
TURMA = ("9º ano A (demonstração)", "9º ano")


def semear(db: psycopg.Connection, senha: str) -> str:
    """Cria escola, professor, turma e aluno matriculado. Devolve o código da turma."""
    if db.execute("select 1 from escolas where nome = %s", (ESCOLA,)).fetchone():
        sys.exit(f"A '{ESCOLA}' já existe. Nada foi criado.")

    escola_id = db.execute("insert into escolas (nome) values (%s) returning id", (ESCOLA,)).fetchone()[0]

    # shortcut: o login no Supabase não volta atrás com o rollback; se o banco falhar depois dele,
    # apague o usuário órfão no painel (Authentication > Users) antes de rodar de novo.
    professor_id = criar_login(PROFESSOR[1], senha)
    db.execute(
        "insert into perfis (id, nome, papel, escola_id) values (%s, %s, 'professor', %s)",
        (professor_id, PROFESSOR[0], escola_id),
    )
    turma = criar_turma(db, escola_id, professor_id, *TURMA)

    aluno_id = criar_login(ALUNO[1], senha)
    db.execute(
        "insert into perfis (id, nome, papel, escola_id) values (%s, %s, 'aluno', %s)",
        (aluno_id, ALUNO[0], escola_id),
    )
    db.execute("insert into matriculas (aluno_id, turma_id) values (%s, %s)", (aluno_id, turma["id"]))
    return turma["codigo"]


def main() -> None:
    load_dotenv()
    faltando = [v for v in ("DATABASE_URL", "SUPABASE_URL", "SUPABASE_SECRET_KEY") if not os.getenv(v)]
    if faltando:
        sys.exit(f"Faltam no backend/.env: {', '.join(faltando)}")

    senha = getpass.getpass("Senha das contas de demonstração (mínimo 8 caracteres): ")
    if len(senha) < 8 or senha != getpass.getpass("Repita a senha: "):
        sys.exit("Senha curta demais ou as duas não conferem. Nada foi criado.")

    # Uma transação só: se algo falhar no banco, escola, perfis e turma são desfeitos juntos.
    with psycopg.connect(os.environ["DATABASE_URL"], prepare_threshold=None, connect_timeout=10) as db:
        codigo = semear(db, senha)

    print(f"Demonstração criada na {ESCOLA}, turma {TURMA[0]} (código {codigo}).")
    print(f"Aluno: {ALUNO[1]} · Professor: {PROFESSOR[1]} · mesma senha que você digitou.")


if __name__ == "__main__":
    main()
