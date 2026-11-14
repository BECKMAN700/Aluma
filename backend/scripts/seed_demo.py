"""
Cria a demonstração inteira, toda fictícia (regra inviolável 5): escola, professor, turma do 9º
ano, um aluno já matriculado e a trilha de Matemática com três tópicos e o material de cada um.
Roda só na máquina de quem tem a chave secreta do Supabase, nunca no servidor.

    cd backend
    python scripts/seed_demo.py            # tudo, do zero
    python scripts/seed_demo.py --trilha   # só a trilha, na demonstração que já existe

Lê do backend/.env: DATABASE_URL, SUPABASE_URL e SUPABASE_SECRET_KEY (o --trilha só precisa do
DATABASE_URL). A senha das duas contas é pedida no terminal, sem aparecer na tela. Se a escola de
demonstração já existir, nada é criado; se a trilha já existir, ela também não é duplicada.
"""

import getpass
import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

# Rodando como `python scripts/seed_demo.py`, a pasta backend/ não está no caminho de import.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from materiais.consultas import criar_materia, criar_topico, guardar_material  # noqa: E402
from scripts.criar_professor import criar_login  # noqa: E402
from turmas.consultas import criar_turma  # noqa: E402

# O "(fictícia)" no nome é o sinal: dá para achar e apagar tudo da demo pela escola.
ESCOLA = "Escola Demonstração (fictícia)"
PROFESSOR = ("Prof. Demonstração", "prof.demo@exemplo.com")
ALUNO = ("Aluno Demonstração", "aluno.demo@exemplo.com")
TURMA = ("9º ano A (demonstração)", "9º ano")
MATERIA = "Matemática"

# Material escrito pela equipe para a demonstração: curto, sem resposta de exercício pronta.
TOPICOS = [
    (
        "Frações",
        "Uma fração representa partes de um todo. Em 3/4, o 4 (denominador) diz em quantas partes "
        "iguais o todo foi dividido, e o 3 (numerador) diz quantas dessas partes estamos usando.\n"
        "Para somar frações, os denominadores precisam ser iguais. Se não forem, procuramos frações "
        "equivalentes: 1/2 é o mesmo que 2/4, porque multiplicamos em cima e embaixo pelo mesmo "
        "número.\nExemplo do dia a dia: uma pizza dividida em 8 pedaços; quem come 2 comeu 2/8, que "
        "é o mesmo que 1/4 da pizza.",
    ),
    (
        "Equações do 1º grau",
        "Uma equação é uma balança em equilíbrio: o que está à esquerda do sinal de igual vale o "
        "mesmo que o que está à direita. Resolver é descobrir o valor da incógnita (a letra).\n"
        "Tudo o que fazemos de um lado, fazemos do outro, para a balança continuar equilibrada: "
        "somar, subtrair, multiplicar ou dividir pelo mesmo número.\nPara conferir a resposta, "
        "trocamos a letra pelo valor encontrado e vemos se os dois lados ficam iguais.",
    ),
    (
        "Porcentagem",
        "Porcentagem é uma fração com denominador 100: 25% quer dizer 25 de cada 100, ou 25/100, "
        "que é o mesmo que 1/4.\nPara calcular uma porcentagem de um valor, podemos transformar a "
        "porcentagem em fração ou em número decimal (25% = 0,25) e multiplicar.\nAumentos e "
        "descontos aparecem em promoções e na conta de luz: um desconto de 10% tira um décimo do "
        "preço.",
    ),
]


def semear(db: psycopg.Connection, senha: str) -> str:
    """Cria escola, professor, turma e aluno matriculado. Devolve o código da turma."""
    if db.execute("select 1 from escolas where nome = %s", (ESCOLA,)).fetchone():
        sys.exit(f"A '{ESCOLA}' já existe. Nada foi criado.")

    escola_id = db.execute("insert into escolas (nome) values (%s) returning id", (ESCOLA,)).fetchone()["id"]

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
    semear_trilha(db)
    return turma["codigo"]


def semear_trilha(db: psycopg.Connection) -> None:
    """Matemática com três tópicos e material, na turma de demonstração. Não duplica."""
    turma = db.execute(
        """
        select t.id from turmas as t join escolas as e on e.id = t.escola_id
        where e.nome = %s and t.nome = %s
        """,
        (ESCOLA, TURMA[0]),
    ).fetchone()
    if not turma:
        sys.exit("A turma de demonstração não existe. Rode o script sem --trilha primeiro.")
    if db.execute(
        "select 1 from materias where turma_id = %s and nome = %s", (turma["id"], MATERIA)
    ).fetchone():
        sys.exit(f"A trilha de {MATERIA} já existe na turma de demonstração. Nada foi criado.")
    materia = criar_materia(db, turma["id"], MATERIA)
    for nome, texto in TOPICOS:
        topico = criar_topico(db, materia["id"], nome)
        guardar_material(db, topico["id"], f"{nome} (demonstração).pdf", texto)


def main() -> None:
    load_dotenv()
    if "--trilha" in sys.argv:
        if not os.getenv("DATABASE_URL"):
            sys.exit("Falta o DATABASE_URL no backend/.env")
        with psycopg.connect(
            os.environ["DATABASE_URL"], row_factory=dict_row, prepare_threshold=None, connect_timeout=10
        ) as db:
            semear_trilha(db)
        print(f"Trilha de {MATERIA} criada na turma {TURMA[0]}, com {len(TOPICOS)} tópicos e material.")
        return

    faltando = [v for v in ("DATABASE_URL", "SUPABASE_URL", "SUPABASE_SECRET_KEY") if not os.getenv(v)]
    if faltando:
        sys.exit(f"Faltam no backend/.env: {', '.join(faltando)}")

    senha = getpass.getpass("Senha das contas de demonstração (mínimo 8 caracteres): ")
    if len(senha) < 8 or senha != getpass.getpass("Repita a senha: "):
        sys.exit("Senha curta demais ou as duas não conferem. Nada foi criado.")

    # Uma transação só: se algo falhar no banco, escola, perfis e turma são desfeitos juntos.
    with psycopg.connect(
        os.environ["DATABASE_URL"], row_factory=dict_row, prepare_threshold=None, connect_timeout=10
    ) as db:
        codigo = semear(db, senha)

    print(f"Demonstração criada na {ESCOLA}, turma {TURMA[0]} (código {codigo}).")
    print(f"Aluno: {ALUNO[1]} · Professor: {PROFESSOR[1]} · mesma senha que você digitou.")


if __name__ == "__main__":
    main()
