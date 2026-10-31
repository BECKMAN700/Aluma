import threading
import time
from fastapi import Depends, HTTPException, status

from nucleo.auth import Usuario, usuario_atual

# CONSTANTES DE LIMITE
# Numa escola, toda a turma costuma navegar sob o mesmo IP público (NAT).
# 30 requisições/minuto e 500 por dia são aplicadas individualmente por usuário.
#
# LIMITE TÉCNICO E ARQUITETURAL:
# 1. Como a contagem é em memória, os dados são zerados quando o servidor reinicia (ex: cold start do Render).
LIMITE_POR_MINUTO = 30
LIMITE_POR_DIA = 500

# Histórico de requisições por usuário em memória: { "usuario_id": [timestamps] }
user_request_history: dict[str, list[float]] = {}
_trava = threading.Lock()


def check_rate_limit(usuario: Usuario = Depends(usuario_atual)) -> None:
    """
    Verifica se o usuário excedeu os limites por minuto ou por dia.
    Lança HTTPException com a estrutura esperada pelo padrão de erro do app.
    """
    # O FastAPI roda dependências síncronas em várias threads: sem a trava, duas requisições
    # simultâneas leem a mesma lista e uma apaga o registro da outra.
    with _trava:
        now = time.time()

        timestamps = user_request_history.get(usuario.id, [])

        # Remove registros com mais de 24 horas (86.400 segundos)
        one_day_ago = now - 86400
        timestamps = [ts for ts in timestamps if ts > one_day_ago]

        # Filtra requisições do último minuto (60 segundos)
        one_minute_ago = now - 60
        requests_last_minute = [ts for ts in timestamps if ts > one_minute_ago]

        if len(requests_last_minute) >= LIMITE_POR_MINUTO or len(timestamps) >= LIMITE_POR_DIA:
            # Lança exceção com status 429
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="muitas perguntas seguidas, aguarde um pouco"
            )

        timestamps.append(now)
        user_request_history[usuario.id] = timestamps