# Sprint #1 (24/ago–13/set) — concluída → Release 1

> Registro histórico. Índice das sprints em [`../sprints.md`](../sprints.md).

Fundação do repositório e saída do template de demonstração. Cobre o que antes estava
dividido internamente em "Sprint 0" e "Sprint 1" — as duas terminam dentro da janela oficial
da Sprint #1.

| Entrega | Responsável | Arquivo | Status |
|---|---|---|---|
| Inicialização do projeto Expo com TypeScript | João Pedro | — | Concluído — PR #4 |
| Limpeza do template do Expo | João Pedro | `app/`, `components/` | Concluído — PR #5 |
| Interfaces do domínio | Giordano | `types/aluma.ts` | Concluído — PR #8 |
| Cores e tema do Aluma | Antonio Carlos | `constants/theme.ts` | Concluído — PR #10 |
| Dados de exemplo | Thales | `data/mock.ts` | Concluído — PR #9 |
| Tela de boas-vindas | Iagor | `app/(tabs)/index.tsx` | Concluído — PR #7, #11 |

Stack fixada: React Native + Expo SDK 54, TypeScript, expo-router. Nenhuma dessas escolhas
foi preferência da equipe — todas vêm da ementa da disciplina, o que tem a vantagem de
eliminar a discussão.

Notas de execução:

- A limpeza removeu `explore.tsx`, `modal.tsx`, `hello-wave.tsx` e `parallax-scroll-view.tsx`,
  além das referências a eles nos dois `_layout.tsx`.
- O `constants/theme.ts` já existia, vindo do template; a tarefa foi substituir a paleta
  padrão do Expo pelas cores do Aluma, não criar o arquivo do zero.
- O `data/mock.ts` é material de desenvolvimento e demonstração. Pela regra 5 do projeto,
  ele fica isolado e sinalizado, e nunca entra no caminho de produção.

**Release 1** = o app abre já com a identidade do Aluma: tema, tipos do domínio e dados de
exemplo no lugar, tela inicial no lugar do template padrão do Expo.

**Retrospectiva (15/09):** o professor não aceitou a Release 1 como release. Uma release é
uma versão **estável e funcional**, e a nossa só tinha organização: uma tela estática sem
interação, e `data/mock.ts` e `types/aluma.ts` sem nenhum arquivo que os importe. O erro veio
do planejamento: a release foi definida por lista de tarefas, não pelo que o usuário consegue
fazer. **Regra a partir daqui:** toda release é definida por um *roteiro de demonstração*, ou
seja, passos que o professor executa sozinho, numa URL pública, e que funcionam. Se o roteiro
não passa inteiro, não é release.

