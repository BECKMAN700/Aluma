-- Sprint 4: matérias, tópicos e o material (texto do PDF) de cada tópico.
-- Contrato em docs/arquitetura.md §3. Arquivo já aplicado não se edita: mudança é 003_...sql.

create table materias (
    id uuid primary key default gen_random_uuid(),
    turma_id uuid not null references turmas (id),
    nome text not null,
    criado_em timestamptz not null default now()
);
create index materias_turma_id_idx on materias (turma_id);

-- ordem começa em 1 e quem define é o servidor (o próximo número da matéria).
create table topicos (
    id uuid primary key default gen_random_uuid(),
    materia_id uuid not null references materias (id),
    nome text not null,
    ordem integer not null check (ordem > 0),
    criado_em timestamptz not null default now()
);
create index topicos_materia_id_idx on topicos (materia_id, ordem);

-- Um material por tópico: enviar outro PDF substitui o anterior.
create table materiais (
    id uuid primary key default gen_random_uuid(),
    topico_id uuid not null unique references topicos (id),
    nome_arquivo text not null,
    texto text not null,
    criado_em timestamptz not null default now()
);

-- A coluna existe desde a 001, vazia; agora ganha a chave estrangeira.
alter table conversas
    add constraint conversas_topico_id_fkey foreign key (topico_id) references topicos (id);

-- Mesma tranca da 001: RLS ligado e nenhuma política.
alter table materias enable row level security;
alter table topicos enable row level security;
alter table materiais enable row level security;
