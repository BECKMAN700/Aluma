"""
Sprint 3 - Camada de acesso ao banco de dados para o módulo de matrículas.
Nesse arquivo contém:
- Buscar turmas por código de acesso;
- Verificar a turma do aluno;
- Efetiva a matrícula vinculando o aluno à turma;
- Busca as informações completas da pessoa logada.
"""

from typing import Optional, Dict, Any
from backend.nucleo.db import conexao

def buscar_turma_por_codigo(codigo: str) -> Optional[Dict[str, Any]]:
    conn = next(conexao())
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, nome, escola_id, professor_id, serie, codigo FROM turmas WHERE codigo = %s;",
            (codigo,)
        )
        return cur.fetchone()

def turma_do_aluno(aluno_id: str) -> Optional[Dict[str, Any]]:
    conn = next(conexao())
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT t.id, t.nome 
            FROM matriculas m
            JOIN turmas t ON m.turma_id = t.id
            WHERE m.aluno_id = %s;
            """,
            (aluno_id,)
        )
        return cur.fetchone()

def matricular(aluno_id: str, turma_id: str) -> bool:
    conn = next(conexao())
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO matriculas (aluno_id, turma_id) VALUES (%s, %s);",
            (aluno_id, turma_id)
        )
        conn.commit()
        return True

def buscar_perfil_completo(usuario_id: str) -> Optional[Dict[str, Any]]:
    conn = next(conexao())
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT 
                p.id, 
                p.nome, 
                p.papel, 
                e.id as escola_id, 
                e.nome as escola_nome,
                t.id as turma_id,
                t.nome as turma_nome
            FROM perfis p
            LEFT JOIN escolas e ON p.escola_id = e.id
            LEFT JOIN matriculas m ON p.id = m.aluno_id
            LEFT JOIN turmas t ON m.turma_id = t.id
            WHERE p.id = %s;
            """,
            (usuario_id,)
        )
        return cur.fetchone()