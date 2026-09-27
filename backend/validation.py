"""Validação da entrada de /api/chat (issue #39).

Toda entrada é hostil até prova em contrário (regra inviolável 3): qualquer pessoa pode
chamar a API sem passar pelo app, e um pedido inválido não pode chegar ao Gemini — protege
a cota gratuita (~1.500 chamadas/dia).
"""

from pydantic import BaseModel, ConfigDict, field_validator

TEXTO_MAX_CARACTERES = 2000
HISTORICO_MAX_ITENS = 10
AUTORES_VALIDOS = {"aluno", "tutor"}


class Mensagem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    autor: str
    texto: str

    @field_validator("autor")
    @classmethod
    def autor_valido(cls, v: str) -> str:
        if v not in AUTORES_VALIDOS:
            raise ValueError('o autor de uma mensagem do historico deve ser "aluno" ou "tutor"')
        return v

    @field_validator("texto")
    @classmethod
    def texto_valido(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("uma mensagem do historico nao pode ficar vazia")
        if len(v) > TEXTO_MAX_CARACTERES:
            raise ValueError(f"uma mensagem do historico passou de {TEXTO_MAX_CARACTERES} caracteres")
        return v


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mensagem: str
    historico: list[Mensagem] = []

    @field_validator("mensagem")
    @classmethod
    def mensagem_valida(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("a mensagem nao pode ficar vazia")
        if len(v) > TEXTO_MAX_CARACTERES:
            raise ValueError(f"a mensagem passou de {TEXTO_MAX_CARACTERES} caracteres")
        return v

    @field_validator("historico")
    @classmethod
    def historico_corta_mais_antigos(cls, v: list) -> list:
        # O contexto relevante pro tutor é o que aconteceu por ultimo na conversa.
        return v[-HISTORICO_MAX_ITENS:] if len(v) > HISTORICO_MAX_ITENS else v
