"""Consulta do GET /api/me: o perfil com escola e turma."""

from typing import Optional, Dict, Any

def buscar_perfil_completo(db, usuario_id: str) -> Optional[Dict[str, Any]]:
    with db.cursor() as cur:
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