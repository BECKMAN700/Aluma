# Guia da Sprint 2 — Giordano

_sub_ Backend do Aluma · seu prazo: **terça, 22/09** · entrega da sprint: **segunda, 28/09**

## Por que você é o primeiro

Três pessoas dependem do seu código para começar: Flávio (validação), Gustavo (limite de
requisições) e Thales (prompt do tutor). Enquanto o esqueleto do backend não estiver na
`develop`, os três ficam parados. Por isso seu prazo é terça, e não domingo.

Você **não** precisa entregar o backend inteiro até terça. Precisa entregar o esqueleto: o
servidor sobe, responde nas duas rotas, e os outros conseguem encaixar o trabalho deles.

## O que você entrega

| Issue | Entrega | Até |
|---|---|---|
| #1 | Esqueleto do FastAPI: `GET /health` e `POST /api/chat` respondendo texto fixo | ter 22/09 |
| #2 | `POST /api/chat` conversando com o Gemini de verdade, chave em variável de ambiente | qui 24/09 |
| #3 | Log de requisição sem gravar o texto das conversas | qui 24/09 |

## O contrato da API

Isto aqui é combinado com o time. O Antonio vai escrever o código do app contra este formato,
então **não mude sozinho**: se precisar mudar, avise no grupo antes.

```
GET /health
200 -> {"status": "ok"}

POST /api/chat
envia -> {"mensagem": "como resolvo 3x + 5 = 20?",
          "historico": [{"autor": "aluno", "texto": "..."},
                        {"autor": "tutor", "texto": "..."}]}
200   -> {"resposta": "O que você pode fazer dos dois lados para isolar o 3x?"}
422   -> {"erro": "mensagem vazia"}          (Flávio implementa)
429   -> {"erro": "muitas perguntas seguidas"} (Gustavo implementa)
503   -> {"erro": "tutor indisponivel"}      (quando o Gemini falhar)
```

O `historico` chega do app a cada pergunta porque o servidor **não guarda conversa**. Isso é
decisão de projeto, não esquecimento: usuário menor de idade, e o que não é guardado não vaza.

## Passo a passo

### 1. Branch

```
git checkout develop
git pull
git checkout -b feat/backend-esqueleto
```

Nunca trabalhe direto na `develop` nem na `main`. É a regra 1 do projeto.

### 2. Estrutura

Crie a pasta `backend/` na raiz do repositório, com esses arquivos:

```
backend/
  main.py           ponto de entrada, define as rotas
  gemini.py         a conversa com a IA fica isolada aqui
  requirements.txt  as bibliotecas
  .env.example      modelo do arquivo de chave, SEM a chave real
```

Cada colega vai criar o arquivo dele nessa pasta (`validation.py`, `rate_limit.py`,
`prompt.py`). Arquivo separado por pessoa é de propósito: assim ninguém edita a mesma linha e
o Git não gera conflito.

### 3. Ambiente e bibliotecas

```
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install fastapi uvicorn google-genai python-dotenv pytest
pip freeze > requirements.txt
```

Atenção: a biblioteca é **`google-genai`**, a nova. A antiga chama-se `google-generativeai` e
foi descontinuada pelo Google. Se sua IA sugerir a antiga, corrija.

### 4. A chave da API

Pegue a chave em `aistudio.google.com`. Ela é gratuita e não pede cartão.

Crie `backend/.env` com o conteúdo `GEMINI_API_KEY=sua_chave_aqui` e **confirme que o `.env`
está no `.gitignore` antes do primeiro commit**. Chave commitada é encontrada por robôs em
minutos, e a conta vira brinquedo de terceiro. É a regra 2 do projeto, e a única que, se
quebrada, não tem conserto: apagar depois não resolve, porque fica no histórico do Git.

No `.env.example`, que **vai** para o Git, escreva só `GEMINI_API_KEY=`.

### 5. As rotas

`GET /health` responde `{"status": "ok"}` e não chama a IA. Ela existe para o app descobrir se
o servidor está acordado sem gastar cota do Gemini.

`POST /api/chat` recebe o corpo do contrato acima. Na Issue #1 pode devolver texto fixo. Na
Issue #2 passa a chamar o Gemini de verdade, com o modelo `gemini-2.5-flash`.

Use `pydantic` (já vem com o FastAPI) para declarar o formato do corpo. Isso te dá validação de
tipo de graça, e é onde o Flávio vai encaixar as regras dele depois.

### 6. Log sem conteúdo (Issue #3)

Registre por requisição: horário, rota, status da resposta e quanto tempo levou. **Nunca** o
texto da pergunta ou da resposta. Se alguém pedir "só para depurar", a resposta é não.

### 7. Teste antes de abrir o PR

```
uvicorn main:app --reload
```

Em outro terminal:

```
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/chat -H "Content-Type: application/json" -d "{\"mensagem\":\"como resolvo 3x + 5 = 20?\",\"historico\":[]}"
```

O segundo comando tem que devolver uma resposta em JSON. Se devolver erro, resolva antes de
abrir o PR — PR que não roda toma review negativo e atrasa todo mundo.

### 8. Abrir o PR

```
git add backend/
git commit -m "adiciona esqueleto do backend com as rotas de saude e chat"
git push -u origin feat/backend-esqueleto
```

No GitHub, abra o PR **com base na `develop`**, escreva o que fez, como testou, e inclua
`closes #1` na descrição para a issue fechar sozinha no merge. Peça review ao **Flávio**.

## O seu review obrigatório

Você é o revisor do PR do **Thales** (prompt do tutor + deploy). Não é favor: a ficha de
avaliação exige um review técnico por pessoa, e ele vale 10 pontos da sua nota individual.

"LGTM" e "ok" valem **zero**. Um review que conta precisa ter pelo menos 3 linhas técnicas,
apontar um problema concreto e sugerir a correção. O que olhar no PR do Thales:

- O prompt proíbe o tutor de dar a resposta pronta, de forma explícita?
- E se o aluno insistir três vezes, ou disser que é para a prova?
- A chave aparece em algum lugar do código ou do log?

## Prompt base para usar com a sua IA

Copie e cole isto, e depois vá conversando. Não peça o código inteiro de uma vez: peça um
arquivo por vez e entenda cada trecho — na apresentação, o professor pergunta e quem responde
é você.

```
Contexto: sou estudante de Sistemas de Informação e estou construindo o backend de um
tutor educacional chamado Aluma. Ele usa IA para guiar alunos do 9º ano em Matemática
sem nunca entregar a resposta pronta.

Stack obrigatória: Python 3, FastAPI, biblioteca google-genai (NAO a google-generativeai,
que foi descontinuada), modelo gemini-2.5-flash, hospedagem futura no Render.

Minha tarefa nesta sprint: criar o esqueleto do backend com duas rotas.

  GET /health -> {"status": "ok"}, sem chamar a IA
  POST /api/chat
      recebe {"mensagem": "...", "historico": [{"autor": "aluno"|"tutor", "texto": "..."}]}
      responde {"resposta": "..."}

Regras que nao posso quebrar:
1. A chave da API fica em variavel de ambiente lida de um .env, nunca no codigo.
2. O log registra horario, rota, status e duracao, mas NUNCA o texto das mensagens,
   porque os usuarios sao menores de idade.
3. Outras pessoas do time vao adicionar validacao e limite de requisicoes em arquivos
   separados, entao deixe o codigo preparado para isso, sem implementar.

Me ajude assim: primeiro explique a estrutura de arquivos e por que cada um existe.
Depois me entregue um arquivo por vez, explicando as partes que um iniciante em FastAPI
nao entenderia. Ao final de cada arquivo, me faca uma pergunta para conferir se entendi.
```

## Se travar

Avise no grupo em vez de passar duas horas preso. Três pessoas dependem de você nesta semana, e
pedir ajuda cedo custa menos que atrasar a sprint inteira.

Documentação útil: `fastapi.tiangolo.com` e `ai.google.dev/gemini-api/docs`.
