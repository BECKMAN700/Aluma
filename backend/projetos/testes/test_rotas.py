"""Rotas de projeto e o chat de projeto, com as permissões de verdade; o banco é trocado."""

from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from chat import rotas as chat_rotas
from main import app
from nucleo import consultas as permissao
from nucleo.auth import Usuario, usuario_atual
from nucleo.db import conexao
from nucleo.rate_limit import user_request_history
from projetos import consultas

ALUNO = Usuario(id="33333333-3333-3333-3333-333333333333", papel="aluno", escola_id="e")
CONVERSA = UUID("cccccccc-0000-0000-0000-000000000001")


@pytest.fixture
def cliente(monkeypatch):
    user_request_history.clear()
    monkeypatch.setattr(permissao, "aluno_tem_turma", lambda db, a: a == ALUNO.id)
    monkeypatch.setattr(consultas, "conversa_de_projeto_do_aluno", lambda db, c, a: (c, a) == (CONVERSA, ALUNO.id))
    app.dependency_overrides[conexao] = lambda: object()
    app.dependency_overrides[usuario_atual] = lambda: ALUNO
    yield TestClient(app)
    app.dependency_overrides.clear()


def como(papel: str, uid: str = ALUNO.id) -> None:
    app.dependency_overrides[usuario_atual] = lambda: Usuario(id=uid, papel=papel, escola_id="e")


def test_professor_e_aluno_sem_turma_nao_usam_projetos(cliente):
    como("professor")
    assert cliente.get("/api/projetos").status_code == 403
    como("aluno", "44444444-4444-4444-4444-444444444444")
    assert cliente.get("/api/projetos").status_code == 403


def test_nome_vazio_responde_422_e_teto_409(cliente, monkeypatch):
    assert cliente.post("/api/projetos", json={"nome": "   "}).status_code == 422
    monkeypatch.setattr(consultas, "criar_projeto", lambda db, a, n: None)
    assert cliente.post("/api/projetos", json={"nome": "Feira"}).status_code == 409


def test_mensagens_de_conversa_de_outro_responde_404(cliente):
    assert cliente.get(f"/api/conversas/{UUID(int=5)}/mensagens").status_code == 404


def test_chat_numa_conversa_de_outro_responde_404_sem_chamar_a_ia(cliente, monkeypatch):
    def nao_chama(*a, **k):
        raise AssertionError("a IA não pode ser chamada")

    monkeypatch.setattr(chat_rotas, "chat_com_claude", nao_chama)
    resposta = cliente.post("/api/chat", json={"mensagem": "oi", "conversa_id": str(UUID(int=5))})
    assert resposta.status_code == 404


def test_chat_com_topico_e_conversa_juntos_responde_422(cliente):
    corpo = {"mensagem": "oi", "conversa_id": str(CONVERSA), "topico_id": str(UUID(int=7))}
    assert cliente.post("/api/chat", json=corpo).status_code == 422


def test_chat_de_projeto_grava_e_da_titulo(cliente, monkeypatch):
    feito = []
    monkeypatch.setattr(chat_rotas, "chat_com_claude", lambda m, h, system, foto: "Boa pergunta")
    monkeypatch.setattr(chat_rotas.consultas, "ultimas_mensagens", lambda db, c, n: [])
    monkeypatch.setattr(chat_rotas.consultas, "nome_da_ia", lambda db, e: "Iara")
    monkeypatch.setattr(chat_rotas.consultas, "gravar_troca", lambda db, c, a, t: feito.append(("troca", c)))
    monkeypatch.setattr(consultas, "dar_titulo", lambda db, c, m: feito.append(("titulo", c)))
    resposta = cliente.post("/api/chat", json={"mensagem": "Como funciona?", "conversa_id": str(CONVERSA)})
    assert resposta.status_code == 200
    assert feito == [("troca", CONVERSA), ("titulo", CONVERSA)]
