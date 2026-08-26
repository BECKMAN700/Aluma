# Artefatos e templates

Modelos prontos. Adapte o tamanho ao nível de rigor: em nível 2, o contexto vira três parágrafos e a spec vira cinco linhas. Documento que ninguém lê é desperdício; documento ausente é retrabalho.

Índice:
- [1. Contexto do projeto](#1-contexto-do-projeto-project-contextmd)
- [2. Especificação](#2-especificação-specsnome-da-featuremd)
- [3. Plano técnico](#3-plano-técnico)
- [4. ADR](#4-adr-registro-de-decisão-de-arquitetura)
- [5. Lista de tarefas](#5-lista-de-tarefas)
- [6. Commits e PR](#6-commits-e-pr)
- [7. Handoff](#7-handoff-final-da-resposta)

## 1. Contexto do projeto (`PROJECT-CONTEXT.md`)

Vive na raiz do repositório. É o que a próxima sessão lê primeiro. Alvo: 1 a 2 páginas.

```markdown
# Contexto do projeto — <Nome>

## Problema e usuário
Quem usa, o que resolve, como se mede sucesso.

## Escopo
Está dentro: ...
Está FORA (por decisão, não por esquecimento): ...

## Stack
Linguagem e versão · framework · banco · hospedagem · gerenciador de pacotes.

## Arquitetura
Como as peças se encaixam, em 5–10 linhas ou um diagrama simples.
Fronteiras: o que cada módulo pode e não pode acessar.

## Convenções
Estilo, nomes, estrutura de pastas, tratamento de erro, formato de log,
padrão de commit. "Faça igual ao arquivo X" é uma convenção válida.

## Regras de negócio invioláveis
As que, se quebradas, geram prejuízo real. Numeradas.

## Decisões já tomadas
Link para os ADRs. Não reabrir sem motivo novo.

## Riscos conhecidos e dívidas
O que já sabemos que está frágil e por quê aceitamos por ora.

## Como rodar
Pré-requisitos, comandos, variáveis de ambiente necessárias.
```

## 2. Especificação (`specs/<nome-da-feature>.md`)

```markdown
# Spec — <Nome da feature>

## Objetivo
Uma frase: o que muda para o usuário quando isso existir.

## Fora do escopo
Lista explícita.

## Requisitos (EARS)
REQ-01 · O sistema deve <resposta>.
REQ-02 · Quando <gatilho>, o sistema deve <resposta>.
REQ-03 · Enquanto <estado>, o sistema deve <resposta>.
REQ-04 · Se <condição de erro>, então o sistema deve <resposta>.
REQ-05 · Onde <recurso presente>, o sistema deve <resposta>.

## Regras e limites
Validações, limites numéricos, formatos, permissões por papel.

## Critérios de aceite
- [ ] REQ-01 verificado por: <teste ou passo manual>
- [ ] REQ-02 verificado por: ...

## Suposições
S-01 · <suposição declarada> — corrigir se estiver errada.

## Perguntas em aberto
Q-01 · <pergunta> — bloqueia? sim/não. Padrão adotado enquanto não responder: <X>.
```

Regra prática: **para cada requisito de caminho feliz, pelo menos um REQ de comportamento indesejado (`Se… então…`)**. É a diferença entre software de demonstração e software de produção.

## 3. Plano técnico

```markdown
# Plano — <Nome>

## Abordagem escolhida
O caminho, em um parágrafo.

## Alternativas consideradas
| Opção | A favor | Contra | Veredito |
|---|---|---|---|
| A | ... | ... | escolhida — porque ... |
| B | ... | ... | descartada — porque ... |

## Mudanças por área
- Dados: tabelas/campos novos, migração, caminho de volta
- Backend: endpoints, contratos, validações
- Frontend/App: telas, estados (carregando, vazio, erro, sucesso)
- Infra: variáveis, dependências, jobs

## Riscos e mitigação
| Risco | Impacto | Mitigação |

## Ordem de execução
Fatias verticais, com o item de maior incerteza primeiro.
```

## 4. ADR (Registro de Decisão de Arquitetura)

Arquivo curto em `docs/adr/NNNN-titulo.md`. Uma página no máximo.

```markdown
# ADR-0007 — Usar banco relacional em vez de documentos

Status: aceito · Data: 2026-08-25

## Contexto
O que forçou a decisão: requisito, restrição, número medido.

## Opções
1. <opção> — consequência
2. <opção> — consequência

## Decisão
Escolhemos <X> porque <critério que pesou>.

## Consequências
Ganhamos: ...
Perdemos / passamos a conviver com: ...
Revisitar se: <condição que invalidaria a decisão>
```

O campo "revisitar se" é o mais valioso: transforma decisão em algo com validade, não em dogma.

## 5. Lista de tarefas

```markdown
- [ ] T-01 · <entrega observável> · cobre REQ-01, REQ-04 · depende de: — · pronto quando: <prova>
- [ ] T-02 · ... · cobre REQ-02 · depende de: T-01 · pronto quando: ...
```

Cada tarefa entrega comportamento de ponta a ponta e é revertível sozinha. Se a tarefa não tem prova de pronto, ela não está definida.

## 6. Commits e PR

**Commit** — no imperativo, uma mudança lógica por commit:

```
feat(pedidos): recusar checkout quando estoque for insuficiente

Antes o pedido era criado e falhava na separação, gerando estorno manual.
Passa a validar estoque na confirmação e devolver o item indisponível.

Cobre REQ-04.
```

Prefixos úteis: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `build`.

**Descrição de PR**:

```markdown
## O que muda e por quê
## Requisitos cobertos
REQ-01, REQ-04
## Como testar
Passos numerados para o revisor reproduzir.
## Risco e reversão
O que pode quebrar e como voltar atrás.
## O que ficou de fora
```

## 7. Handoff (final da resposta)

O fechamento de toda entrega. Curto, honesto, nesta ordem:

```markdown
**Feito:** <o que foi entregue e onde>
**Como verificar:** <comando ou passos>
**Suposições:** <lista — cada uma um ponto onde eu posso ter errado>
**Não testei / ficou de fora:** <lista — nunca omita esta seção>
**Risco e próximo passo:** <o que eu faria a seguir>
```

A seção "não testei" é a que constrói confiança. Assistente que só relata sucesso obriga o usuário a descobrir a lacuna em produção.
