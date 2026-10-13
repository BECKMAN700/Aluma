"""
Sprint 3 - Definição dos endpoints

Os endpoints definidos são:
- POST /api/matriculas: Permite que alunos entrem em turmas usando um código.
- GET /api/me: Retorna as informações do perfil do usuário.
"""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from nucleo.auth import usuario_atual, Usuario
from nucleo.permissoes import exige_aluno
from nucleo.banco import conexao
from turmas.esquemas_matriculas import SolicitacaoMatricula
from turmas import consultas_matriculas
import psycopg

router = APIRouter()


@router.post("/api/matriculas", status_code=status.HTTP_201_CREATED)
def realizar_matricula(
        dados: SolicitacaoMatricula,
        usuario: Usuario = Depends(exige_aluno),
        db: psycopg.Connection = Depends(conexao)
):
    # verificar se a turma existe
    turma = consultas_matriculas.buscar_turma_por_codigo(db, dados.codigo)
    if not turma:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"erro": "código não encontrado"}
        )

    # verificar se o aluno já está em uma turma
    turma_existente = consultas_matriculas.turma_do_aluno(db, usuario.id)
    if turma_existente:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"erro": "você já está em uma turma"}
        )
    try:
        consultas_matriculas.matricular(db, usuario.id, turma["id"])
    except psycopg.errors.UniqueViolation:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"erro": "você já está em uma turma"}
        )

    return {"turma": {"id": turma["id"], "nome": turma["nome"]}}


@router.get("/api/me")
def obter_perfil_me(
        usuario: Usuario = Depends(usuario_atual),
        db: psycopg.Connection = Depends(conexao)
):
    perfil = consultas_matriculas.buscar_perfil_completo(db, usuario.id)

    if not perfil:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"erro": "perfil não encontrado"}
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