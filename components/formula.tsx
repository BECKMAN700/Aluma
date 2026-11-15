import { Text } from 'react-native';
import { formulaEmTexto } from '@/components/formulas';

// No app nativo o KaTeX não roda (precisa do DOM): a fórmula vira texto legível. Na web, formula.web.tsx.
export function Formula({ latex, bloco }: { latex: string; bloco: boolean }) {
  const texto = formulaEmTexto(latex);
  return <Text>{bloco ? `\n${texto}\n` : texto}</Text>;
}
