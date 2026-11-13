from urllib.parse import unquote
from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status

from nucleo.auth import Usuario
from nucleo.db import conexao
from nucleo.permissoes import (
    exige_dono_da_materia,
    exige_dono_do_topico,
    exige_dono_da_turma,
    exige_membro_da_turma,
)

from . import pdf
from .consultas import (
    criar_materia,
    criar_topico,
    excluir_materia_vazia,
    excluir_topico_vazio,
    guardar_material,
    materias_da_turma,
    mover_topico,
    renomear_materia,
    renomear_topico,
)
from .esquemas import CriarMateria, CriarTopico, MoverTopico


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
    aluno_id = usuario.id if usuario.papel == "aluno" else None
    return {"materias": materias_da_turma(db=db, turma_id=id, aluno_id=aluno_id)}


@router.post("/materias/{id}/topicos", status_code=status.HTTP_201_CREATED)
def criar_topico_da_materia(
    id: UUID,
    dados: CriarTopico,
    usuario: Usuario = Depends(exige_dono_da_materia),
    db: psycopg.Connection = Depends(conexao),
):
    return criar_topico(db=db, materia_id=id, nome=dados.nome)


async def corpo_do_pdf(request: Request) -> bytes:
    """Lê o PDF cru do corpo e para de ler no limite: arquivo enorme não chega a ocupar a memória."""
    conteudo = bytearray()
    async for pedaco in request.stream():
        conteudo += pedaco
        if len(conteudo) > pdf.TAMANHO_MAXIMO_BYTES:
            raise HTTPException(status_code=413, detail="O PDF deve ter no máximo 5 MB.")
    return bytes(conteudo)


@router.post("/topicos/{id}/materiais", status_code=status.HTTP_201_CREATED)
def enviar_material(
    id: UUID,
    usuario: Usuario = Depends(exige_dono_do_topico),
    conteudo: bytes = Depends(corpo_do_pdf),
    nome_arquivo: str = Header(default="material.pdf", alias="X-Nome-Arquivo", max_length=600),
    db: psycopg.Connection = Depends(conexao),
):
    try:
        texto = pdf.extrair_texto(conteudo)
    except pdf.PdfRecusado as erro:
        raise HTTPException(status_code=422, detail=str(erro)) from None
    # O app manda o nome com encodeURIComponent: cabeçalho HTTP não aceita acento.
    nome = "".join(c for c in unquote(nome_arquivo) if c.isprintable()).strip()[:120]
    return guardar_material(db=db, topico_id=id, nome_arquivo=nome or "material.pdf", texto=texto)



@router.patch("/materias/{id}")
def renomear_a_materia(
    id: UUID,
    dados: CriarMateria,
    usuario: Usuario = Depends(exige_dono_da_materia),
    db: psycopg.Connection = Depends(conexao),
):
    return renomear_materia(db=db, materia_id=id, nome=dados.nome)


@router.delete("/materias/{id}")
def excluir_a_materia(
    id: UUID,
    usuario: Usuario = Depends(exige_dono_da_materia),
    db: psycopg.Connection = Depends(conexao),
):
    if not excluir_materia_vazia(db=db, materia_id=id):
        raise HTTPException(
            status_code=409, detail="Exclua os tópicos desta matéria antes de excluir a matéria."
        )
    return {"excluido": True}


@router.patch("/topicos/{id}")
def renomear_o_topico(
    id: UUID,
    dados: CriarTopico,
    usuario: Usuario = Depends(exige_dono_do_topico),
    db: psycopg.Connection = Depends(conexao),
):
    return renomear_topico(db=db, topico_id=id, nome=dados.nome)


@router.post("/topicos/{id}/mover")
def mover_o_topico(
    id: UUID,
    dados: MoverTopico,
    usuario: Usuario = Depends(exige_dono_do_topico),
    db: psycopg.Connection = Depends(conexao),
):
    return {"topicos": mover_topico(db=db, topico_id=id, direcao=dados.direcao)}


@router.delete("/topicos/{id}")
def excluir_o_topico(
    id: UUID,
    usuario: Usuario = Depends(exige_dono_do_topico),
    db: psycopg.Connection = Depends(conexao),
):
    if not excluir_topico_vazio(db=db, topico_id=id):
        raise HTTPException(
            status_code=409,
            detail="Este tópico já tem conversa de aluno ou PDF. Para não perder nada, ele não pode ser excluído.",
        )
    return {"excluido": True}
