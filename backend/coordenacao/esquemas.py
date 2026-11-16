import re
from datetime import date
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from nucleo.auth import sanitizar_nome

_MATRICULA = re.compile(r"^[A-Za-z0-9./-]{1,30}$")
_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _nome(valor: object) -> str:
    if not isinstance(valor, str) or not valor.strip():
        raise ValueError("o nome não pode ficar vazio")
    return sanitizar_nome(valor)  # tira tag HTML e caractere de controle


def matricula_valida(valor: object) -> str:
    valor = valor.strip() if isinstance(valor, str) else ""
    if not _MATRICULA.match(valor):
        raise ValueError("a matrícula deve ter de 1 a 30 letras, números, ponto, traço ou barra")
    return valor


def nascimento_valido(valor: date) -> date:
    if not date(1940, 1, 1) <= valor <= date.today():
        raise ValueError("a data de nascimento não é válida")
    return valor


class PreCadastrarAluno(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(max_length=100)
    matricula: str
    nascimento: date

    @field_validator("nome", mode="before")
    @classmethod
    def validar_nome(cls, valor: object) -> str:
        return _nome(valor)

    @field_validator("matricula", mode="before")
    @classmethod
    def validar_matricula(cls, valor: object) -> str:
        return matricula_valida(valor)

    @field_validator("nascimento")
    @classmethod
    def validar_nascimento(cls, valor: date) -> date:
        return nascimento_valido(valor)


class Transferir(BaseModel):
    model_config = ConfigDict(extra="forbid")

    turma_id: UUID


class CriarProfessor(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(max_length=100)
    email: str

    @field_validator("nome", mode="before")
    @classmethod
    def validar_nome(cls, valor: object) -> str:
        return _nome(valor)

    @field_validator("email", mode="before")
    @classmethod
    def validar_email(cls, valor: object) -> str:
        valor = valor.strip().lower() if isinstance(valor, str) else ""
        if len(valor) > 254 or not _EMAIL.match(valor):
            raise ValueError("o e-mail não é válido")
        return valor


class CriarMateriaComProfessor(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(max_length=60)
    professor_id: UUID

    @field_validator("nome", mode="before")
    @classmethod
    def validar_nome(cls, valor: object) -> object:
        if isinstance(valor, str):
            valor = valor.strip()
        if not valor:
            raise ValueError("o nome da matéria não pode ficar vazio")
        return valor


_COR = re.compile(r"^#[0-9a-f]{6}$")
_NOME_DA_IA = re.compile(r"^[^\W_](?:[\w .'-]*[^\W_])?$")


class Marca(BaseModel):
    """A paleta de cores fica no app; aqui o servidor só garante que é uma cor de verdade."""

    model_config = ConfigDict(extra="forbid")

    nome_do_sistema: str = Field(max_length=30)
    nome_da_ia: str = Field(max_length=30)
    cor: str
    cor_secundaria: str
    logo_formato: Literal["redondo", "quadrado", "livre"]

    @field_validator("nome_do_sistema", mode="before")
    @classmethod
    def validar_nome_do_sistema(cls, valor: object) -> str:
        return _nome(valor)[:30]

    @field_validator("nome_da_ia", mode="before")
    @classmethod
    def validar_nome_da_ia(cls, valor: object) -> str:
        # O nome entra nas instruções da IA (chat/prompt.py): só um nome, nada que vire ordem.
        valor = _nome(valor)[:30]
        if not _NOME_DA_IA.match(valor):
            raise ValueError("o nome da IA aceita só letras, números, espaço, ponto, hífen e apóstrofo")
        return valor

    @field_validator("cor", "cor_secundaria", mode="before")
    @classmethod
    def validar_cor(cls, valor: object) -> str:
        valor = valor.strip().lower() if isinstance(valor, str) else ""
        if not _COR.match(valor):
            raise ValueError("a cor precisa estar no formato #rrggbb")
        return valor
