# Backend do Aluma

API REST que o app consome. FastAPI + Claude (principal) com Gemini de reserva. O servidor **não guarda conversa**: o histórico
chega do app a cada pergunta.

## Rodar local

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows;  no Linux/macOS: source .venv/bin/activate
pip install -r requirements-dev.txt
```

Crie `backend/.env` a partir do `.env.example` e coloque a sua `GEMINI_API_KEY`
(pegue em aistudio.google.com). A `ANTHROPIC_API_KEY` é opcional no local: sem ela o servidor
pula o Claude e responde só com o Gemini. O `.env` está no `.gitignore` e **nunca** vai para o Git.

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

O `render.yaml` na raiz do repositório já descreve o serviço (build, start, `rootDir: backend`,
health check em `/health`). Passo a passo:

1. No painel do Render: **New > Blueprint**, conecte o repositório `BECKMAN700/Aluma`.
2. O Render lê o `render.yaml` sozinho e propõe criar o serviço `aluma-backend`. Confirme.
3. Ele vai pedir os dois valores marcados `sync: false` (não ficam no arquivo, de propósito —
   regra inviolável 2):
   - `ANTHROPIC_API_KEY`: chave do workspace `Aluma` no console.anthropic.com. Só o João cria;
     o workspace tem limite de gasto de US$3/mês e a recarga automática fica desligada.
     Esgotou o limite, a Anthropic recusa e o Gemini assume
   - `GEMINI_API_KEY`: pegue em aistudio.google.com
   - `CORS_ORIGINS`: `http://localhost:8081` serve para testar já; depois que a versão web
     estiver publicada (issue #49), volte aqui e troque pela URL do Netlify
4. Deploy automático. Teste `https://<endereco>.onrender.com/health` — precisa responder
   `{"status": "ok"}`.
5. Avise a URL no grupo: o app (`EXPO_PUBLIC_API_URL`, issue #49) e a bateria anti-cola
   (issue #43) dependem dela.

Sem Blueprint (criando o Web Service manualmente na UI), os mesmos valores do `render.yaml`
se aplicam à mão: *Root Directory* `backend`, *Build Command* `pip install -r requirements.txt`,
*Start Command* `uvicorn main:app --host 0.0.0.0 --port $PORT`.

## Banco (Supabase, issue #87)

As tabelas estão em `migrations/`, um arquivo numerado por mudança. Para aplicar: painel do
Supabase > **SQL Editor**, cole o arquivo e rode. Arquivo já aplicado não se edita.

No `backend/.env` (e no Render, em *Environment*):

- `DATABASE_URL`: painel do Supabase > **Connect** > *Session pooler*. É **segredo**: carrega a
  senha do banco. A conexão direta não serve, porque só funciona por IPv6 e o Render não tem.
- `SUPABASE_URL`: `https://<projeto>.supabase.co`. Não é segredo.

Rota que usa o banco recebe a conexão pronta:

```python
from nucleo.db import conexao

@router.get("/api/turmas")
def listar(db: psycopg.Connection = Depends(conexao)):
    return {"turmas": consultas.turmas_do_professor(db, usuario.id)}
```

As linhas chegam como dicionário. O commit é automático no fim da rota; se ela levantar erro,
tudo o que ela escreveu é desfeito.

**Conta de professor** é criada pela equipe, com a chave secreta do Supabase (*Settings > API
Keys > Secret key*) em `SUPABASE_SECRET_KEY` no `.env` da própria máquina. Essa chave nunca vai
para o Render nem para o app:

```bash
python scripts/criar_professor.py --escola "Escola Demonstração" --nome "Prof. Demo" --email prof@exemplo.com
```

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
429   -> {"erro": "muitas perguntas seguidas, aguarde um pouco"} (Gustavo, issue #42)
503   -> {"erro": "tutor indisponivel"}        (quando o Claude e o Gemini falharem)
```

## Arquivos

O backend é organizado **por assunto**: uma pasta para cada, com os testes dentro.

| Arquivo | Dono | O que faz |
|---|---|---|
| `main.py` | Giordano | Monta o app: CORS, log, mensagens de erro, `/health`, e registra as rotas de cada pasta |
| `nucleo/rate_limit.py` | Gustavo (#42) | Limite por IP |
| `nucleo/db.py` | João (#87) | Conexão com o Postgres, uma por requisição |
| `migrations/` | João (#87) | As tabelas, em ordem |
| `scripts/criar_professor.py` | João (#87) | Cria conta de professor; roda só na máquina da equipe |
| `chat/rotas.py` | Giordano | `POST /api/chat`: chama o Claude e, se falhar, o Gemini |
| `chat/esquemas.py` | Flávio (#39) | Validação da entrada no servidor |
| `chat/prompt.py` | Thales (#46) | System prompt socrático, o mesmo para as duas IAs |
| `chat/claude.py` | João | IA principal (Claude Haiku 4.5) |
| `chat/gemini.py` | Giordano | IA de reserva, com modelos alternativos e insistência até 40s |
| `*/testes/` | — | Testes daquela pasta. `pytest` na raiz do backend roda todos (`pytest.ini`) |

Assunto novo ganha pasta nova com o mesmo formato: `rotas.py` (endereços), `esquemas.py`
(validação), `consultas.py` (SQL) e `testes/`. Dentro do backend, importe sempre pelo nome da
pasta: `from chat.prompt import SYSTEM_PROMPT`.

## Log e privacidade

O middleware registra horário, método, rota, status e duração. **Nunca** o texto da pergunta ou
da resposta. Quando a IA falha, o log grava só o **tipo** do erro — a mensagem crua de uma
exceção pode carregar trecho do payload, e payload é conversa de aluno menor de idade
(regras invioláveis 2 e 8). Se alguém pedir o conteúdo "só para depurar", a resposta é não.
