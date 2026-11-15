"""Validação da entrada de /api/chat (issue #39).

Toda entrada é hostil até prova em contrário (regra inviolável 3): qualquer pessoa pode
chamar a API sem passar pelo app, e um pedido inválido não pode chegar ao Gemini — protege
a cota gratuita (~1.500 chamadas/dia).
"""

import base64
import binascii
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator, model_validator

TEXTO_MAX_CARACTERES = 2000
HISTORICO_MAX_ITENS = 10
AUTORES_VALIDOS = {"aluno", "tutor"}
# O app reduz a foto para ~1500 px antes de enviar (~300 KB); 1,5 MB dá folga sem abrir porta
# para upload gigante pagar token de IA.
IMAGEM_MAX_BYTES = 1_500_000


def tipo_da_imagem(conteudo: bytes) -> str | None:
    """Pelo conteúdo, nunca pelo que o app diz: só os formatos que a IA lê."""
    if conteudo.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if conteudo.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if conteudo[:4] == b"RIFF" and conteudo[8:12] == b"WEBP":
        return "image/webp"
    return None


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
    # Vazio = chat geral, que continua existindo.
    topico_id: UUID | None = None
    # Conversa de um projeto do aluno (projetos/rotas.py). Nunca junto com tópico.
    conversa_id: UUID | None = None
    # Foto da questão em base64, sem o prefixo "data:". Não é gravada: só vai para a IA.
    imagem: str | None = None

    @model_validator(mode="after")
    def topico_ou_conversa(self) -> "ChatRequest":
        if self.topico_id and self.conversa_id:
            raise ValueError("a mensagem vai para um tópico ou para uma conversa de projeto, não os dois")
        return self

    @field_validator("mensagem")
    @classmethod
    def mensagem_valida(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("a mensagem nao pode ficar vazia")
        if len(v) > TEXTO_MAX_CARACTERES:
            raise ValueError(f"a mensagem passou de {TEXTO_MAX_CARACTERES} caracteres")
        return v

    @field_validator("imagem")
    @classmethod
    def imagem_valida(cls, v: str | None) -> str | None:
        if v is None:
            return v
        # Confere o tamanho antes de decodificar: base64 ocupa 4/3 do arquivo.
        if len(v) > IMAGEM_MAX_BYTES * 4 // 3 + 4:
            raise ValueError("a foto passou de 1,5 MB")
        try:
            conteudo = base64.b64decode(v, validate=True)
        except (binascii.Error, ValueError):
            raise ValueError("a foto chegou corrompida") from None
        if tipo_da_imagem(conteudo) is None:
            raise ValueError("envie a foto em JPG, PNG ou WebP")
        return v

    def foto(self) -> tuple[str, str] | None:
        """(tipo, base64) para a IA, ou None sem foto."""
        if self.imagem is None:
            return None
        return tipo_da_imagem(base64.b64decode(self.imagem)), self.imagem

    @field_validator("historico")
    @classmethod
    def historico_corta_mais_antigos(cls, v: list) -> list:
        # O contexto relevante pro tutor é o que aconteceu por ultimo na conversa.
        return v[-HISTORICO_MAX_ITENS:] if len(v) > HISTORICO_MAX_ITENS else v
