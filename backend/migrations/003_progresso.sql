-- Refinamento: tópico dominado e o resumo das dúvidas da turma por tópico.
-- Contrato em docs/arquitetura.md §3. Arquivo já aplicado não se edita: mudança é 004_...sql.

-- Só o "dominado" é gravado: "em andamento" continua saindo da conversa salva.
create table progresso (
    aluno_id uuid not null references perfis (id),
    topico_id uuid not null references topicos (id),
    status text not null check (status in ('dominado')),
    criado_em timestamptz not null default now(),
    primary key (aluno_id, topico_id)
);
create index progresso_topico_id_idx on progresso (topico_id);

-- Um resumo por tópico, gerado quando o professor pede; pedir de novo substitui.
create table resumos_de_duvidas (
    topico_id uuid primary key references topicos (id),
    texto text not null,
    criado_em timestamptz not null default now()
);

-- Mesma tranca das outras: RLS ligado e nenhuma política.
alter table progresso enable row level security;
alter table resumos_de_duvidas enable row level security;
