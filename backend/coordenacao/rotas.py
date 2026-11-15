"""
Painel do coordenador: turmas, alunos (pré-cadastro), professores e as matérias que ligam os dois.
Turma, aluno ou professor de outra escola responde 404, como se não existisse.
"""

from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends, HTTPException, status

from materiais.consultas import criar_materia
from nucleo import supabase_admin
from nucleo.auth import Usuario
from nucleo.db import conexao
from nucleo.permissoes import exige_coordenador
from turmas.consultas import criar_turma
from turmas.esquemas import CriarTurma

from . import consultas
from .esquemas import CriarMateriaComProfessor, CriarProfessor, PreCadastrarAluno, Transferir

router = APIRouter(prefix="/api/coordenacao", tags=["Coordenação"])


def _turma_da_escola(db: psycopg.Connection, turma_id: UUID, usuario: Usuario) -> None:
    if not consultas.turma_da_escola(db, turma_id, usuario.escola_id):
        raise HTTPException(status_code=404, detail="turma não encontrada")


@router.get("/turmas")
def listar_turmas(
    usuario: Usuario = Depends(exige_coordenador),
    db: psycopg.Connection = Depends(conexao),
):
    return {"turmas": consultas.turmas_da_escola(db, usuario.escola_id)}


@router.post("/turmas", status_code=status.HTTP_201_CREATED)
def nova_turma(
    dados: CriarTurma,
    usuario: Usuario = Depends(exige_coordenador),
    db: psycopg.Connection = Depends(conexao),
):
    turma = criar_turma(db, usuario.escola_id, dados.nome, dados.serie)
    return {**turma, "alunos": 0, "materias": []}


@router.get("/turmas/{id}/alunos")
def listar_alunos(
    id: UUID,
    usuario: Usuario = Depends(exige_coordenador),
    db: psycopg.Connection = Depends(conexao),
):
    _turma_da_escola(db, id, usuario)
    return {"alunos": consultas.alunos_da_turma(db, id, usuario.escola_id)}


@router.post("/turmas/{id}/alunos", status_code=status.HTTP_201_CREATED)
def pre_cadastrar_aluno(
    id: UUID,
    dados: PreCadastrarAluno,
    usuario: Usuario = Depends(exige_coordenador),
    db: psycopg.Connection = Depends(conexao),
):
    _turma_da_escola(db, id, usuario)
    try:
        return consultas.pre_cadastrar_aluno(
            db, usuario.escola_id, id, dados.nome, dados.matricula, dados.nascimento
        )
    except consultas.MatriculaRepetida:
        raise HTTPException(status_code=409, detail="já existe um aluno com essa matrícula") from None


@router.post("/alunos/{id}/transferir")
def transferir_aluno(
    id: UUID,
    dados: Transferir,
    usuario: Usuario = Depends(exige_coordenador),
    db: psycopg.Connection = Depends(conexao),
):
    if not consultas.transferir_aluno(db, id, dados.turma_id, usuario.escola_id):
        raise HTTPException(status_code=404, detail="aluno ou turma não encontrados")
    return {"id": id, "turma_id": dados.turma_id}


@router.delete("/alunos/{id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_aluno(
    id: UUID,
    usuario: Usuario = Depends(exige_coordenador),
    db: psycopg.Connection = Depends(conexao),
):
    if not consultas.remover_aluno(db, id, usuario.escola_id):
        raise HTTPException(status_code=404, detail="aluno não encontrado")


@router.get("/professores")
def listar_professores(
    usuario: Usuario = Depends(exige_coordenador),
    db: psycopg.Connection = Depends(conexao),
):
    return {"professores": consultas.professores_da_escola(db, usuario.escola_id)}


@router.post("/professores", status_code=status.HTTP_201_CREATED)
def criar_professor(
    dados: CriarProfessor,
    usuario: Usuario = Depends(exige_coordenador),
    db: psycopg.Connection = Depends(conexao),
):
    """A senha provisória sai só nesta resposta: o coordenador repassa e o professor troca."""
    senha = supabase_admin.gerar_senha_provisoria()
    try:
        login_id = supabase_admin.criar_login(dados.email, senha)
    except supabase_admin.EmailJaCadastrado:
        raise HTTPException(status_code=409, detail="esse e-mail já tem conta") from None
    except supabase_admin.AdminIndisponivel:
        raise HTTPException(status_code=503, detail="não foi possível criar a conta agora") from None
    # shortcut: se o banco falhar aqui, o login fica órfão no Supabase; apagar no painel dele.
    professor = consultas.criar_perfil_professor(db, login_id, dados.nome, usuario.escola_id)
    return {**professor, "email": dados.email, "senha_provisoria": senha}


@router.post("/turmas/{id}/materias", status_code=status.HTTP_201_CREATED)
def ligar_professor(
    id: UUID,
    dados: CriarMateriaComProfessor,
    usuario: Usuario = Depends(exige_coordenador),
    db: psycopg.Connection = Depends(conexao),
):
    """Põe o professor na turma com a disciplina dele: é a matéria que ele vai preencher."""
    _turma_da_escola(db, id, usuario)
    if not consultas.professor_da_escola(db, dados.professor_id, usuario.escola_id):
        raise HTTPException(status_code=404, detail="professor não encontrado")
    materia = criar_materia(db, id, dados.nome, str(dados.professor_id))
    return {"id": materia["id"], "nome": materia["nome"]}
