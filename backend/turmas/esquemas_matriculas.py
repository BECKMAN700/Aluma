"""
Sprint 3 - Esquemas de validação para o módulo de matrículas.
Aplica as seguintes regras:
- Remove espaços;
- Converte todos os caracteres para maiúsculas;
- Garante o tamanho de 6 caracteres.
"""

from pydantic import BaseModel, field_validator, ValidationInfo

class SolicitacaoMatricula(BaseModel):
    codigo: str

    @field_validator('codigo')
    @classmethod
    def normalizar_e_validar_codigo(cls, v: str) -> str:
        # Remove espaços e converte para maiúsculo
        codigo_limpo = v.strip().upper()
        # Valida se tem exatamente 6 caracteres
        if len(codigo_limpo) != 6:
            raise ValueError("O código precisa ter exatamente 6 caracteres.")
        return codigo_limpo