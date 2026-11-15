"""
GET /api/me: quem está logado, a escola e a turma dele.

A matrícula por código saiu (decisão de 15/11): quem matricula é o coordenador da escola.
"""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from nucleo.auth import usuario_atual, Usuario
from nucleo.db import conexao
from turmas import consultas_matriculas
import psycopg

router = APIRouter()


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
