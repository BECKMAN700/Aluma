from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends, status

from nucleo.auth import Usuario
from nucleo.db import conexao
from nucleo.permissoes import (
    exige_dono_da_materia,
    exige_dono_da_turma,
    exige_membro_da_turma,
)

from .consultas import criar_materia, criar_topico, materias_da_turma
from .esquemas import CriarMateria, CriarTopico


router = APIRouter(prefix="/api", tags=["Materias"])


@router.post("/turmas/{id}/materias", status_code=status.HTTP_201_CREATED)
def criar_materia_da_turma(
    id: UUID,
    dados: CriarMateria,
    usuario: Usuario = Depends(exige_dono_da_turma),
    db: psycopg.Connection = Depends(conexao),
):
    return criar_materia(db=db, turma_id=id, nome=dados.nome)


@router.get("/turmas/{id}/materias")
def listar_materias(
    id: UUID,
    usuario: Usuario = Depends(exige_membro_da_turma),
    db: psycopg.Connection = Depends(conexao),
):
    return {"materias": materias_da_turma(db=db, turma_id=id)}


@router.post("/materias/{id}/topicos", status_code=status.HTTP_201_CREATED)
def criar_topico_da_materia(
    id: UUID,
    dados: CriarTopico,
    usuario: Usuario = Depends(exige_dono_da_materia),
    db: psycopg.Connection = Depends(conexao),
):
    return criar_topico(db=db, materia_id=id, nome=dados.nome)
