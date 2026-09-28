# Guia da Sprint 2 — Flávio

_sub_ Validação do servidor, testes automáticos e pesquisa com alunos · entrega da sprint: **segunda, 28/09**

## Leia isto primeiro

Você está em Projeto de Sistemas e não cursa Web/Mobile, então provavelmente não mexeu com o
código do app até agora. Por isso sua parte é no **backend, em Python** — que não depende de
nada do que foi visto na outra disciplina. Você começa do mesmo ponto que os colegas.

E tem uma coisa importante sobre nota: a ficha do professor Edeilson exige **1 PR relevante e
1 code review por pessoa, por sprint**. Quem não tem PR fica limitado a 14 pontos de 50, mesmo
tendo trabalhado. As suas duas primeiras entregas existem justamente para você ter PR próprio,
com código que você escreveu e consegue explicar na apresentação.

## O que você entrega

| Issue | Entrega | Até |
|---|---|---|
| A | Validação da entrada no servidor (`backend/validation.py`) | qua 23/09 |
| B | Testes automáticos da validação (`pytest`) | sex 25/09 |
| C | Formulário respondido por 30+ alunos | qui 24/09 |

A issue C não tem código, mas é a de maior peso para a competição Supernova. Volto nela no fim.

## Segunda (21/09): preparar o ambiente

O código que você vai estender só chega na terça, quando o Giordano entregar o esqueleto do
backend. Use a segunda para deixar a máquina pronta:

1. Instale o **Python 3.12** em `python.org`. Na instalação, marque *"Add Python to PATH"*.
2. Confirme no terminal: `python --version`.
3. Clone o repositório, se ainda não tem:
   `git clone https://github.com/BECKMAN700/Aluma.git`
4. Assista a qualquer vídeo de 20 minutos de "FastAPI para iniciantes". Você não precisa
   dominar: precisa reconhecer as palavras quando as vir.

## O que é validação, e por que no servidor

O app manda para o servidor um JSON assim:

```
{"mensagem": "como resolvo 3x + 5 = 20?",
 "historico": [{"autor": "aluno", "texto": "..."}]}
```

Validar é conferir se esse conteúdo faz sentido **antes** de ele chegar na IA. Mensagem vazia,
mensagem de 200 mil caracteres, histórico com 500 itens, campo faltando: tudo isso é recusado
com um erro claro, sem gastar nem uma chamada do Gemini.

E por que no servidor, se o app já poderia conferir antes de enviar? Porque **qualquer pessoa
consegue falar com o servidor sem passar pelo app**. Com um comando de terminal de uma linha,
eu mando o que eu quiser para o nosso endereço público. Se a checagem só existir no app, ela
não existe. É a regra 3 do projeto: toda entrada é hostil até prova em contrário.

Além de segurança, é dinheiro: a camada gratuita do Gemini dá cerca de 1.500 chamadas por dia.
Cada pedido inválido que você barra é uma chamada que não foi desperdiçada.

## Issue A — a validação

Trabalhe **só** no arquivo `backend/validation.py`. Cada pessoa do backend tem o seu arquivo de
propósito: assim ninguém edita a mesma linha e o Git não gera conflito.

Regras a implementar:

| Campo | Regra | Erro |
|---|---|---|
| `mensagem` | obrigatória, não pode ser vazia nem só espaços | `422` "escreva sua dúvida" |
| `mensagem` | no máximo 2.000 caracteres | `422` "mensagem muito longa" |
| `historico` | no máximo 10 itens; se vier mais, corte os mais antigos | — |
| `historico[].autor` | só aceita `"aluno"` ou `"tutor"` | `422` "histórico inválido" |
| `historico[].texto` | não vazio, no máximo 2.000 caracteres | `422` "histórico inválido" |
| campos extras | rejeitar o que não está no contrato | `422` "requisição inválida" |

O FastAPI já traz o **pydantic**, que faz metade disso sozinho: você declara o formato esperado
e ele recusa o que não bate. Use `Field(min_length=..., max_length=...)` e
`model_config = ConfigDict(extra="forbid")` para os campos extras.

Todas as mensagens de erro em português, porque quem lê é um aluno do 9º ano.

### Como testar na mão

Com o servidor rodando (`uvicorn main:app --reload` dentro de `backend/`):

```
curl -X POST http://localhost:8000/api/chat -H "Content-Type: application/json" -d "{\"mensagem\":\"\",\"historico\":[]}"
```

Tem que devolver erro 422, e **não** pode chamar a IA.

## Issue B — os testes automáticos

Teste automático é um programinha que usa o seu código e confere se a resposta foi a esperada.
Serve para descobrir que alguém quebrou a validação **antes** do professor descobrir na
apresentação.

Crie `backend/test_validation.py`. Cada teste segue três passos: monta a entrada, chama, confere.

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_mensagem_vazia_e_recusada():
    resposta = client.post("/api/chat", json={"mensagem": "", "historico": []})
    assert resposta.status_code == 422
```

Escreva pelo menos cinco: mensagem vazia, mensagem só com espaços, mensagem longa demais,
autor inválido no histórico, e um caso válido que passa. Rode com `pytest` dentro de `backend/`.

O caso válido importa tanto quanto os inválidos: validação que recusa tudo "passa" nos testes
de erro e quebra o produto.

## Como abrir o PR

```
git checkout develop
git pull
git checkout -b feat/validacao-entrada
```

Trabalhe, e então:

```
git add backend/validation.py
git commit -m "adiciona validacao da entrada no servidor"
git push -u origin feat/validacao-entrada
```

No GitHub, abra o PR **com base na `develop`**, escreva o que fez e como testou, e inclua
`closes #NN` para a issue fechar sozinha. Peça review ao **Gustavo**.

Nunca trabalhe direto na `develop` nem na `main`: é a regra 1 do projeto.

## O seu review obrigatório

Você revisa o PR do **Giordano** (esqueleto do backend). Vale 10 pontos da sua nota individual,
e "ok" ou "LGTM" valem zero. Precisa de pelo menos 3 linhas técnicas, apontando um problema
concreto com sugestão de correção.

O que olhar, mesmo sem ser especialista:

- O arquivo `.env`, que guarda a chave da IA, está no `.gitignore`? Se a chave aparecer no
  repositório, é falha grave e não tem conserto: fica no histórico do Git para sempre.
- Existe algum `print` ou log gravando o texto das conversas? Não pode: usuários são menores.
- A rota `/health` responde sem chamar a IA? Se ela gastar cota, o app derruba nossa cota
  sozinho só perguntando se o servidor está vivo.

## Issue C — o formulário com alunos

Esta é, hoje, a tarefa de maior peso do projeto inteiro para a competição. A banca da Supernova
avalia se conversamos com usuários reais, e até agora esse número é **zero**.

Sua meta: **30 respostas** de alunos do fundamental ou do médio. Rode em grupo de WhatsApp de
escola, com primo, com vizinho. Um formulário do Google resolve, e cabe num fim de semana.

Umas perguntas que valem mais que "você gosta de estudar?":

- Quando você não entende um assunto, o que você faz primeiro?
- Você já usou ChatGPT ou parecido para tarefa da escola? Para quê exatamente?
- O que te trava mais: não saber **o que** estudar, ou não conseguir entender o conteúdo?
- Se um app te desse dicas em vez da resposta pronta, você usaria? Por quê?

Registre o resultado em `docs/validacao-de-campo.md`. A diferença que isso faz é entre dizer
"achamos que" e dizer "perguntamos para 34 pessoas e 71% responderam X". O Gustavo cuida das
conversas com professores e coordenação.

## Prompt base para usar com a sua IA

```
Contexto: sou estudante de Sistemas de Informacao, estou comecando em Python e trabalho
no backend de um tutor educacional chamado Aluma. O backend usa FastAPI e ja tem uma rota
POST /api/chat que recebe:

  {"mensagem": "...", "historico": [{"autor": "aluno"|"tutor", "texto": "..."}]}

Minha tarefa: escrever a validacao dessa entrada, no arquivo backend/validation.py.

Regras:
  - mensagem obrigatoria, nao vazia nem so espacos, no maximo 2000 caracteres
  - historico com no maximo 10 itens; se vier mais, cortar os mais antigos
  - autor so pode ser "aluno" ou "tutor"
  - texto do historico nao vazio, no maximo 2000 caracteres
  - campos extras devem ser rejeitados
  - erro sempre 422, com mensagem em portugues, porque quem le e um aluno de 9º ano
  - a validacao roda no SERVIDOR, porque qualquer pessoa pode chamar a API sem passar
    pelo app

Depois preciso escrever testes com pytest e TestClient do FastAPI, cobrindo mensagem
vazia, mensagem longa demais, autor invalido e um caso valido.

Me ensine enquanto escreve: sou iniciante em Python e em FastAPI, entao explique o que
e pydantic, o que cada decorador faz e por que o codigo esta organizado assim. Va por
partes e me pergunte se entendi antes de seguir.
```

## Se travar

Fale no grupo no mesmo dia. Ninguém aqui nasceu sabendo FastAPI, e a sprint tem 9 dias: duas
horas travado em silêncio custam mais que cinco minutos perguntando.
