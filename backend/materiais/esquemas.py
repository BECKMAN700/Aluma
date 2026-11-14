from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


def _texto_obrigatorio(valor: object, mensagem: str) -> object:
    if isinstance(valor, str):
        valor = valor.strip()
    if not valor:
        raise ValueError(mensagem)
    return valor


class CriarMateria(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(max_length=60)

    @field_validator("nome", mode="before")
    @classmethod
    def validar_nome(cls, valor: object) -> object:
        return _texto_obrigatorio(valor, "o nome da materia nao pode ficar vazio")


class CriarTopico(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(max_length=80)

    @field_validator("nome", mode="before")
    @classmethod
    def validar_nome(cls, valor: object) -> object:
        return _texto_obrigatorio(valor, "o nome do topico nao pode ficar vazio")


class MoverTopico(BaseModel):
    model_config = ConfigDict(extra="forbid")

    direcao: Literal["cima", "baixo"]
