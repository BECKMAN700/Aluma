-- Projetos do aluno (decisão de 15/11): pastas com várias conversas, privadas. O professor não
-- vê: o painel conta só conversas de tópico. Contrato em docs/arquitetura.md §3.

create table projetos (
    id uuid primary key default gen_random_uuid(),
    -- Apagar o aluno (coordenador remove da escola) apaga os projetos dele.
    aluno_id uuid not null references perfis (id) on update cascade on delete cascade,
    nome text not null check (char_length(nome) between 1 and 60),
    criado_em timestamptz not null default now()
);
create index projetos_aluno_id_idx on projetos (aluno_id);

-- Uma conversa é de um tópico, de um projeto ou do chat geral; nunca de tópico e projeto juntos.
alter table conversas
    add column projeto_id uuid references projetos (id) on delete cascade,
    add column titulo text check (char_length(titulo) <= 80),
    add constraint conversas_topico_ou_projeto check (topico_id is null or projeto_id is null);
create index conversas_projeto_id_idx on conversas (projeto_id);

-- Mesma tranca das outras: RLS ligado e nenhuma política.
alter table projetos enable row level security;
