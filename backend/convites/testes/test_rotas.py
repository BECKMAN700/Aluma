"""Rotas do convite com a permissão e o limite de tentativas de verdade; o banco é trocado."""

from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from convites import consultas, rotas
from main import app
from nucleo.auth import Usuario, usuario_atual
from nucleo.db import conexao

CONVITE = UUID("abababab-abab-abab-abab-abababababab")
ALUNO_NOVO = Usuario(id="33333333-3333-3333-3333-333333333333", papel="aluno", escola_id=None)
URL = f"/api/convites/{CONVITE}/entrar"
DADOS = {"matricula": "001", "nascimento": "2012-03-04"}


@pytest.fixture
def cliente():
    rotas._erros.clear()
    app.dependency_overrides[conexao] = lambda: object()
    app.dependency_overrides[usuario_atual] = lambda: ALUNO_NOVO
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_entra_e_recebe_escola_e_turma(cliente, monkeypatch):
    certo = {"escola": {"id": "e", "nome": "Colégio"}, "turma": {"id": "t", "nome": "9º ano 01"}}
    monkeypatch.setattr(consultas, "entrar_pelo_convite", lambda db, c, l, m, n: certo)
    resposta = cliente.post(URL, json=DADOS)
    assert resposta.status_code == 200
    assert resposta.json() == certo


def test_dados_errados_tem_frase_generica_e_bloqueiam_depois_de_5(cliente, monkeypatch):
    monkeypatch.setattr(consultas, "entrar_pelo_convite", lambda *a: None)
    for _ in range(rotas.ERROS_POR_CONTA):
        resposta = cliente.post(URL, json=DADOS)
        assert resposta.status_code == 404
        assert resposta.json() == {"erro": rotas.NAO_ENCONTRADO}
    resposta = cliente.post(URL, json=DADOS)
    assert resposta.status_code == 429
    assert resposta.json() == {"erro": "muitas tentativas, espere alguns minutos"}


def test_limite_por_escola_barra_varias_contas(cliente, monkeypatch):
    monkeypatch.setattr(consultas, "entrar_pelo_convite", lambda *a: None)
    for i in range(rotas.ERROS_POR_ESCOLA):
        rotas._anotar_erro(f"conta-{i}", str(CONVITE))
    assert cliente.post(URL, json=DADOS).status_code == 429


@pytest.mark.parametrize("papel", ["professor", "coordenador"])
def test_so_aluno_usa_o_convite(cliente, papel):
    app.dependency_overrides[usuario_atual] = lambda: Usuario(id=ALUNO_NOVO.id, papel=papel, escola_id=None)
    assert cliente.post(URL, json=DADOS).status_code == 403


def test_aluno_que_ja_tem_escola_recebe_409(cliente):
    app.dependency_overrides[usuario_atual] = lambda: Usuario(id=ALUNO_NOVO.id, papel="aluno", escola_id="e")
    assert cliente.post(URL, json=DADOS).status_code == 409


def test_sem_login_nao_entra(cliente):
    del app.dependency_overrides[usuario_atual]
    assert cliente.post(URL, json=DADOS).status_code == 401


def test_tela_do_convite_nao_precisa_de_login(cliente, monkeypatch):
    del app.dependency_overrides[usuario_atual]
    monkeypatch.setattr(consultas, "escola_do_convite", lambda db, c: {"id": "e", "nome": "Colégio", "nome_da_ia": "Luma", "cor": "#f5a623"} if c == CONVITE else None)
    assert cliente.get(f"/api/convites/{CONVITE}").json()["nome_da_ia"] == "Luma"
    assert cliente.get("/api/convites/00000000-0000-0000-0000-000000000000").status_code == 404
