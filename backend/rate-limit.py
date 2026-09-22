import time
from fastapi import Request, HTTPException, status

# Dicionário em memória para armazenar o histórico de requisições por IP
# Estrutura: { "IP": [timestamp1, timestamp2, ...] }
#
# LIMITAÇÃO TÉCNICA (para documentação/defesa):
# Esta contagem é perdida sempre que o servidor reinicia (ex: cold start no Render)
# e não é partilhada entre múltiplas instâncias do servidor. Para o âmbito acadêmico
# e de protótipo, atende perfeitamente aos requisitos de proteção da cota.
ip_request_history: dict[str, list[float]] = {}

def get_client_ip(request: Request) -> str:
    """
    Obtém o IP real do cliente.
    No Render, o pedido passa por um proxy reverso. O IP real vem no cabeçalho
    'X-Forwarded-For' (primeiro IP da lista). Se não existir, usa o request.client.host.
    """
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        # Pega o primeiro IP da lista separada por vírgulas
        return x_forwarded_for.split(",")[0].strip()
    
    return request.client.host if request.client else "127.0.0.1"


def check_rate_limit(request: Request) -> None:
    """
    Verifica se o IP excedeu os limites de:
    - 20 requisições por minuto
    - 300 requisições por dia
    """
    client_ip = get_client_ip(request)
    now = time.time()
    
    # Obtém o histórico do IP ou inicializa uma lista vazia
    timestamps = ip_request_history.get(client_ip, [])
    
    # Remove timestamps com mais de 24 horas (86400 segundos)
    one_day_ago = now - 86400
    timestamps = [ts for ts in timestamps if ts > one_day_ago]
    
    # Filtra requisições do último minuto (60 segundos)
    one_minute_ago = now - 60
    requests_last_minute = [ts for ts in timestamps if ts > one_minute_ago]
    
    # Validação do limite por minuto (20 req/min)
    if len(requests_last_minute) >= 20:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"erro": "muitas perguntas seguidas, aguarde um pouco"}
        )
    
    # Validação do limite diário (300 req/dia)
    if len(timestamps) >= 300:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"erro": "muitas perguntas seguidas, aguarde um pouco"}
        )
    
    # Regista a requisição atual e atualiza o dicionário
    timestamps.append(now)
    ip_request_history[client_ip] = timestamps