from io import BytesIO

from pypdf import PdfReader


TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024
TEXTO_MAXIMO_CARACTERES = 20_000


class PdfRecusado(Exception):
    """A mensagem é a frase que o professor lê na tela."""


def extrair_texto(conteudo: bytes) -> str:
    """Devolve o texto do PDF. Levanta PdfRecusado quando o arquivo não serve."""
    if len(conteudo) > TAMANHO_MAXIMO_BYTES:
        raise PdfRecusado("O PDF deve ter no máximo 5 MB.")

    if not conteudo.startswith(b"%PDF-"):
        raise PdfRecusado("O arquivo enviado não é um PDF válido.")

    try:
        leitor = PdfReader(BytesIO(conteudo))
        protegido = leitor.is_encrypted
    except Exception:
        raise PdfRecusado(
            "Não foi possível ler o PDF. Envie um arquivo válido e sem senha."
        ) from None

    if protegido:
        raise PdfRecusado(
            "O PDF está protegido por senha. Remova a proteção e envie novamente."
        )

    partes: list[str] = []
    total_caracteres = 0
    try:
        for pagina in leitor.pages:
            parte = pagina.extract_text() or ""
            total_caracteres += len(parte) + (1 if partes else 0)
            if total_caracteres > TEXTO_MAXIMO_CARACTERES:
                raise PdfRecusado(
                    "O PDF tem texto demais. Envie somente o trecho referente ao tópico."
                )
            partes.append(parte)
    except PdfRecusado:
        raise
    except Exception:
        raise PdfRecusado(
            "Não foi possível ler o PDF. Envie um arquivo válido e sem senha."
        ) from None

    texto = "\n".join(partes).strip()
    if not texto:
        raise PdfRecusado(
            "O PDF não contém texto selecionável. Envie um PDF com texto, não uma imagem escaneada."
        )

    return texto
