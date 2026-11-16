import { useEffect, useState } from 'react';
import { formulaEmTexto } from '@/components/formulas';

// O KaTeX pesa ~270 KB: só baixa quando aparece a primeira fórmula, e uma vez para o app todo.
let carregando: Promise<typeof import('katex')> | null = null;

// O CSS vem de public/katex (cópia de node_modules/katex/dist, mesma versão fixada no package.json):
// importado pelo Metro, as fontes viravam "fonts/…" relativo à rota e davam 404.
function carregarKatex() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/katex/katex.min.css';
  document.head.appendChild(link);
  return import('katex');
}

export function Formula({ latex, bloco }: { latex: string; bloco: boolean }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    carregando ??= carregarKatex();
    carregando.then(({ default: katex }) => {
      try {
        // A resposta da IA é entrada hostil (o aluno pode induzi-la): trust false bloqueia
        // \href e \html*, e os limites seguram fórmula gigante feita para travar a tela.
        const pronto = katex.renderToString(latex, {
          displayMode: bloco, throwOnError: true, trust: false, maxSize: 20, maxExpand: 200,
        });
        if (ativo) setHtml(pronto);
      } catch {
        // LaTeX quebrado: fica o texto legível em vez de erro na tela.
      }
    });
    return () => { ativo = false; };
  }, [latex, bloco]);

  if (html === null) return <span style={bloco ? { display: 'block' } : undefined}>{formulaEmTexto(latex)}</span>;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
