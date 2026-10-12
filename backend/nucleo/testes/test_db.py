import pytest

from nucleo.db import BancoIndisponivel, conexao


def test_sem_database_url_falha_com_erro_claro(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    with pytest.raises(BancoIndisponivel):
        next(conexao())


def test_falha_de_conexao_nao_vaza_o_endereco(monkeypatch):
    # Porta 1 em localhost: ninguém escuta, a conexão é recusada na hora.
    monkeypatch.setenv("DATABASE_URL", "postgresql://usuario_x:senha_secreta@127.0.0.1:1/banco")
    with pytest.raises(BancoIndisponivel) as erro:
        next(conexao())
    assert erro.value.__cause__ is None
    assert erro.value.__suppress_context__
    for trecho in ("senha_secreta", "usuario_x", "127.0.0.1"):
        assert trecho not in str(erro.value)
