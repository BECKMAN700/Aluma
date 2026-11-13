from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from chat.claude import chat_com_claude
from chat.gemini import TutorIndisponivel, chat_com_gemini
from chat.prompt import PROMPT_RESUMO, montar_pedido_de_resumo
from nucleo.auth import Usuario
from nucleo.db import conexao
from nucleo.permissoes import exige_dono_da_turma, exige_dono_do_topico
from nucleo.rate_limit import check_rate_limit

from .consultas import falas_dos_alunos, guardar_resumo, painel_da_turma

router = APIRouter(prefix="/api", tags=["Painel"])

# As falas mais recentes bastam para ver o padrão, e o pedido à IA fica barato.
FALAS_NO_RESUMO = 60
MINIMO_DE_FALAS = 3


@router.get("/turmas/{id}/painel")
def painel(
    id: UUID,
    usuario: Usuario = Depends(exige_dono_da_turma),
    db: psycopg.Connection = Depends(conexao),
):
    return {"topicos": painel_da_turma(db=db, turma_id=id)}


@router.post(
    "/topicos/{id}/resumo-de-duvidas",
    dependencies=[Depends(exige_dono_do_topico), Depends(check_rate_limit)],
)
def resumir_duvidas(
    id: UUID,
    usuario: Usuario = Depends(exige_dono_do_topico),
    db: psycopg.Connection = Depends(conexao),
):
    """O professor vê o resumo, nunca a conversa: privacidade é parte do produto."""
    falas = falas_dos_alunos(db=db, topico_id=id, limite=FALAS_NO_RESUMO)
    if len(falas) < MINIMO_DE_FALAS:
        raise HTTPException(
            status_code=422,
            detail="Ainda há poucas perguntas dos alunos neste tópico para resumir.",
        )
    pedido = montar_pedido_de_resumo(falas)
    try:
        try:
            texto = chat_com_claude(pedido, [], system=PROMPT_RESUMO)
        except TutorIndisponivel:
            texto = chat_com_gemini(pedido, [], system=PROMPT_RESUMO)
    except TutorIndisponivel:
        return JSONResponse(status_code=503, content={"erro": "tutor indisponivel"})
    return guardar_resumo(db=db, topico_id=id, texto=texto.strip())
