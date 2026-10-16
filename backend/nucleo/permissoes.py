from uuid import UUID

import psycopg
from fastapi import Depends, HTTPException

from nucleo import consultas
from nucleo.auth import Usuario, usuario_atual
from nucleo.db import conexao


def exige_professor(usuario: Usuario = Depends(usuario_atual)) -> Usuario:
    if usuario.papel != "professor":
        raise HTTPException(status_code=403, detail="voce nao tem acesso a isso")
    return usuario


def exige_aluno(usuario: Usuario = Depends(usuario_atual)) -> Usuario:
    if usuario.papel != "aluno":
        raise HTTPException(status_code=403, detail="voce nao tem acesso a isso")
    return usuario


def exige_dono_da_turma(
    id: UUID,
    usuario: Usuario = Depends(exige_professor),
    db: psycopg.Connection = Depends(conexao),
) -> Usuario:
    if not usuario.escola_id:
        raise HTTPException(status_code=404, detail="turma nao encontrada")
    try:
        autorizado = consultas.professor_dono_da_turma(
            db, id, usuario.id, usuario.escola_id
        )
    except Exception:
        raise HTTPException(
            status_code=503, detail="nao foi possivel verificar a permissao"
        ) from None
    if not autorizado:
        raise HTTPException(status_code=404, detail="turma nao encontrada")
    return usuario


def exige_aluno_da_turma(
    id: UUID,
    usuario: Usuario = Depends(exige_aluno),
    db: psycopg.Connection = Depends(conexao),
) -> Usuario:
    try:
        autorizado = consultas.aluno_matriculado_na_turma(
            db, id, usuario.id
        )
    except Exception:
        raise HTTPException(
            status_code=503, detail="nao foi possivel verificar a permissao"
        ) from None
    if not autorizado:
        raise HTTPException(status_code=404, detail="turma nao encontrada")
    return usuario


def exige_usuario_do_chat(
    usuario: Usuario = Depends(usuario_atual),
    db: psycopg.Connection = Depends(conexao),
) -> Usuario:
    if usuario.papel == "professor":
        return usuario
    if usuario.papel != "aluno":
        raise HTTPException(status_code=403, detail="voce nao tem acesso a isso")
    try:
        matriculado = consultas.aluno_tem_turma(db, usuario.id)
    except Exception:
        raise HTTPException(
            status_code=503, detail="nao foi possivel verificar a permissao"
        ) from None
    if not matriculado:
        raise HTTPException(status_code=403, detail="voce precisa estar em uma turma")
    return usuario