import os
import time
from fastapi import Request, HTTPException, status

# CONSTANTES DE LIMITE
# Numa escola, toda a turma costuma navegar sob o mesmo IP público (NAT).
# 30 requisições/minuto comporta uma turma inteira perguntando ao mesmo tempo.
# 500 requisições/dia garante que um único IP consuma no máximo ~1/3 da cota diária do Gemini.
#
# LIMITE TÉCNICO E ARQUITETURAL:
# 1. Como a contagem é em memória, os dados são zerados quando o servidor reinicia (ex: cold start do Render).
# 2. Sem autenticação/login de usuário, não há como impor limites individuais por aluno.
LIMITE_POR_MINUTO = 30
LIMITE_POR_DIA = 500

# Histórico de requisições por IP em memória: { "IP": [timestamp1, timestamp2, ...] }
ip_request_history: dict[str, list[float]] = {}


def get_client_ip(request: Request) -> str:
    """
    Obtém o IP real do cliente lendo o cabeçalho X-Forwarded-For da direita para a esquerda.
    Cada proxy adiciona o IP de quem se conectou a ele no FINAL da lista.
    O primeiro IP da lista é enviado pelo cliente e pode ser forjado.
    """
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    
    if x_forwarded_for:
        # Quantidade de proxies confiáveis na frente do servidor (padrão: 1)
        try:
            proxies_confiaveis = int(os.getenv("PROXIES_CONFIAVEIS", "1"))
        except ValueError:
            proxies_confiaveis = 1
            
        ips = [ip.strip() for ip in x_forwarded_for.split(",") if ip.strip()]
        
        # Pega o IP inserido pelo nosso proxy confiável (lendo da direita para a esquerda)
        if len(ips) >= proxies_confiaveis:
            return ips[-proxies_confiaveis]

    return request.client.host if request.client else "127.0.0.1"


def check_rate_limit(request: Request) -> None:
    """
    Verifica se o IP excedeu os limites por minuto ou por dia.
    Lança HTTPException com a estrutura esperada pelo padrão de erro do app.
    """
    client_ip = get_client_ip(request)
    now = time.time()
    
    timestamps = ip_request_history.get(client_ip, [])
    
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
    ip_request_history[client_ip] = timestamps