"""
Entrada do aluno pelo link da escola (decisão de 15/11). O link já diz a escola; a matrícula e a
data de nascimento provam que é ele. Cada pré-cadastro só pode ser usado uma vez.
"""

import threading
import time
from datetime import date
from uuid import UUID

import psycopg
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, field_validator

from coordenacao.esquemas import matricula_valida, nascimento_valido
from nucleo.auth import Usuario
from nucleo.db import conexao
from nucleo.permissoes import exige_aluno

from . import consultas

router = APIRouter(prefix="/api/convites", tags=["Convites"])

# Contra quem tenta datas de nascimento até acertar: só os erros contam.
# shortcut: em memória, zera quando o Render reinicia; ir para o banco se houver mais de um servidor.
ERROS_POR_CONTA = 5  # a cada 15 minutos
ERROS_POR_ESCOLA = 50  # a cada hora, somando todas as contas: barra quem cria várias contas
_erros: dict[str, list[float]] = {}
_trava = threading.Lock()

# A mesma frase para "não existe" e "já foi usado": quem tenta não descobre quem é aluno.
NAO_ENCONTRADO = "não encontramos um aluno com esses dados nesta escola"


class EntrarPeloConvite(BaseModel):
    model_config = ConfigDict(extra="forbid")

    matricula: str
    nascimento: date

    @field_validator("matricula", mode="before")
    @classmethod
    def validar_matricula(cls, valor: object) -> str:
        return matricula_valida(valor)

    @field_validator("nascimento")
    @classmethod
    def validar_nascimento(cls, valor: date) -> date:
        return nascimento_valido(valor)


def _recentes(chave: str, janela: float) -> list[float]:
    agora = time.time()
    _erros[chave] = [t for t in _erros.get(chave, []) if t > agora - janela]
    return _erros[chave]


def _bloqueado(conta: str, escola: str) -> bool:
    with _trava:
        return (
            len(_recentes(f"conta:{conta}", 900)) >= ERROS_POR_CONTA
            or len(_recentes(f"escola:{escola}", 3600)) >= ERROS_POR_ESCOLA
        )


def _anotar_erro(conta: str, escola: str) -> None:
    with _trava:
        agora = time.time()
        _erros.setdefault(f"conta:{conta}", []).append(agora)
        _erros.setdefault(f"escola:{escola}", []).append(agora)


@router.get("/{convite}")
def escola_do_convite(convite: UUID, db: psycopg.Connection = Depends(conexao)):
    """Sem login: a tela do link mostra a cara da escola antes de a pessoa entrar."""
    escola = consultas.escola_do_convite(db, convite)
    if escola is None:
        raise HTTPException(status_code=404, detail="convite não encontrado")
    return escola


@router.post("/{convite}/entrar")
def entrar(
    convite: UUID,
    dados: EntrarPeloConvite,
    usuario: Usuario = Depends(exige_aluno),
    db: psycopg.Connection = Depends(conexao),
):
    if usuario.escola_id:
        raise HTTPException(status_code=409, detail="sua conta já está em uma escola")
    if _bloqueado(usuario.id, str(convite)):
        raise HTTPException(status_code=429, detail="muitas tentativas, espere alguns minutos")
    try:
        resultado = consultas.entrar_pelo_convite(
            db, convite, usuario.id, dados.matricula, dados.nascimento
        )
    except consultas.ContaJaNaEscola:
        raise HTTPException(status_code=409, detail="sua conta já está em uma escola") from None
    if resultado is None:
        _anotar_erro(usuario.id, str(convite))
        raise HTTPException(status_code=404, detail=NAO_ENCONTRADO)
    return resultado
