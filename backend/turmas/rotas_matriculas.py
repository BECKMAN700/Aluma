"""
Sprint 3 - Definição dos endpoints

Os endpoints definidos são:
- POST /api/matriculas: Permite que alunos entrem em turmas usando um código.
- GET /api/me: Retorna as informações do perfil do usuário.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from backend.nucleo.auth import usuario_atual, Usuario
from backend.nucleo.permissoes import exige_aluno
from backend.turmas.esquemas_matriculas import SolicitacaoMatricula
from backend.turmas import consultas_matriculas
import psycopg

router = APIRouter()


@router.post("/api/matriculas", status_code=status.HTTP_201_CREATED)
def realizar_matricula(
        dados: SolicitacaoMatricula,
        usuario: Usuario = Depends(exige_aluno)
):
    # verificar se a turma existe
    turma = consultas.buscar_turma_por_codigo(dados.codigo)
    if not turma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"erro": "código não encontrado"}
        )

    # verificar se o aluno já está em uma turma
    turma_existente = consultas.turma_do_aluno(usuario.id)
    if turma_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"erro": "você já está em uma turma"}
        )
    try:
        consultas.matricular(usuario.id, turma["id"])
    except psycopg.errors.UniqueViolation:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"erro": "você já está em uma turma"}
        )

    return {"turma": {"id": turma["id"], "nome": turma["nome"]}}


@router.get("/api/me")
def obter_perfil_me(usuario: Usuario = Depends(usuario_atual)):
    perfil = consultas.buscar_perfil_completo(usuario.id)

    if not perfil:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"erro": "perfil não encontrado"}
        )

    escola = None
    if perfil.get("escola_id"):
        escola = {
            "id": perfil["escola_id"],
            "nome": perfil["escola_nome"]
        }

    turma = None
    if perfil.get("turma_id"):
        turma = {
            "id": perfil["turma_id"],
            "nome": perfil["turma_nome"]
        }

    return {
        "id": perfil["id"],
        "nome": perfil["nome"],
        "papel": perfil["papel"],
        "escola": escola,
        "turma": turma
    }