import os
from collections.abc import Iterator

import psycopg
from psycopg.rows import dict_row


class BancoIndisponivel(Exception):
    pass


def conexao() -> Iterator[psycopg.Connection]:
    """
    Dependência do FastAPI: uma conexão por requisição, com as linhas vindo como dicionário.
    Confirma (commit) se a rota terminou bem, desfaz (rollback) se ela levantou erro.

        def rota(db: psycopg.Connection = Depends(conexao)): ...
    """
    url = os.getenv("DATABASE_URL")
    if not url:
        raise BancoIndisponivel("DATABASE_URL nao configurada")
    try:
        # prepare_threshold=None: o pooler do Supabase não aceita prepared statements.
        # shortcut: abre uma conexão por requisição, trocar por psycopg_pool se a latência pesar.
        conn = psycopg.connect(url, row_factory=dict_row, prepare_threshold=None, connect_timeout=10)
    except psycopg.OperationalError:
        # from None: o erro original traz host e usuário do banco, e iria para o log (regra 2).
        raise BancoIndisponivel("nao foi possivel conectar ao banco") from None
    with conn:
        yield conn
