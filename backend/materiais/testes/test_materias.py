"""Rotas de matéria e tópico com as permissões de verdade; só o banco é trocado."""

from pathlib import Path
from uuid import UUID

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.testclient import TestClient

from main import http_exception_handler, validation_exception_handler
from materiais import pdf, rotas
from nucleo import consultas as permissao
from nucleo.auth import Usuario, usuario_atual
from nucleo.db import conexao

TURMA = UUID("dddddddd-dddd-dddd-dddd-dddddddddddd")
MATERIA = UUID("aaaaaaaa-0000-0000-0000-000000000001")
TOPICO = UUID("bbbbbbbb-0000-0000-0000-000000000001")
PDFS = Path(__file__).parent / "pdfs"
ESCOLA = "cccccccc-cccc-cccc-cccc-cccccccccccc"
PROFESSOR = Usuario(id="11111111-1111-1111-1111-111111111111", papel="professor", escola_id=ESCOLA)
OUTRO_PROFESSOR = Usuario(id="22222222-2222-2222-2222-222222222222", papel="professor", escola_id=ESCOLA)
ALUNO = Usuario(id="33333333-3333-3333-3333-333333333333", papel="aluno", escola_id=None)
OUTRO_ALUNO = Usuario(id="44444444-4444-4444-4444-444444444444", papel="aluno", escola_id=None)


@pytest.fixture
def cliente(monkeypatch):
    """O banco de mentira sabe só isto: a TURMA (e a MATERIA dela) são do PROFESSOR e do ALUNO."""
    monkeypatch.setattr(
        permissao, "professor_dono_da_turma", lambda db, t, p, e: (t, p) == (TURMA, PROFESSOR.id)
    )
    monkeypatch.setattr(
        permissao, "professor_dono_da_materia", lambda db, m, p, e: (m, p) == (MATERIA, PROFESSOR.id)
    )
    monkeypatch.setattr(
        permissao, "professor_dono_do_topico", lambda db, t, p, e: (t, p) == (TOPICO, PROFESSOR.id)
    )
    monkeypatch.setattr(
        permissao, "aluno_matriculado_na_turma", lambda db, t, a: (t, a) == (TURMA, ALUNO.id)
    )
    monkeypatch.setattr(rotas, "criar_materia", lambda **k: {"id": str(MATERIA), "nome": k["nome"], "topicos": []})
    monkeypatch.setattr(rotas, "materias_da_turma", lambda **k: [{"id": str(MATERIA), "nome": "Matemática", "topicos": []}])
    monkeypatch.setattr(
        rotas, "guardar_material",
        lambda **k: {"topico_id": str(k["topico_id"]), "nome_arquivo": k["nome_arquivo"], "caracteres": len(k["texto"])},
    )
    monkeypatch.setattr(rotas, "renomear_materia", lambda **k: {"id": str(MATERIA), "nome": k["nome"]})
    monkeypatch.setattr(rotas, "renomear_topico", lambda **k: {"id": str(TOPICO), "nome": k["nome"], "ordem": 1})
    monkeypatch.setattr(rotas, "mover_topico", lambda **k: [{"id": str(TOPICO), "ordem": 2}])
    monkeypatch.setattr(rotas, "excluir_topico_vazio", lambda **k: True)
    monkeypatch.setattr(rotas, "excluir_materia_vazia", lambda **k: True)
    monkeypatch.setattr(rotas, "criar_topico", lambda **k: {"id": "t1", "nome": k["nome"], "ordem": 1})

    app = FastAPI()
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.include_router(rotas.router)
    app.dependency_overrides[conexao] = lambda: object()

    def como(usuario: Usuario) -> TestClient:
        app.dependency_overrides[usuario_atual] = lambda: usuario
        return TestClient(app)

    return como


def test_professor_dono_cria_materia(cliente):
    r = cliente(PROFESSOR).post(f"/api/turmas/{TURMA}/materias", json={"nome": "  Matemática "})

    assert r.status_code == 201
    assert r.json() == {"id": str(MATERIA), "nome": "Matemática", "topicos": []}


@pytest.mark.parametrize("usuario", [PROFESSOR, ALUNO])
def test_professor_dono_e_aluno_da_turma_listam_materias(cliente, usuario):
    r = cliente(usuario).get(f"/api/turmas/{TURMA}/materias")

    assert r.status_code == 200
    assert r.json()["materias"][0]["nome"] == "Matemática"


def test_professor_dono_cria_topico(cliente):
    r = cliente(PROFESSOR).post(f"/api/materias/{MATERIA}/topicos", json={"nome": "Frações"})

    assert r.status_code == 201
    assert r.json() == {"id": "t1", "nome": "Frações", "ordem": 1}


@pytest.mark.parametrize(
    "usuario, metodo, caminho, corpo, erro",
    [
        (OUTRO_PROFESSOR, "post", f"/api/turmas/{TURMA}/materias", {"nome": "X"}, "turma nao encontrada"),
        (OUTRO_PROFESSOR, "get", f"/api/turmas/{TURMA}/materias", None, "turma nao encontrada"),
        (OUTRO_ALUNO, "get", f"/api/turmas/{TURMA}/materias", None, "turma nao encontrada"),
        (OUTRO_PROFESSOR, "post", f"/api/materias/{MATERIA}/topicos", {"nome": "X"}, "materia nao encontrada"),
    ],
)
def test_quem_e_de_outra_turma_recebe_404(cliente, usuario, metodo, caminho, corpo, erro):
    r = cliente(usuario).request(metodo, caminho, json=corpo)

    assert r.status_code == 404
    assert r.json() == {"erro": erro}


@pytest.mark.parametrize(
    "metodo, caminho, corpo",
    [
        ("post", f"/api/turmas/{TURMA}/materias", {"nome": "X"}),
        ("post", f"/api/materias/{MATERIA}/topicos", {"nome": "X"}),
    ],
)
def test_aluno_da_turma_nao_cria_materia_nem_topico(cliente, metodo, caminho, corpo):
    r = cliente(ALUNO).request(metodo, caminho, json=corpo)

    assert r.status_code == 403


@pytest.mark.parametrize(
    "caminho",
    [f"/api/turmas/{TURMA}/materias", f"/api/materias/{MATERIA}/topicos"],
)
@pytest.mark.parametrize("corpo", [{"nome": "   "}, {"nome": "x" * 81}, {"nome": "X", "extra": 1}])
def test_nome_invalido_retorna_422(cliente, caminho, corpo):
    r = cliente(PROFESSOR).post(caminho, json=corpo)

    assert r.status_code == 422
    assert r.json()["erro"]


def test_sem_login_retorna_401():
    app = FastAPI()
    app.include_router(rotas.router)
    app.dependency_overrides[conexao] = lambda: object()

    r = TestClient(app).get(f"/api/turmas/{TURMA}/materias")

    assert r.status_code == 401


def enviar(cliente, usuario, conteudo: bytes, nome: str = "Fra%C3%A7%C3%B5es.pdf"):
    return cliente(usuario).post(
        f"/api/topicos/{TOPICO}/materiais",
        content=conteudo,
        headers={"Content-Type": "application/pdf", "X-Nome-Arquivo": nome},
    )


def test_professor_dono_envia_pdf_com_texto(cliente):
    r = enviar(cliente, PROFESSOR, (PDFS / "com_texto.pdf").read_bytes())

    assert r.status_code == 201
    assert r.json()["nome_arquivo"] == "Frações.pdf"
    assert r.json()["caracteres"] > 0


@pytest.mark.parametrize(
    "arquivo, erro",
    [("escaneado.pdf", "não contém texto selecionável"), (None, "não é um PDF válido")],
)
def test_pdf_escaneado_ou_falso_e_recusado_com_mensagem(cliente, arquivo, erro):
    conteudo = (PDFS / arquivo).read_bytes() if arquivo else b"isto nao e pdf"

    r = enviar(cliente, PROFESSOR, conteudo)

    assert r.status_code == 422
    assert erro in r.json()["erro"]


def test_pdf_grande_demais_para_de_ler_e_devolve_413(cliente, monkeypatch):
    monkeypatch.setattr(pdf, "TAMANHO_MAXIMO_BYTES", 100)

    r = enviar(cliente, PROFESSOR, b"%PDF-" + b"0" * 200)

    assert r.status_code == 413
    assert r.json() == {"erro": "O PDF deve ter no máximo 5 MB."}


@pytest.mark.parametrize("usuario, status", [(OUTRO_PROFESSOR, 404), (ALUNO, 403)])
def test_so_o_dono_do_topico_envia_pdf(cliente, usuario, status):
    r = enviar(cliente, usuario, (PDFS / "com_texto.pdf").read_bytes())

    assert r.status_code == status


EDICOES = [
    ("patch", f"/api/materias/{MATERIA}", {"nome": "Matemática B"}, "materia nao encontrada"),
    ("delete", f"/api/materias/{MATERIA}", None, "materia nao encontrada"),
    ("patch", f"/api/topicos/{TOPICO}", {"nome": "Frações 2"}, "topico nao encontrado"),
    ("post", f"/api/topicos/{TOPICO}/mover", {"direcao": "baixo"}, "topico nao encontrado"),
    ("delete", f"/api/topicos/{TOPICO}", None, "topico nao encontrado"),
]


@pytest.mark.parametrize("metodo, caminho, corpo, erro", EDICOES)
def test_so_o_dono_edita_e_quem_e_de_fora_recebe_404(cliente, metodo, caminho, corpo, erro):
    assert cliente(PROFESSOR).request(metodo, caminho, json=corpo).status_code == 200
    r = cliente(OUTRO_PROFESSOR).request(metodo, caminho, json=corpo)
    assert (r.status_code, r.json()) == (404, {"erro": erro})
    assert cliente(ALUNO).request(metodo, caminho, json=corpo).status_code == 403


@pytest.mark.parametrize("corpo", [{"direcao": "lado"}, {}, {"direcao": "cima", "x": 1}])
def test_direcao_invalida_retorna_422(cliente, corpo):
    assert cliente(PROFESSOR).post(f"/api/topicos/{TOPICO}/mover", json=corpo).status_code == 422


@pytest.mark.parametrize("caminho, funcao", [
    (f"/api/topicos/{TOPICO}", "excluir_topico_vazio"),
    (f"/api/materias/{MATERIA}", "excluir_materia_vazia"),
])
def test_excluir_com_conteudo_retorna_409(cliente, monkeypatch, caminho, funcao):
    monkeypatch.setattr(rotas, funcao, lambda **k: False)

    r = cliente(PROFESSOR).delete(caminho)

    assert r.status_code == 409
    assert r.json()["erro"]
