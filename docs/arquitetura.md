# Aluma — Arquitetura

> O mapa do projeto: onde fica cada coisa, que dados existem, que rotas existem e quem pode
> chamar cada uma. É o **contrato** entre as pessoas da equipe: programe contra o que está
> escrito aqui, sem esperar o PR do colega. Mudou tabela ou rota? Mude este arquivo no mesmo PR.
>
> O porquê de cada escolha está em [`decisoes.md`](decisoes.md).

## 1. As peças

```
App Expo ── e-mail e senha ──> Supabase Auth ──> devolve um token
App Expo ── token em toda chamada ──> FastAPI (Render) ──> Postgres (Supabase)
                                            └──> Claude (Gemini de reserva)
```

| Peça | Ferramenta | Onde roda |
|---|---|---|
| App (web e celular) | React Native + Expo, TypeScript, expo-router | Netlify (web) e Expo Go |
| Login | Supabase Auth, e-mail e senha | Supabase |
| Backend | Python + FastAPI | Render |
| Banco | Postgres | Supabase |
| IA | Claude Haiku 4.5; Gemini de reserva | API externa, chamada só pelo backend |

Três regras definem o desenho:

1. **O app fala com o Supabase só para login.** Todo dado passa pelo FastAPI.
2. **O app não decide nada.** Quem é a pessoa, qual o papel dela e o que ela pode ver é
   decidido no servidor, a cada chamada.
3. **Segredo só no servidor.** Chave da IA e endereço do banco vivem nas variáveis do Render.

## 2. Pastas

```
backend/
  main.py            só monta o app e registra as rotas
  nucleo/            o que todo mundo usa
    config.py          variáveis de ambiente
    db.py              conexão com o Postgres
    auth.py            confere o token e monta o Usuario
    permissoes.py      quem pode o quê (único lugar)
    rate_limit.py      limite de requisições
  chat/              rotas.py, esquemas.py, consultas.py, prompt.py, claude.py, gemini.py, testes/
  turmas/            rotas.py, esquemas.py, consultas.py, testes/
  materiais/         (Sprint 4) mesmo formato
  migrations/        001_inicial.sql, 002_...sql — o banco, em ordem
app/
  _layout.tsx        lê a sessão e manda cada papel para o seu grupo
  (auth)/            entrar, criar conta
  (aluno)/           código da turma, início, chat, trilha
  (professor)/       turmas, turma, materiais, painel
components/          peças de tela reaproveitadas
services/            api.ts (endereço + token), auth.ts, turmas.ts, chat.ts
types/api.ts         os formatos que a API devolve
docs/                este mapa, decisões, sprints
```

**Toda pasta de assunto do backend tem o mesmo formato:**

| Arquivo | O que tem | O que não tem |
|---|---|---|
| `rotas.py` | Os endereços e a permissão exigida em cada um | SQL, regra de negócio longa |
| `esquemas.py` | O formato e a validação do que entra e do que sai | Acesso ao banco |
| `consultas.py` | Todo o SQL daquele assunto, uma função por consulta | Regra de permissão |
| `testes/` | Os testes daquele assunto | — |

Regras de organização:

- **SQL só em `consultas.py`. Permissão só em `nucleo/permissoes.py`.** Quem procura um bug de
  acesso abre um arquivo, não dez.
- **Arquivo com mais de ~250 linhas é dividido.**
- **Uma tela chama `services/`, nunca `fetch` direto.**
- **Nada de código sem uso no repositório.** Código morto custa leitura de gente e de IA.

## 3. Dados

Tabelas em português, minúsculas, plural. Toda tabela tem `id uuid` (gerado pelo banco) e
`criado_em timestamptz`, salvo indicação.

### Sprint 3

| Tabela | Colunas | Observação |
|---|---|---|
| `escolas` | `nome` | Criada pela equipe |
| `perfis` | `id` (o mesmo id do login no Supabase), `nome`, `papel` (`aluno`, `professor` ou `admin`), `escola_id` (vazio para aluno sem turma) | Uma linha por conta |
| `turmas` | `escola_id`, `professor_id`, `nome`, `serie`, `codigo` (único) | O código tem 6 caracteres, sem os que confundem (`0`/`O`, `1`/`I`) |
| `matriculas` | `aluno_id` (chave: um aluno, uma turma), `turma_id` | Sem coluna `id` |
| `conversas` | `aluno_id`, `topico_id` (vazio até a Sprint 4) | |
| `mensagens` | `conversa_id`, `autor` (`aluno` ou `tutor`), `texto` | |

### Sprint 4

| Tabela | Colunas |
|---|---|
| `materias` | `turma_id`, `nome` |
| `topicos` | `materia_id`, `nome`, `ordem` |
| `materiais` | `topico_id`, `nome_arquivo`, `texto` (extraído do PDF) |
| `progresso` | `aluno_id`, `topico_id`, `status` (`nao_iniciado`, `em_andamento`, `dominado`) |

### Refinamento

| Tabela | Colunas |
|---|---|
| `dificuldades` | `aluno_id`, `topico_id`, `resumo` |

**Tranca no banco:** todas as tabelas com RLS ligado e **nenhuma** política. A chave pública do
Supabase, que vai dentro do app, não consegue ler nem escrever nada direto no banco. O backend
conecta como dono do banco e é o único que lê.

**Mudança de banco é sempre um arquivo novo** em `backend/migrations/`, numerado. Nunca se edita
um arquivo que já foi aplicado.

## 4. Login e papéis

1. O app chama o Supabase (`criarConta` ou `entrar`) e recebe um **token**: um texto assinado
   pelo Supabase que diz quem é a pessoa e vale por um tempo curto. O app guarda a sessão no
   aparelho e o Supabase renova o token sozinho.
2. Em toda chamada ao backend o app manda `Authorization: Bearer <token>`.
3. O backend confere a assinatura do token com a **chave pública** do Supabase. Só aceita os
   algoritmos ES256 e RS256, e confere o emissor e o público do token. Token inválido ou
   vencido: `401`.
4. Com o id que está no token, o backend busca o `perfil`. Se não existe, cria como **aluno**.

**O papel nunca vem do app.** Quem cria conta pelo app é sempre aluno.

**Conta de professor é criada pela equipe**, por um script de administração que roda só na
máquina de quem tem a chave secreta: cria o login no Supabase e a linha em `perfis` com o papel
`professor` e a escola. O professor recebe o e-mail e a senha e troca a senha no primeiro
acesso. Não existe tabela de convite por e-mail: sem e-mail de confirmação, qualquer pessoa
poderia criar conta com o e-mail de um professor convidado e virar professor.

O formato que as rotas recebem, e contra o qual todo mundo programa:

```python
@dataclass
class Usuario:
    id: str            # uuid do login
    papel: str         # "aluno" | "professor" | "admin"
    escola_id: str | None
```

## 5. Rotas

Toda resposta de erro tem o formato `{"erro": "frase em português"}`. Sem token ou com token
inválido: `401`. Com token, mas sem permissão: `403`. Em dúvida, o servidor nega.

### Sprint 3

| Rota | Quem pode | Entra | Sai |
|---|---|---|---|
| `GET /health` | Qualquer um | — | `{"status": "ok"}` |
| `GET /api/me` | Logado | — | `{"id", "nome", "papel", "escola": {"id","nome"} ou null, "turma": {"id","nome"} ou null}` |
| `POST /api/turmas` | Professor | `{"nome", "serie"}` | `201` `{"id", "nome", "serie", "codigo"}` |
| `GET /api/turmas` | Professor | — | `{"turmas": [...]}`, só as dele |
| `GET /api/turmas/{id}/alunos` | Professor **dono** da turma | — | `{"alunos": [{"id", "nome"}]}` |
| `POST /api/matriculas` | Aluno | `{"codigo"}` | `201` `{"turma": {"id","nome"}}` · `404` código não existe · `409` já tem turma |
| `POST /api/chat` | Aluno matriculado ou professor | `{"mensagem", "historico"}` | `{"resposta"}`; grava as duas mensagens |
| `GET /api/conversas/atual` | Aluno | — | `{"mensagens": [{"autor", "texto"}]}` |

Na Sprint 3 o `POST /api/chat` mantém o corpo da Release 2 (`historico` vem do app) e passa a
gravar a conversa. Assim a tela de chat não muda nesta sprint.

### Sprint 4 (a detalhar no planejamento de 19/10)

| Rota | Quem pode |
|---|---|
| `POST /api/turmas/{id}/materias`, `GET /api/turmas/{id}/materias` | Professor dono; o `GET` também para aluno da turma |
| `POST /api/materias/{id}/topicos` | Professor dono |
| `POST /api/topicos/{id}/materiais` (envio de PDF) | Professor dono |
| `PUT /api/topicos/{id}/progresso` | Aluno da turma |
| `POST /api/chat` com `topico_id` | Aluno da turma daquele tópico |

## 6. Permissões

Tudo em `backend/nucleo/permissoes.py`. As rotas só declaram o que exigem:

| Função | Garante |
|---|---|
| `usuario_atual` (em `auth.py`) | Token válido; devolve o `Usuario` |
| `exige_professor` | `papel == "professor"` |
| `exige_aluno` | `papel == "aluno"` |
| `exige_dono_da_turma(turma_id)` | A turma existe **e** o professor dela é o usuário. Turma de outro professor responde `404`, não `403`: quem não é dono não fica sabendo que ela existe |
| `exige_aluno_da_turma(turma_id)` | O aluno está matriculado naquela turma |

**Nos testes** não existe Supabase: o `usuario_atual` é trocado por um usuário de mentira, com
`app.dependency_overrides`. É assim que se testa "aluno tentando rota de professor" sem criar
conta de verdade.

Testes obrigatórios de isolamento (`nucleo/testes/`): aluno em rota de professor; professor
vendo alunos de turma de outro professor; professor de outra escola; aluno sem turma no chat.

## 7. Variáveis de ambiente

| Onde | Variável | É segredo? |
|---|---|---|
| Render | `DATABASE_URL` (endereço do banco, com senha) | **Sim** |
| Render | `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` | **Sim** |
| Render | `SUPABASE_URL`, `CORS_ORIGINS` | Não |
| App (`.env`, Netlify) | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Não |

Tudo que começa com `EXPO_PUBLIC_` vai dentro do app e qualquer pessoa consegue ler. Por isso
a chave secreta do Supabase **nunca** recebe esse prefixo nem entra no app: ela só é usada pelo
script de administração, na máquina de quem cria as contas de professor.

## 8. Limites conhecidos do que é gratuito

| Serviço | Limite | O que fazemos |
|---|---|---|
| Render | Dorme após 15 min sem uso; cerca de 1 min para acordar; 750 horas por mês | O app avisa que o tutor está acordando; ping agendado das 7h às 23h (Sprint 4) |
| Supabase | Banco de 500 MB; pausa após 7 dias sem uso | O mesmo ping toca o banco |
| Supabase, e-mail | 2 a 3 e-mails por hora, só para e-mails da equipe | Confirmação de e-mail desligada; sem "esqueci a senha" |
| Netlify | 300 créditos por mês; cada publicação da `main` gasta 15 | Publicar a `main` só em release |
| Claude | Teto de US$ 3 por mês | Limite de tamanho do material no prompt; o Gemini assume quando o crédito acaba |

**A confirmar no painel do Supabase** ao criar o projeto: os limites atuais do plano gratuito,
o endereço das chaves públicas do token e o endereço de conexão do banco que funciona a partir
do Render (o "pooler").
