# Manhã de 16/11: o que o João faz para o redesenho entrar no ar

O código está todo no PR #147 (`claude/novo-front-6323ea` → `develop`). Faça na ordem: cada passo
depende do anterior.

## 1. Merge do PR #147 na `develop`

- Use **merge commit**, não squash (squash quebrou a corrente em 12/11).
- O PR já traz o commit do menu lateral do professor (`7d9a080`, da `feat/dashboard-do-professor`).
  Essa branch não precisa de PR próprio.

## 2. Supabase: banco

No SQL Editor, rode **um arquivo por vez, nessa ordem**:

1. `backend/migrations/004_coordenador.sql`
2. `backend/migrations/005_projetos.sql`

Atenção: a 004 apaga `turmas.codigo` e `turmas.professor_id`. Antes disso, ela copia o professor de
cada turma para as matérias da turma. Não tem volta. Se quiser segurança, faça antes um backup em
Database → Backups.

## 3. Render: chave secreta

Nos **dois** serviços (`aluma-backend-develop` e o da `main`), em Environment:

- `SUPABASE_SECRET_KEY` = a chave secreta (Supabase → Project Settings → API Keys → Secret).

Sem ela, o coordenador não consegue criar professor (a rota responde erro). Salve e espere o
redeploy terminar.

## 4. Seed: dados da demonstração

Na sua máquina, com o `backend/.env` contendo `DATABASE_URL`, `SUPABASE_URL` e `SUPABASE_SECRET_KEY`:

```bash
cd backend
```

```bash
py -3.12 scripts/seed_demo.py --limpar
```

```bash
py -3.12 scripts/seed_demo.py
```

O primeiro apaga a demonstração antiga; o segundo cria as 2 escolas fictícias. A senha das contas é
pedida no terminal. Anote as contas que ele imprime: são o plano B da banca.

## 5. Netlify

- Nada a configurar: as variáveis já estão no `netlify.toml` e no painel. O app lê
  `EXPO_PUBLIC_SUPABASE_ANON_KEY`; confira se é esse o nome no painel do Netlify.
- Espere o deploy da `develop` e teste:
  1. entrar como coordenador e trocar a marca;
  2. pré-cadastrar um aluno;
  3. **abrir o link do convite colando direto na barra do navegador** (não clicando dentro do app);
  4. o aluno conversa com a IA;
  5. o professor vê a dúvida no painel.
- O item 3 importa: o site é feito de páginas estáticas, e `/convite/<código>` não tem página
  própria. O Netlify serve a página de "não encontrado" e o app troca para o convite ao carregar.
  Não consegui testar isso no Netlify de verdade. Se abrir "não encontrado", me chame: o conserto é
  uma regra de redirecionamento no `netlify.toml`.

## 6. Merge da `develop` na `main`

Só depois de o passo 5 passar. Rode a migration no banco da `main` também, se for outro projeto
do Supabase.

## O que ainda não existe

- Login com Google.
- O limite de tentativas do convite fica na memória e zera quando o Render reinicia.
