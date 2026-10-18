from pydantic import BaseModel, ConfigDict, Field, field_validator


class CriarTurma(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(max_length=60)
    serie: str = Field(max_length=30)

    @field_validator("nome", "serie", mode="before")
    @classmethod
    def validar_texto_obrigatorio(cls, valor: str) -> str:
        if isinstance(valor, str):
            valor = valor.strip()

        if not valor:
            raise ValueError(
                "o nome e a serie da turma nao podem ficar vazios"
            )

        return valor