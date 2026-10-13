from uuid import UUID

import pytest
from fastapi import Depends, FastAPI, HTTPException
from fastapi.testclient import TestClient

from main import http_exception_handler
from nucleo import consultas
from nucleo.auth import Usuario, usuario_atual
from nucleo.db import conexao
from nucleo.permissoes import (
    exige_aluno,
    exige_aluno_da_turma,
    exige_dono_da_turma,
    exige_professor,
    exige_usuario_do_chat,
)

ID_TURMA = UUID("c084948c-0e8e-4c8d-b485-fb77891ca811")
ID_PROFESSOR = "9e36aecc-dc8b-4930-8508-e8e2593f8f1a"
ID_OUTRO_PROFESSOR = "3f720d0f-252b-4e6a-9ea4-10533e083776"
ID_ALUNO = "449b654c-1f08-4869-b2fb-aa22dfe4a81e"
ID_ESCOLA = "ff65579a-1f2b-41d6-8afd-74aac48b89c0"
ID_OUTRA_ESCOLA = "ca7fef21-4fa6-4fcb-aa87-1edac6a03d18"


@pytest.fixture
def app_test():
    app = FastAPI()
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.dependency_overrides[conexao] = lambda: object()

    @app.get("/professor")
    def rota_professor(usuario: Usuario = Depends(exige_professor)):
        return {"id": usuario.id}

    @app.get("/aluno")
    def rota_aluno(usuario: Usuario = Depends(exige_aluno)):
        return {"id": usuario.id}

    @app.get("/turmas/{id}/alunos")
    def rota_dono(usuario: Usuario = Depends(exige_dono_da_turma)):
        return {"id": usuario.id}

    @app.get("/turmas/{id}/conteudo")
    def rota_aluno_da_turma(usuario: Usuario = Depends(exige_aluno_da_turma)):
        return {"id": usuario.id}

    @app.post("/api/chat")
    def rota_chat(usuario: Usuario = Depends(exige_usuario_do_chat)):
        return {"id": usuario.id}

    return app


def cliente_com_usuario(app_test, usuario: Usuario) -> TestClient:
    app_test.dependency_overrides[usuario_atual] = lambda: usuario
    return TestClient(app_test)


def test_aluno_em_rota_de_professor_recebe_403(app_test):
    cliente = cliente_com_usuario(
        app_test, Usuario(id=ID_ALUNO, papel="aluno", escola_id=ID_ESCOLA)
    )

    resposta = cliente.get("/professor")

    assert resposta.status_code == 403
    assert resposta.json() == {"erro": "voce nao tem acesso a isso"}


def test_professor_em_rota_de_aluno_recebe_403(app_test):
    cliente = cliente_com_usuario(
        app_test, Usuario(id=ID_PROFESSOR, papel="professor", escola_id=ID_ESCOLA)
    )

    resposta = cliente.get("/aluno")

    assert resposta.status_code == 403
    assert resposta.json() == {"erro": "voce nao tem acesso a isso"}


@pytest.mark.parametrize(
    "professor_id, escola_id",
    [(ID_OUTRO_PROFESSOR, ID_ESCOLA), (ID_PROFESSOR, ID_OUTRA_ESCOLA)],
)
def test_professor_sem_posse_ou_de_outra_escola_recebe_404(
    app_test, monkeypatch, professor_id, escola_id
):
    monkeypatch.setattr(consultas, "professor_dono_da_turma", lambda *args: False)
    cliente = cliente_com_usuario(
        app_test,
        Usuario(id=professor_id, papel="professor", escola_id=escola_id),
    )

    resposta = cliente.get(f"/turmas/{ID_TURMA}/alunos")

    assert resposta.status_code == 404
    assert resposta.json() == {"erro": "turma nao encontrada"}


def test_aluno_sem_turma_nao_acessa_chat(app_test, monkeypatch):
    monkeypatch.setattr(consultas, "aluno_tem_turma", lambda *args: False)
    cliente = cliente_com_usuario(
        app_test, Usuario(id=ID_ALUNO, papel="aluno", escola_id=None)
    )

    resposta = cliente.post("/api/chat")

    assert resposta.status_code == 403
    assert resposta.json() == {"erro": "voce precisa estar em uma turma"}


def test_professor_pode_acessar_chat_sem_consultar_matricula(app_test, monkeypatch):
    def consulta_nao_esperada(*args):
        pytest.fail("professor nao precisa de matricula para acessar o chat")

    monkeypatch.setattr(consultas, "aluno_tem_turma", consulta_nao_esperada)
    cliente = cliente_com_usuario(
        app_test, Usuario(id=ID_PROFESSOR, papel="professor", escola_id=ID_ESCOLA)
    )

    resposta = cliente.post("/api/chat")

    assert resposta.status_code == 200
    assert resposta.json() == {"id": ID_PROFESSOR}


@pytest.mark.parametrize(
    "metodo, caminho",
    [
        ("get", "/professor"),
        ("get", "/aluno"),
        ("get", f"/turmas/{ID_TURMA}/alunos"),
        ("get", f"/turmas/{ID_TURMA}/conteudo"),
        ("post", "/api/chat"),
    ],
)
def test_sem_login_recebe_401_em_rotas_protegidas(app_test, metodo, caminho):
    resposta = getattr(TestClient(app_test), metodo)(caminho)

    assert resposta.status_code == 401
    assert resposta.json()["erro"]


def test_professor_dono_acessa_a_propria_turma(app_test, monkeypatch):
    monkeypatch.setattr(consultas, "professor_dono_da_turma", lambda *args: True)
    cliente = cliente_com_usuario(
        app_test, Usuario(id=ID_PROFESSOR, papel="professor", escola_id=ID_ESCOLA)
    )

    resposta = cliente.get(f"/turmas/{ID_TURMA}/alunos")

    assert resposta.status_code == 200
    assert resposta.json() == {"id": ID_PROFESSOR}


def test_falha_na_consulta_negar_acesso(app_test, monkeypatch):
    def consulta_com_erro(*args):
        raise RuntimeError("falha no banco")

    monkeypatch.setattr(consultas, "professor_dono_da_turma", consulta_com_erro)
    cliente = cliente_com_usuario(
        app_test, Usuario(id=ID_PROFESSOR, papel="professor", escola_id=ID_ESCOLA)
    )

    resposta = cliente.get(f"/turmas/{ID_TURMA}/alunos")

    assert resposta.status_code == 503
    assert resposta.json() == {"erro": "nao foi possivel verificar a permissao"}


class ResultadoConsulta:
    def __init__(self, linha):
        self.linha = linha

    def fetchone(self):
        return self.linha


class BancoDeTeste:
    def __init__(self, linha):
        self.linha = linha
        self.sql = ""
        self.parametros = None

    def execute(self, sql, parametros):
        self.sql = sql
        self.parametros = parametros
        return ResultadoConsulta(self.linha)


def test_consulta_de_dono_filtra_turma_professor_e_escola():
    db = BancoDeTeste((1,))

    assert consultas.professor_dono_da_turma(db, ID_TURMA, ID_PROFESSOR, ID_ESCOLA)
    assert "professor_id = %s" in db.sql
    assert "escola_id = %s" in db.sql
    assert db.parametros == (ID_TURMA, ID_PROFESSOR, ID_ESCOLA)


def test_consulta_de_matricula_filtra_aluno_turma_e_escola():
    db = BancoDeTeste(None)

    assert not consultas.aluno_matriculado_na_turma(db, ID_TURMA, ID_ALUNO, ID_ESCOLA)
    assert "join turmas" in db.sql
    assert "m.aluno_id = %s" in db.sql
    assert "t.escola_id = %s" in db.sql
    assert db.parametros == (ID_TURMA, ID_ALUNO, ID_ESCOLA)