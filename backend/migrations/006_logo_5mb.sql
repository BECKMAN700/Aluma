-- Logo da escola até 5 MB (decisão de 15/11), o mesmo limite de backend/coordenacao/rotas.py.
-- A 004 criou a regra com 200 KB; o Postgres deu a ela o nome escolas_logo_check.

alter table escolas drop constraint if exists escolas_logo_check;
alter table escolas add constraint escolas_logo_check
    check (octet_length(logo) <= 5242880);
