import re
from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from nucleo.auth import sanitizar_nome

_MATRICULA = re.compile(r"^[A-Za-z0-9./-]{1,30}$")
_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _nome(valor: object) -> str:
    if not isinstance(valor, str) or not valor.strip():
        raise ValueError("o nome não pode ficar vazio")
    return sanitizar_nome(valor)  # tira tag HTML e caractere de controle


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
        valor = valor.strip() if isinstance(valor, str) else ""
        if not _MATRICULA.match(valor):
            raise ValueError("a matrícula deve ter de 1 a 30 letras, números, ponto, traço ou barra")
        return valor

    @field_validator("nascimento")
    @classmethod
    def validar_nascimento(cls, valor: date) -> date:
        if not date(1940, 1, 1) <= valor <= date.today():
            raise ValueError("a data de nascimento não é válida")
        return valor


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
