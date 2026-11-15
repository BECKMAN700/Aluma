-- Coordenador da escola: ele cria turmas, pré-cadastra alunos e liga professores às matérias.
-- Contrato em docs/arquitetura.md §3. Arquivo já aplicado não se edita: mudança é 005_...sql.

-- Papel novo.
alter table perfis drop constraint perfis_papel_check;
alter table perfis add constraint perfis_papel_check
    check (papel in ('aluno', 'professor', 'coordenador', 'admin'));

-- Pré-cadastro do aluno: o coordenador cria a linha com matrícula e nascimento, sem login.
-- Quando o aluno entra pelo convite da escola, a linha passa a ter o id do login dele
-- (entrou_em deixa de ser vazio). Perfil que nasce de um login já vem com entrou_em preenchido.
alter table perfis
    add column matricula text check (char_length(matricula) between 1 and 30),
    add column nascimento date,
    add column entrou_em timestamptz default now(),
    -- Professor criado pelo coordenador recebe senha provisória e troca no primeiro acesso.
    add column trocar_senha boolean not null default false;
update perfis set entrou_em = criado_em;
create unique index perfis_matricula_na_escola_idx on perfis (escola_id, matricula)
    where matricula is not null;

-- A troca do id (pré-cadastro -> login) leva a matrícula junto.
alter table matriculas drop constraint matriculas_aluno_id_fkey;
alter table matriculas add constraint matriculas_aluno_id_fkey
    foreign key (aluno_id) references perfis (id) on update cascade;

-- Quem dá aula é a matéria: uma turma tem vários professores, um por disciplina.
alter table materias add column professor_id uuid references perfis (id);
update materias as m set professor_id = t.professor_id from turmas as t where t.id = m.turma_id;
alter table materias alter column professor_id set not null;
create index materias_professor_id_idx on materias (professor_id);

-- A turma não tem mais dono nem código: quem matricula é o coordenador.
alter table turmas drop column professor_id;
alter table turmas drop column codigo;
create index turmas_escola_id_idx on turmas (escola_id);

-- Marca da escola (o coordenador edita) e o link de convite (um por escola; o uuid não dá para
-- adivinhar). Sem marca, vale a do Aluma: dourado sobre o azul-noite.
alter table escolas
    add column nome_do_sistema text not null default 'Aluma' check (char_length(nome_do_sistema) between 1 and 30),
    add column nome_da_ia text not null default 'Luma' check (char_length(nome_da_ia) between 1 and 30),
    add column cor text not null default '#ffc766' check (cor ~ '^#[0-9a-f]{6}$'),
    add column cor_secundaria text not null default '#071120' check (cor_secundaria ~ '^#[0-9a-f]{6}$'),
    add column logo bytea check (octet_length(logo) <= 204800),
    add column logo_tipo text check (logo_tipo in ('image/png', 'image/jpeg')),
    add column logo_formato text not null default 'redondo' check (logo_formato in ('redondo', 'quadrado', 'livre')),
    add column convite uuid not null unique default gen_random_uuid();
