"""
Cria a demonstração inteira, toda fictícia (regra inviolável 5): duas escolas, cada uma com a sua
marca, coordenador, dois professores, a turma do 9º ano, um aluno que já entrou, três alunos só
pré-cadastrados (para mostrar o convite ao vivo) e a trilha de Matemática com material.
Roda só na máquina de quem tem a chave secreta do Supabase, nunca no servidor.

    cd backend
    python scripts/seed_demo.py            # cria as duas escolas
    python scripts/seed_demo.py --limpar   # apaga toda escola "(fictícia)" e os logins dela

Lê do backend/.env: DATABASE_URL, SUPABASE_URL e SUPABASE_SECRET_KEY. A senha das contas é pedida
no terminal, sem aparecer na tela. Se uma escola de demonstração já existir, nada é criado.
"""

import getpass
import os
import sys
from datetime import date
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

# Rodando como `python scripts/seed_demo.py`, a pasta backend/ não está no caminho de import.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from coordenacao.consultas import pre_cadastrar_aluno  # noqa: E402
from materiais.consultas import criar_materia, criar_topico, guardar_material  # noqa: E402
from nucleo import supabase_admin  # noqa: E402
from scripts.criar_professor import criar_login  # noqa: E402
from turmas.consultas import criar_turma  # noqa: E402

# O "(fictícia)" no nome é o sinal: o --limpar acha e apaga tudo da demo pela escola.
SINAL = "(fictícia)"
ESCOLAS = [
    {"nome": f"Colégio Horizonte {SINAL}", "sigla": "horizonte", "nome_da_ia": "Luma", "cor": "#f5a623"},
    {"nome": f"Escola Rio Azul {SINAL}", "sigla": "rioazul", "nome_da_ia": "Iara", "cor": "#1e6fd9"},
]
TURMA = ("9º ano 01", "9º ano")
MATERIA = "Matemática"
# Pré-cadastros para entrar pelo convite na apresentação: (nome, matrícula, nascimento).
PRE_CADASTROS = [
    ("Bruna Lima", "2026002", date(2012, 4, 10)),
    ("Caio Reis", "2026003", date(2012, 8, 22)),
    ("Duda Melo", "2026004", date(2011, 12, 1)),
]

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


def _perfil(db: psycopg.Connection, login_id: str, nome: str, papel: str, escola_id: str) -> None:
    db.execute(
        "insert into perfis (id, nome, papel, escola_id) values (%s, %s, %s, %s)",
        (login_id, nome, papel, escola_id),
    )


def semear_escola(db: psycopg.Connection, escola: dict, senha: str) -> dict:
    """Uma escola completa. Devolve o nome, o convite e os e-mails criados."""
    s = escola["sigla"]
    linha = db.execute(
        "insert into escolas (nome, nome_da_ia, cor) values (%s, %s, %s) returning id, convite",
        (escola["nome"], escola["nome_da_ia"], escola["cor"]),
    ).fetchone()
    escola_id = str(linha["id"])
    emails = {
        "coordenador": f"coord.{s}@exemplo.com",
        "matematica": f"prof.mat.{s}@exemplo.com",
        "portugues": f"prof.port.{s}@exemplo.com",
        "aluno": f"aluno.{s}@exemplo.com",
    }
    # shortcut: o login no Supabase não volta atrás com o rollback; se o banco falhar depois dele,
    # apague os usuários órfãos no painel (Authentication > Users) antes de rodar de novo.
    _perfil(db, criar_login(emails["coordenador"], senha), "Coord. Demonstração", "coordenador", escola_id)
    prof_mat = criar_login(emails["matematica"], senha)
    _perfil(db, prof_mat, "Prof. Ana (Matemática)", "professor", escola_id)
    prof_port = criar_login(emails["portugues"], senha)
    _perfil(db, prof_port, "Prof. Beto (Português)", "professor", escola_id)

    turma = criar_turma(db, escola_id, *TURMA)["id"]
    aluno = criar_login(emails["aluno"], senha)
    db.execute(
        "insert into perfis (id, nome, papel, escola_id, matricula, nascimento)"
        " values (%s, 'Aluno Demonstração', 'aluno', %s, '2026001', '2012-01-15')",
        (aluno, escola_id),
    )
    db.execute("insert into matriculas (aluno_id, turma_id) values (%s, %s)", (aluno, turma))
    for nome, matricula, nascimento in PRE_CADASTROS:
        pre_cadastrar_aluno(db, escola_id, turma, nome, matricula, nascimento)

    materia = criar_materia(db, turma, MATERIA, prof_mat)
    for nome, texto in TOPICOS:
        topico = criar_topico(db, materia["id"], nome)
        guardar_material(db, topico["id"], f"{nome} (demonstração).pdf", texto)
    criar_materia(db, turma, "Português", prof_port)
    return {"escola": escola["nome"], "convite": str(linha["convite"]), "emails": emails}


def semear(db: psycopg.Connection, senha: str) -> list[dict]:
    if db.execute("select 1 from escolas where nome like %s", (f"%{SINAL}",)).fetchone():
        sys.exit("Já existe escola de demonstração. Rode com --limpar antes. Nada foi criado.")
    return [semear_escola(db, escola, senha) for escola in ESCOLAS]


def limpar(db: psycopg.Connection) -> list[str]:
    """Apaga tudo das escolas fictícias, na ordem das chaves estrangeiras. Devolve os logins."""
    escolas = [r["id"] for r in db.execute("select id from escolas where nome like %s", (f"%{SINAL}",))]
    if not escolas:
        return []
    logins = [
        str(r["id"])
        for r in db.execute(
            "select id from perfis where escola_id = any(%s) and entrou_em is not null", (escolas,)
        )
    ]
    turmas = "select id from turmas where escola_id = any(%(e)s)"
    topicos = f"select tp.id from topicos tp join materias m on m.id = tp.materia_id where m.turma_id in ({turmas})"
    perfis = "select id from perfis where escola_id = any(%(e)s)"
    for sql in (
        f"delete from resumos_de_duvidas where topico_id in ({topicos})",
        f"delete from progresso where topico_id in ({topicos}) or aluno_id in ({perfis})",
        f"delete from conversas where topico_id in ({topicos}) or aluno_id in ({perfis})",
        f"delete from materiais where topico_id in ({topicos})",
        f"delete from topicos where id in ({topicos})",
        f"delete from materias where turma_id in ({turmas})",
        f"delete from matriculas where turma_id in ({turmas})",
        "delete from turmas where escola_id = any(%(e)s)",
        "delete from perfis where escola_id = any(%(e)s)",
        "delete from escolas where id = any(%(e)s)",
    ):
        db.execute(sql, {"e": escolas})
    return logins


def _conectar() -> psycopg.Connection:
    return psycopg.connect(
        os.environ["DATABASE_URL"], row_factory=dict_row, prepare_threshold=None, connect_timeout=10
    )


def main() -> None:
    load_dotenv()
    faltando = [v for v in ("DATABASE_URL", "SUPABASE_URL", "SUPABASE_SECRET_KEY") if not os.getenv(v)]
    if faltando:
        sys.exit(f"Faltam no backend/.env: {', '.join(faltando)}")

    if "--limpar" in sys.argv:
        with _conectar() as db:  # uma transação: ou apaga tudo, ou nada
            logins = limpar(db)
        sem_apagar = [login for login in logins if not supabase_admin.apagar_login(login)]
        print(f"Demonstração apagada: {len(logins)} contas.")
        if sem_apagar:
            print(f"{len(sem_apagar)} logins ficaram no Supabase; apague em Authentication > Users.")
        return

    senha = getpass.getpass("Senha das contas de demonstração (mínimo 8 caracteres): ")
    if len(senha) < 8 or senha != getpass.getpass("Repita a senha: "):
        sys.exit("Senha curta demais ou as duas não conferem. Nada foi criado.")

    with _conectar() as db:  # uma transação só: se o banco falhar, nada fica pela metade
        criadas = semear(db, senha)

    for escola in criadas:
        print(f"\n{escola['escola']} · convite: /convite/{escola['convite']}")
        for papel, email in escola["emails"].items():
            print(f"  {papel}: {email}")
    print("\nTodas com a senha que você digitou. Pré-cadastros para o convite (matrícula, nascimento):")
    for nome, matricula, nascimento in PRE_CADASTROS:
        print(f"  {nome}: {matricula}, {nascimento:%d/%m/%Y}")


if __name__ == "__main__":
    main()
