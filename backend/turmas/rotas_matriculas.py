"""
GET /api/me: quem está logado, a escola (com a marca) e a turma dele.

A matrícula por código saiu (decisão de 15/11): quem matricula é o coordenador da escola.
"""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from nucleo.auth import usuario_atual, Usuario
from nucleo.db import conexao
from turmas import consultas_matriculas
import psycopg

router = APIRouter()

CAMPOS_DA_MARCA = ("nome_do_sistema", "nome_da_ia", "cor", "cor_secundaria", "logo_formato", "tem_logo")


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
        # A marca vem junto: o app abre já com a cara da escola.
        escola = {
            "id": perfil["escola_id"],
            "nome": perfil["escola_nome"],
            **{campo: perfil[campo] for campo in CAMPOS_DA_MARCA},
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
        "turma": turma,
        "trocar_senha": perfil["trocar_senha"],
    }


@router.post("/api/me/senha-trocada", status_code=status.HTTP_204_NO_CONTENT)
def senha_trocada(
        usuario: Usuario = Depends(usuario_atual),
        db: psycopg.Connection = Depends(conexao)
):
    """O app troca a senha direto no Supabase e avisa aqui para parar de pedir a troca."""
    db.execute("update perfis set trocar_senha = false where id = %s", (usuario.id,))
