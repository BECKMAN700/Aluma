from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends

from nucleo.auth import Usuario
from nucleo.db import conexao
from nucleo.permissoes import exige_dono_da_turma, exige_professor

from painel.consultas import painel_da_turma

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

# Os tópicos com mais gente tentando sem dominar, para o "Fique atento" do início.
ATENCAO_MAXIMO = 6


@router.get("/resumo")
def resumo(
    usuario: Usuario = Depends(exige_professor),
    db: psycopg.Connection = Depends(conexao),
):
    """
    Início do professor: cada turma com os totais e o "Fique atento". Só números, nunca conversa.
    shortcut: uma consulta do painel por turma; um professor tem poucas turmas. Juntar numa consulta
    só se passar de umas 20.
    """
    turmas, atencao = [], []
    for turma in turmas_do_professor(db=db, professor_id=UUID(str(usuario.id))):
        topicos = painel_da_turma(db=db, turma_id=turma["id"], professor_id=usuario.id)
        turmas.append({
            **turma,
            "alunos": len(alunos_da_turma(db=db, turma_id=turma["id"])),
            "topicos": len(topicos),
            "dominado": sum(t["dominado"] for t in topicos),
            "em_andamento": sum(t["em_andamento"] for t in topicos),
            "nao_iniciado": sum(t["nao_iniciado"] for t in topicos),
        })
        atencao += [
            {"turma_id": turma["id"], "turma": turma["nome"], "topico_id": t["id"], "topico": t["nome"],
             "em_andamento": t["em_andamento"]}
            for t in topicos if t["em_andamento"] > 0
        ]
    atencao.sort(key=lambda a: -a["em_andamento"])
    return {"turmas": turmas, "atencao": atencao[:ATENCAO_MAXIMO]}
