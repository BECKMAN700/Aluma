"""Rotas do coordenador com a permissão de verdade; só o banco e o Supabase são trocados."""

from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from coordenacao import consultas, rotas
from main import app
from nucleo import supabase_admin
from nucleo.auth import Usuario, usuario_atual
from nucleo.db import conexao

ESCOLA = "cccccccc-cccc-cccc-cccc-cccccccccccc"
TURMA = UUID("dddddddd-dddd-dddd-dddd-dddddddddddd")
TURMA_DE_OUTRA_ESCOLA = UUID("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee")
PROFESSOR = UUID("11111111-1111-1111-1111-111111111111")
COORDENADOR = Usuario(id="99999999-9999-9999-9999-999999999999", papel="coordenador", escola_id=ESCOLA)
ALUNO_OK = {"nome": "Ana Souza", "matricula": "2026-001", "nascimento": "2012-03-04"}


@pytest.fixture
def cliente(monkeypatch):
    monkeypatch.setattr(consultas, "turma_da_escola", lambda db, t, e: (t, e) == (TURMA, ESCOLA))
    monkeypatch.setattr(consultas, "professor_da_escola", lambda db, p, e: (p, e) == (PROFESSOR, ESCOLA))
    app.dependency_overrides[conexao] = lambda: object()
    app.dependency_overrides[usuario_atual] = lambda: COORDENADOR
    yield TestClient(app)
    app.dependency_overrides.clear()


def como(papel: str, escola: str | None = ESCOLA) -> None:
    app.dependency_overrides[usuario_atual] = lambda: Usuario(id=COORDENADOR.id, papel=papel, escola_id=escola)


@pytest.mark.parametrize("papel", ["professor", "aluno", "admin"])
def test_so_coordenador_entra(cliente, papel):
    como(papel)
    assert cliente.get("/api/coordenacao/turmas").status_code == 403


def test_coordenador_sem_escola_recebe_403(cliente):
    como("coordenador", None)
    assert cliente.get("/api/coordenacao/turmas").status_code == 403


def test_turma_de_outra_escola_responde_404(cliente):
    url = f"/api/coordenacao/turmas/{TURMA_DE_OUTRA_ESCOLA}/alunos"
    assert cliente.post(url, json=ALUNO_OK).status_code == 404
    assert cliente.get(url).status_code == 404


def test_pre_cadastra_aluno(cliente, monkeypatch):
    recebido = {}

    def falso(db, escola, turma, nome, matricula, nascimento):
        recebido.update(escola=escola, turma=turma, nome=nome, matricula=matricula)
        return {"id": "x", "nome": nome, "matricula": matricula, "entrou": False}

    monkeypatch.setattr(consultas, "pre_cadastrar_aluno", falso)
    resposta = cliente.post(
        f"/api/coordenacao/turmas/{TURMA}/alunos", json={**ALUNO_OK, "nome": " <b>Ana</b> Souza "}
    )
    assert resposta.status_code == 201
    assert recebido == {"escola": ESCOLA, "turma": TURMA, "nome": "Ana Souza", "matricula": "2026-001"}


@pytest.mark.parametrize(
    "campo, valor",
    [("matricula", "12 34"), ("matricula", ""), ("nascimento", "2999-01-01"), ("nome", "   ")],
)
def test_pre_cadastro_invalido_responde_422(cliente, campo, valor):
    resposta = cliente.post(f"/api/coordenacao/turmas/{TURMA}/alunos", json={**ALUNO_OK, campo: valor})
    assert resposta.status_code == 422


def test_matricula_repetida_responde_409(cliente, monkeypatch):
    def repetida(*a):
        raise consultas.MatriculaRepetida("2026-001")

    monkeypatch.setattr(consultas, "pre_cadastrar_aluno", repetida)
    resposta = cliente.post(f"/api/coordenacao/turmas/{TURMA}/alunos", json=ALUNO_OK)
    assert resposta.status_code == 409


def test_cria_professor_com_senha_provisoria(cliente, monkeypatch):
    monkeypatch.setattr(supabase_admin, "criar_login", lambda email, senha: str(PROFESSOR))
    monkeypatch.setattr(
        consultas, "criar_perfil_professor",
        lambda db, pid, nome, escola: {"id": pid, "nome": nome, "materias": 0},
    )
    resposta = cliente.post(
        "/api/coordenacao/professores", json={"nome": "Prof. Ana", "email": " Ana@Escola.edu.br "}
    )
    assert resposta.status_code == 201
    corpo = resposta.json()
    assert corpo["email"] == "ana@escola.edu.br"
    assert len(corpo["senha_provisoria"]) == 10


def test_email_ja_usado_responde_409(cliente, monkeypatch):
    def ja_existe(email, senha):
        raise supabase_admin.EmailJaCadastrado(email)

    monkeypatch.setattr(supabase_admin, "criar_login", ja_existe)
    resposta = cliente.post("/api/coordenacao/professores", json={"nome": "Prof. Ana", "email": "ana@escola.edu.br"})
    assert resposta.status_code == 409


def test_email_invalido_responde_422(cliente):
    resposta = cliente.post("/api/coordenacao/professores", json={"nome": "Prof. Ana", "email": "ana@"})
    assert resposta.status_code == 422


def test_ligar_professor_de_outra_escola_responde_404(cliente):
    outro = "22222222-2222-2222-2222-222222222222"
    resposta = cliente.post(
        f"/api/coordenacao/turmas/{TURMA}/materias", json={"nome": "Matemática", "professor_id": outro}
    )
    assert resposta.status_code == 404


def test_liga_professor_criando_a_materia(cliente, monkeypatch):
    monkeypatch.setattr(rotas, "criar_materia", lambda db, t, nome, p: {"id": "m", "nome": nome, "topicos": []})
    resposta = cliente.post(
        f"/api/coordenacao/turmas/{TURMA}/materias", json={"nome": "Matemática", "professor_id": str(PROFESSOR)}
    )
    assert resposta.status_code == 201
    assert resposta.json() == {"id": "m", "nome": "Matemática"}


MARCA_OK = {
    "nome_do_sistema": "Portal CH", "nome_da_ia": "Iara", "cor": "#1E5BD8",
    "cor_secundaria": "#ffffff", "logo_formato": "quadrado",
}
PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 100


def test_salva_marca_com_cor_em_minusculas(cliente, monkeypatch):
    recebido = {}
    monkeypatch.setattr(consultas, "atualizar_marca", lambda db, e, m: recebido.update(m) or m)
    assert cliente.patch("/api/coordenacao/escola", json=MARCA_OK).status_code == 200
    assert recebido["cor"] == "#1e5bd8"


@pytest.mark.parametrize(
    "campo, valor",
    [("cor", "azul"), ("cor_secundaria", "#fff"), ("logo_formato", "estrela"), ("nome_da_ia", "  ")],
)
def test_marca_invalida_responde_422(cliente, campo, valor):
    assert cliente.patch("/api/coordenacao/escola", json={**MARCA_OK, campo: valor}).status_code == 422


def test_logo_pelo_conteudo_e_nao_pelo_cabecalho(cliente, monkeypatch):
    guardado = {}
    monkeypatch.setattr(consultas, "guardar_logo", lambda db, e, c, t: guardado.update(tipo=t))
    url = "/api/coordenacao/escola/logo"
    assert cliente.put(url, content=PNG, headers={"Content-Type": "image/jpeg"}).status_code == 204
    assert guardado == {"tipo": "image/png"}
    assert cliente.put(url, content=b"<svg onload=alert(1)>", headers={"Content-Type": "image/png"}).status_code == 422
    assert cliente.put(url, content=PNG + b"0" * rotas.LOGO_MAXIMO_BYTES).status_code == 413


def test_so_coordenador_muda_a_marca(cliente):
    como("professor")
    assert cliente.patch("/api/coordenacao/escola", json=MARCA_OK).status_code == 403
    assert cliente.put("/api/coordenacao/escola/logo", content=PNG).status_code == 403
