# Backend do Aluma

API REST que o app consome. FastAPI + Gemini. O servidor **não guarda conversa**: o histórico
chega do app a cada pergunta.

## Rodar local

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows;  no Linux/macOS: source .venv/bin/activate
pip install -r requirements-dev.txt
```

Crie `backend/.env` a partir do `.env.example` e coloque a sua `GEMINI_API_KEY`
(pegue em aistudio.google.com). O `.env` está no `.gitignore` e **nunca** vai para o Git.

```bash
uvicorn main:app --reload
```

Testes rápidos:

```bash
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/chat -H "Content-Type: application/json" -d "{\"mensagem\":\"como resolvo 3x + 5 = 20?\",\"historico\":[]}"
```

Documentação interativa das rotas: http://localhost:8000/docs

## Subir no servidor (Render, issue #47)

Os módulos (`main.py`, `gemini.py`) são importados pelo nome simples, então o processo precisa
enxergar `backend/` como raiz. Rodando da raiz do repositório, use `--app-dir`:

```
uvicorn main:app --app-dir backend --host 0.0.0.0 --port $PORT
```

A `GEMINI_API_KEY` vai no painel de *Environment* do Render. Nunca no código, no commit, na URL
ou no log — é a regra inviolável 2.

## Contrato da API

Combinado com o time. O `services/chat.ts` do app é escrito contra ele: mudança passa pelo grupo.

```
GET /health
200 -> {"status": "ok"}

POST /api/chat
envia -> {"mensagem": "como resolvo 3x + 5 = 20?",
          "historico": [{"autor": "aluno", "texto": "..."},
                        {"autor": "tutor", "texto": "..."}]}
200   -> {"resposta": "O que você pode fazer dos dois lados para isolar o 3x?"}
422   -> {"erro": "mensagem vazia"}            (Flávio, issue #39)
429   -> {"erro": "muitas perguntas seguidas"} (Gustavo, issue #42)
503   -> {"erro": "tutor indisponivel"}        (quando o Gemini falhar)
```

## Arquivos

| Arquivo | Dono | O que faz |
|---|---|---|
| `main.py` | Giordano | Rotas e middleware de log |
| `gemini.py` | Giordano | Conversa com a IA, isolada aqui |
| `prompt.py` | Thales (#46) | System prompt socrático — ponto de encaixe em `gemini.py` |
| `validation.py` | Flávio (#39) | Validação da entrada no servidor |
| `rate_limit.py` | Gustavo (#42) | Limite por IP e CORS |

Arquivo separado por pessoa é de propósito: ninguém edita a mesma linha e o Git não gera conflito.

## Log e privacidade

O middleware registra horário, método, rota, status e duração. **Nunca** o texto da pergunta ou
da resposta. Quando a IA falha, o log grava só o **tipo** do erro — a mensagem crua de uma
exceção pode carregar trecho do payload, e payload é conversa de aluno menor de idade
(regras invioláveis 2 e 8). Se alguém pedir o conteúdo "só para depurar", a resposta é não.
