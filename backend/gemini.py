import os
from google import genai
from google.genai import types

def chat_com_gemini(mensagem: str, historico: list) -> str:
    """
    Comunica-se com o Gemini para obter a resposta do tutor.
    O histórico é uma lista de dicionários com 'autor' ('aluno' ou 'tutor') e 'texto'.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise Exception("tutor indisponivel")
        
    try:
        client = genai.Client(api_key=api_key)
        
        # Constrói a lista de contents seguindo o formato esperado pela API do genai
        # O histórico é recebido como [{"autor": "aluno", "texto": "..."}, ...]
        contents = []
        for msg in historico:
            role = "user" if msg["autor"] == "aluno" else "model"
            contents.append(
                types.Content(role=role, parts=[types.Part.from_text(text=msg["texto"])])
            )
            
        # Adiciona a mensagem atual
        contents.append(
            types.Content(role="user", parts=[types.Part.from_text(text=mensagem)])
        )
        
        response = client.models.generate_content(
            model='gemini-3.5-flash-lite',
            contents=contents
        )
        
        if not response.text:
            raise Exception("tutor indisponivel")
        return response.text
    except Exception as e:
        print(f"Erro ao chamar Gemini: {e}")
        raise Exception("tutor indisponivel")
