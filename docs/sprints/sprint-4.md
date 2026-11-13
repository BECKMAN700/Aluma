# Sprint #4 — Release 4: matéria e material (replanejada em 10/11)

> Índice em [`../sprints.md`](../sprints.md). Desenho técnico em
> [`../arquitetura.md`](../arquitetura.md).
>
> A sprint não começou na data prevista (19/out–01/nov). Foi replanejada em 10/11: tudo pronto
> na **sexta, 13/11, às 18h**, para a apresentação de **segunda, 16/11**, que é treino mas vale
> ponto.

Com login e turma no lugar, a Sprint #4 entrega o que faz o tutor falar **da matéria daquela
turma**: o professor organiza a matéria em tópicos e envia o material; o aluno vê a trilha e
conversa sobre um tópico.

## 1. Roteiro de demonstração (critério de aceite da Release 4)

1. O professor abre a turma, cria a matéria "Matemática" e três tópicos.
2. Envia um PDF em um tópico. PDF grande demais, ou escaneado (sem texto), é recusado com
   mensagem clara.
3. O aluno abre o app e vê a **trilha** da matéria: os tópicos em ordem, com o status de cada um.
4. Toca num tópico e conversa. O tutor usa o conteúdo do PDF do professor e continua sem
   entregar a resposta.
5. O aluno volta para a trilha: o tópico está *em andamento*. Em outro aparelho, com a mesma
   conta, o status é o mesmo.
6. _(Fica para o refinamento.)_ O aluno marca o tópico como *dominado*.
7. Um aluno de outra turma não vê essa matéria nem esse material.

## 2. Entregas

O caminho que trava a demonstração fica com o João. Quatro colegas fazem uma peça pequena de
código cada um, com prazo um dia antes de ela ser usada.

| Entrega | Descrição | Onde | Responsável | Prazo |
|---|---|---|---|---|
| Ping agendado | GitHub Actions chama `/health` do backend de produção a cada 10 min, das 7h às 23h, para o Render não dormir | `.github/workflows/` | João | Ter 10/11 |
| Matéria e tópicos | Tabelas e rotas para o professor criar e listar; telas do professor | `materiais/`, `app/(professor)/` | João | Qua 11/11 |
| Texto do PDF | Função que recebe o PDF e devolve o texto; recusa o que não é PDF, o grande demais e o escaneado | `materiais/pdf.py` | Gustavo | Qua 11/11 |
| Escolher PDF no app | Componente que abre o seletor de arquivos e devolve o PDF | `components/` | Antonio | Qua 11/11 |
| Material no prompt | `montar_prompt(material)`: o texto do PDF entra como conteúdo delimitado, nunca como instrução | `chat/prompt.py` | Thales | Qua 11/11 |
| Linha da trilha | Componente de um tópico da trilha: ordem, nome e status | `components/` | Iagor | Qua 11/11 |
| Roteiro da apresentação | Ordem de fala, demonstração passo a passo e plano B | fora do repositório | Flávio | Qua 11/11 |
| Envio de PDF | Rota que recebe o arquivo e guarda o texto ligado ao tópico; tela de envio | `materiais/`, `app/(professor)/` | João | Qui 12/11 |
| Trilha e chat por tópico | `POST /api/chat` aceita `topico_id`; trilha do aluno com o status de cada tópico | `chat/`, `app/(aluno)/` | João | Sex 13/11 |
| Bateria anti-cola com material | As perguntas-armadilha com material no prompt, inclusive material que tenta dar ordens à IA | `docs/bateria-anti-cola.md` | João | Sex 13/11 |
| Ensaio da demonstração | Percorre o roteiro no app e abre issue para cada defeito | — | Giordano | Sex 13/11, 18h |
| Slides | Feitos a partir do roteiro | fora do repositório | João | Sex 13/11 |

**Status do tópico nesta sprint:** sai da conversa salva. Se o aluno já conversou sobre o
tópico, ele está *em andamento*; senão, *não iniciado*. A tabela `progresso` e o status
*dominado* ficam para o refinamento.

### Regras de prazo

1. **Aceite: terça, 10/11, 22h.** O responsável comenta "peguei" na issue.
2. **Prazo dos colegas: quarta, 11/11, 23h59**, com o PR aberto.
3. **Quinta, 8h:** a peça sem PR aberto passa para o João, com registro na issue.
4. **Congelamento: sexta, 13/11, 18h.** Depois disso só entra conserto de defeito que quebra a
   demonstração. Sábado é folga do plano; domingo é só ensaio.

**Release 4** = roteiro da seção 1 passando na URL pública, menos o passo 6. Fecha as 4 sprints.

## 3. Depois: refinamento (16/nov–06/dez)

Fase prevista no plano de ensino para refinar o produto antes da banca técnica (23 e 30/nov) e
do Demo Day (07/dez).

| Entrega | Descrição | Para quando | Estado |
|---|---|---|---|
| Painel do professor | Em que tópico a turma mais trava e em quê. A IA resume a dificuldade e o painel soma por tópico | Banca de 23/11 | PR #141 (12/11) |
| Tópico dominado | O aluno resolve um desafio e uma IA juíza confirma (tabela `progresso`) | Banca de 23/11 | PR #140 (12/11) |
| Aluno pede questões | O tutor propõe exercícios do tópico e corrige guiando ("Quero treinar") | Demo Day | PR #140 (12/11) |
| Visual do aluno | Acabamento da trilha e do chat para o público do fundamental | Demo Day | — |
| Checklist de véspera de demo | Crédito da IA, chave válida, créditos do Netlify, servidor acordado, banco ativo, contas de demonstração | Antes de cada apresentação | — |
| Testes ponta a ponta | O roteiro inteiro, do login ao painel, contra os serviços publicados | Banca de 23/11 | — |

### Adiantado na noite de 12/11

Além das duas entregas da banca, entraram (um PR cada, em ordem de merge):

| PR | O quê |
|---|---|
| #139 | Envio de PDF, trilha e chat por tópico na `develop` (conserto do merge empilhado) |
| #142 | "Continuar de onde parei" no início do aluno e atalhos no chat do tópico |
| #143 | O professor testa a Luma no tópico, sem gravar nada |
| #144 | Renomear, reordenar e excluir (só o que está vazio) matéria e tópico |
| #145 | Seed da demonstração com a trilha de Matemática (`seed_demo.py --trilha`) |

Migração nova: `003_progresso.sql` (aplicar no Supabase antes de testar o #140 em diante).
