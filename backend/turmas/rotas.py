
from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends, HTTPException, status

from nucleo.auth import Usuario
from nucleo.db import conexao
from nucleo.permissoes import exige_dono_da_turma, exige_professor

from .consultas import (
    alunos_da_turma,
    criar_turma,
    turmas_do_professor,
)
from .esquemas import CriarTurma


router = APIRouter(
    prefix="/api/turmas",
    tags=["Turmas"],
)


@router.post("", status_code=status.HTTP_201_CREATED)
def criar(
    dados: CriarTurma,
    usuario: Usuario = Depends(exige_professor),
    db: psycopg.Connection = Depends(conexao),
):
    if not usuario.escola_id:
        raise HTTPException(
            status_code=403,
            detail="professor precisa estar vinculado a uma escola",
        )

    turma = criar_turma(
        db=db,
        escola_id=UUID(usuario.escola_id),
        professor_id=UUID(usuario.id),
        nome=dados.nome,
        serie=dados.serie,
    )

    return turma


@router.get("")
def listar(
    usuario: Usuario = Depends(exige_professor),
    db: psycopg.Connection = Depends(conexao),
):
    return turmas_do_professor(
        db=db,
        professor_id=UUID(usuario.id),
    )


@router.get("/{id}/alunos")
def listar_alunos(
    id: UUID,
    usuario: Usuario = Depends(exige_dono_da_turma),
    db: psycopg.Connection = Depends(conexao),
):
    return alunos_da_turma(
        db=db,
        turma_id=id,
    )
