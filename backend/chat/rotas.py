import psycopg
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from chat import consultas
from chat.claude import chat_com_claude
from chat.esquemas import HISTORICO_MAX_ITENS, ChatRequest
from chat.gemini import TutorIndisponivel, chat_com_gemini
from nucleo.auth import Usuario
from nucleo.db import conexao
from nucleo.permissoes import exige_aluno, exige_usuario_do_chat
from nucleo.rate_limit import check_rate_limit

router = APIRouter()

# A tela do chat abre com as últimas mensagens; a conversa inteira pesaria no celular fraco.
MENSAGENS_NA_TELA = 50


# A permissão vem antes do limite: conta sem turma é barrada sem gastar cota nem crédito de IA.
# O FastAPI guarda o resultado de exige_usuario_do_chat: o parâmetro `usuario` não roda de novo.
# shortcut: a conexão com o banco fica aberta durante a chamada à IA (até ~55s); se o pooler do
# Supabase começar a recusar conexão com a turma inteira usando, separar leitura e gravação.
@router.post(
    "/api/chat",
    dependencies=[Depends(exige_usuario_do_chat), Depends(check_rate_limit)],
)
def chat(
    payload: ChatRequest,
    usuario: Usuario = Depends(exige_usuario_do_chat),
    db: psycopg.Connection = Depends(conexao),
):
    """
    Rota de chat com o tutor. Para o aluno, o histórico vem da conversa salva no banco e a troca
    é gravada; o `historico` do corpo é ignorado, senão quem chama a API inventaria falas do tutor.
    Retorna a resposta do Claude (ou do Gemini, de reserva) ou erro se os dois falharem.
    """
    try:
        if usuario.papel == "aluno":
            conversa_id = consultas.conversa_do_aluno(db, usuario.id) or consultas.criar_conversa(
                db, usuario.id
            )
            historico = consultas.ultimas_mensagens(db, conversa_id, HISTORICO_MAX_ITENS)
        else:
            # Professor testando o tutor: o histórico vem do app e nada é gravado.
            conversa_id = None
            historico = [{"autor": msg.autor, "texto": msg.texto} for msg in payload.historico]

        # Claude primeiro; sem chave, sem crédito ou fora do ar, o Gemini assume.
        try:
            resposta = chat_com_claude(payload.mensagem, historico)
        except TutorIndisponivel:
            resposta = chat_com_gemini(payload.mensagem, historico)

        # Só grava a troca que deu certo: se o tutor caiu, o aluno manda de novo.
        if conversa_id:
            consultas.gravar_troca(db, conversa_id, payload.mensagem, resposta)
        return {"resposta": resposta}

    except TutorIndisponivel:
        # A falha já foi registrada em gemini.py, sem conteúdo de conversa.
        return JSONResponse(status_code=503, content={"erro": "tutor indisponivel"})

    except Exception as e:
        # Só o tipo do erro vai para o log: a mensagem crua pode carregar
        # trecho da conversa do aluno (regra inviolável 8).
        print(f"[chat] erro interno: {type(e).__name__}")
        return JSONResponse(status_code=500, content={"erro": "erro interno do servidor"})


@router.get("/api/conversas/atual")
def conversa_atual(
    usuario: Usuario = Depends(exige_aluno),
    db: psycopg.Connection = Depends(conexao),
):
    conversa_id = consultas.conversa_do_aluno(db, usuario.id)
    mensagens = consultas.ultimas_mensagens(db, conversa_id, MENSAGENS_NA_TELA) if conversa_id else []
    return {"mensagens": mensagens}
