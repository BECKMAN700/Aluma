from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends

from nucleo.auth import Usuario
from nucleo.db import conexao
from nucleo.permissoes import exige_dono_da_turma, exige_professor

from .consultas import alunos_da_turma, turmas_do_professor


router = APIRouter(
    prefix="/api/turmas",
    tags=["Turmas"],
)


@router.get("")
def listar(
    usuario: Usuario = Depends(exige_professor),
    db: psycopg.Connection = Depends(conexao),
):
    return {
        "turmas": turmas_do_professor(
            db=db,
            professor_id=UUID(str(usuario.id)),
        )
    }


@router.get("/{id}/alunos")
def listar_alunos(
    id: UUID,
    usuario: Usuario = Depends(exige_dono_da_turma),
    db: psycopg.Connection = Depends(conexao),
):
    return {
        "alunos": alunos_da_turma(
            db=db,
            turma_id=id,
        )
    }