"""
Projetos do aluno (decisão de 15/11): pastas para estudar um assunto, com várias conversas.
Privados: só o dono vê, e o painel do professor conta só conversas de tópico.
A conversa em si passa pelo POST /api/chat com `conversa_id` (chat/rotas.py).
"""

from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field, field_validator

from chat import consultas as chat
from nucleo.auth import Usuario
from nucleo.db import conexao
from nucleo.permissoes import exige_usuario_do_chat

from . import consultas

router = APIRouter(prefix="/api", tags=["Projetos"])
MENSAGENS_NA_TELA = 50


def exige_aluno_com_turma(usuario: Usuario = Depends(exige_usuario_do_chat)) -> Usuario:
    """Aluno matriculado (a regra do chat). O professor testa a IA pelo tópico, não aqui."""
    if usuario.papel != "aluno":
        raise HTTPException(status_code=403, detail="voce nao tem acesso a isso")
    return usuario


class NovoProjeto(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(max_length=60)

    @field_validator("nome", mode="before")
    @classmethod
    def validar_nome(cls, valor: object) -> object:
        if isinstance(valor, str):
            valor = " ".join(valor.split())
        if not valor:
            raise ValueError("dê um nome ao projeto")
        return valor


@router.get("/projetos")
def listar(usuario: Usuario = Depends(exige_aluno_com_turma), db: psycopg.Connection = Depends(conexao)):
    return {"projetos": consultas.projetos_do_aluno(db, usuario.id)}


@router.post("/projetos", status_code=status.HTTP_201_CREATED)
def criar(
    dados: NovoProjeto,
    usuario: Usuario = Depends(exige_aluno_com_turma),
    db: psycopg.Connection = Depends(conexao),
):
    projeto = consultas.criar_projeto(db, usuario.id, dados.nome)
    if projeto is None:
        raise HTTPException(status_code=409, detail="você chegou ao limite de projetos; apague um antes")
    return projeto


@router.delete("/projetos/{id}", status_code=status.HTTP_204_NO_CONTENT)
def apagar(id: UUID, usuario: Usuario = Depends(exige_aluno_com_turma), db: psycopg.Connection = Depends(conexao)):
    if not consultas.apagar_projeto(db, id, usuario.id):
        raise HTTPException(status_code=404, detail="projeto não encontrado")


@router.post("/projetos/{id}/conversas", status_code=status.HTTP_201_CREATED)
def nova_conversa(id: UUID, usuario: Usuario = Depends(exige_aluno_com_turma), db: psycopg.Connection = Depends(conexao)):
    conversa = consultas.nova_conversa(db, id, usuario.id)
    if conversa is None:
        raise HTTPException(status_code=404, detail="projeto não encontrado")
    return conversa


@router.get("/conversas/{id}/mensagens")
def mensagens(id: UUID, usuario: Usuario = Depends(exige_aluno_com_turma), db: psycopg.Connection = Depends(conexao)):
    if not consultas.conversa_de_projeto_do_aluno(db, id, usuario.id):
        raise HTTPException(status_code=404, detail="conversa não encontrada")
    return {"mensagens": chat.ultimas_mensagens(db, id, MENSAGENS_NA_TELA)}
