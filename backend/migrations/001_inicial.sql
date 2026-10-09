-- Sprint 3: escolas, perfis, turmas, matrículas, conversas e mensagens.
-- Contrato em docs/arquitetura.md §3. Arquivo já aplicado não se edita: mudança é 002_...sql.

create table escolas (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    criado_em timestamptz not null default now()
);

-- perfis.id é o id do login no Supabase (auth.users). Sem chave estrangeira para lá de
-- propósito: o Postgres do CI não tem o schema auth, e a migration precisa rodar nos dois.
create table perfis (
    id uuid primary key,
    nome text not null,
    papel text not null check (papel in ('aluno', 'professor', 'admin')),
    escola_id uuid references escolas (id),
    criado_em timestamptz not null default now()
);

create table turmas (
    id uuid primary key default gen_random_uuid(),
    escola_id uuid not null references escolas (id),
    professor_id uuid not null references perfis (id),
    nome text not null,
    serie text not null,
    -- 6 caracteres, sem os que confundem: 0/O e 1/I
    codigo text not null unique check (codigo ~ '^[A-HJ-NP-Z2-9]{6}$'),
    criado_em timestamptz not null default now()
);
create index turmas_professor_id_idx on turmas (professor_id);

-- aluno_id é a chave: um aluno, uma turma.
create table matriculas (
    aluno_id uuid primary key references perfis (id),
    turma_id uuid not null references turmas (id),
    criado_em timestamptz not null default now()
);
create index matriculas_turma_id_idx on matriculas (turma_id);

create table conversas (
    id uuid primary key default gen_random_uuid(),
    aluno_id uuid not null references perfis (id),
    topico_id uuid, -- vazio até a Sprint 4, que cria a tabela topicos e a chave estrangeira
    criado_em timestamptz not null default now()
);
create index conversas_aluno_id_idx on conversas (aluno_id);

create table mensagens (
    id uuid primary key default gen_random_uuid(),
    conversa_id uuid not null references conversas (id) on delete cascade,
    autor text not null check (autor in ('aluno', 'tutor')),
    texto text not null,
    criado_em timestamptz not null default now()
);
create index mensagens_conversa_id_idx on mensagens (conversa_id, criado_em);

-- Tranca: RLS ligado e nenhuma política. A chave pública do Supabase, que vai dentro do app,
-- não lê nem escreve nada. O backend conecta como dono das tabelas, e o dono não passa pelo RLS.
alter table escolas enable row level security;
alter table perfis enable row level security;
alter table turmas enable row level security;
alter table matriculas enable row level security;
alter table conversas enable row level security;
alter table mensagens enable row level security;
