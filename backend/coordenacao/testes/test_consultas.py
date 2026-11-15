"""O SQL do coordenador contra o Postgres de verdade: nada cruza a fronteira da escola."""

import os
import uuid
from datetime import date

import psycopg
import pytest
from psycopg.rows import dict_row

from chat import consultas as chat
from coordenacao import consultas
from materiais.consultas import criar_materia, criar_topico
from turmas.consultas import criar_turma

pytestmark = pytest.mark.skipif(
    not (os.getenv("CI") and os.getenv("DATABASE_URL")), reason="requer o Postgres do CI"
)


@pytest.fixture
def db():
    conn = psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row, prepare_threshold=None)
    yield conn
    conn.rollback()
    conn.close()


def escola_com_turma(db):
    escola = str(db.execute("insert into escolas (nome) values ('E') returning id").fetchone()["id"])
    return escola, criar_turma(db, escola, "9º ano 01", "9º ano")["id"]


def test_pre_cadastro_matricula_e_isola_por_escola(db):
    escola, turma = escola_com_turma(db)
    outra, turma_outra = escola_com_turma(db)

    aluno = consultas.pre_cadastrar_aluno(db, escola, turma, "Ana", "001", date(2012, 3, 4))
    # A mesma matrícula pode existir em outra escola, mas não na mesma.
    consultas.pre_cadastrar_aluno(db, outra, turma_outra, "Bia", "001", date(2012, 5, 6))
    with pytest.raises(consultas.MatriculaRepetida):
        consultas.pre_cadastrar_aluno(db, escola, turma, "Caio", "001", date(2012, 1, 1))

    assert consultas.alunos_da_turma(db, turma, escola) == [
        {"id": aluno["id"], "nome": "Ana", "matricula": "001", "entrou": False}
    ]
    assert consultas.alunos_da_turma(db, turma, outra) == []
    [linha] = consultas.turmas_da_escola(db, escola)
    assert (linha["alunos"], linha["materias"]) == (1, [])
    assert not consultas.turma_da_escola(db, turma, outra)


def test_transferir_e_remover_respeitam_a_escola(db):
    escola, turma = escola_com_turma(db)
    turma2 = criar_turma(db, escola, "1º ano 01", "1º ano")["id"]
    outra, turma_outra = escola_com_turma(db)
    aluno = consultas.pre_cadastrar_aluno(db, escola, turma, "Ana", "001", date(2012, 3, 4))["id"]

    assert not consultas.transferir_aluno(db, aluno, turma_outra, escola)  # destino de outra escola
    assert not consultas.transferir_aluno(db, aluno, turma2, outra)  # coordenador de outra escola
    assert consultas.transferir_aluno(db, aluno, turma2, escola)
    assert [a["nome"] for a in consultas.alunos_da_turma(db, turma2, escola)] == ["Ana"]

    professor = str(uuid.uuid4())
    consultas.criar_perfil_professor(db, professor, "Prof", escola)
    topico = criar_topico(db, criar_materia(db, turma2, "Mat", professor)["id"], "Frações")
    conversa = chat.criar_conversa(db, str(aluno), topico["id"])
    chat.gravar_troca(db, conversa, "oi", "olá")

    assert not consultas.remover_aluno(db, aluno, outra)
    assert consultas.remover_aluno(db, aluno, escola)
    assert db.execute("select count(*) as n from conversas where aluno_id = %s", (aluno,)).fetchone()["n"] == 0
    assert consultas.alunos_da_turma(db, turma2, escola) == []


def test_professores_e_materias_da_turma(db):
    escola, turma = escola_com_turma(db)
    outra, _ = escola_com_turma(db)
    professor = str(uuid.uuid4())
    consultas.criar_perfil_professor(db, professor, "Prof. Ana", escola)
    criar_materia(db, turma, "Matemática", professor)

    assert consultas.professor_da_escola(db, professor, escola)
    assert not consultas.professor_da_escola(db, professor, outra)
    assert consultas.professores_da_escola(db, escola) == [
        {"id": uuid.UUID(professor), "nome": "Prof. Ana", "materias": 1}
    ]
    [linha] = consultas.turmas_da_escola(db, escola)
    assert [(m["nome"], m["professor"]) for m in linha["materias"]] == [("Matemática", "Prof. Ana")]
    trocar = db.execute("select trocar_senha from perfis where id = %s", (professor,)).fetchone()
    assert trocar == {"trocar_senha": True}
