# Aluma — Sprint 2, como vai funcionar

_sub_ Documento para o time inteiro · 19/09 a 28/09 · leia antes de começar

## 1. Por que esta sprint é diferente

Entregamos a Release 1 e o professor **não aceitou como release**. O motivo é justo: uma release
é uma versão **estável e funcional** do produto, e a nossa tinha só organização. Uma tela bonita
que não fazia nada, dois arquivos de código que nenhum outro arquivo usava, e nenhuma forma de
alguém de fora testar.

O erro não foi de ninguém em particular: foi do planejamento. A gente definiu a release por
lista de tarefas ("fulano fez o tema, sicrano fez os tipos") em vez de definir pelo que o
usuário consegue fazer.

**Regra nova, valendo daqui para a frente:** toda release é definida por um **roteiro de
demonstração** — uma lista de passos que o professor executa sozinho, num link, e que
funcionam. Se o roteiro não passa inteiro, não é release.

## 2. O que a Release 2 entrega

Um tutor com IA de verdade, funcionando num link público. Este é o roteiro que vale como
critério de aceite:

1. Abrir a URL do app no navegador do celular, sem instalar nada.
2. Tocar em **Conversar com o tutor** e chegar na tela de chat.
3. Se o servidor estiver dormindo, ver o aviso de que o tutor está acordando. A tela não trava.
4. Perguntar *"Quanto é x em 3x + 5 = 20?"* e **não** receber `x = 5`, e sim uma pergunta-guia.
5. Insistir *"só me dá a resposta"* e o tutor continuar recusando.
6. Perguntar algo fora de estudo e o tutor recusar com educação.
7. Com o servidor fora do ar, ver um erro claro — nunca uma resposta inventada.
8. Repetir tudo com a tela estreitada a 320px e com o teclado aberto, sem nada cortado.

No dia 28, o professor vai fazer exatamente isso. Nada fora dessa lista é obrigatório nesta
sprint; tudo dentro dela é.

## 3. O que estamos construindo

```
   APP (React Native + Expo)          o que o aluno ve e toca
        |
        |  internet, formato JSON
        v
   BACKEND (Python + FastAPI)         regras, seguranca, decisoes
        |
        v
   GEMINI (IA do Google)              gera as perguntas-guia
```

Três peças, e cada uma existe por um motivo:

- **O app** roda no navegador e no celular com o mesmo código. Ele não decide nada: só mostra e
  pergunta.
- **O backend** é onde ficam as regras, porque o app está na mão do usuário e não dá para
  confiar nele. É lá também que fica a chave da IA.
- **O Gemini** é a IA, na camada gratuita: cerca de 1.500 chamadas por dia para o time inteiro.
  Por isso desperdício de chamada é problema de todos.

## 4. Quem faz o quê

| Pessoa | Frente | Entregas |
|---|---|---|
| **Giordano** | Backend | Esqueleto do servidor, integração com o Gemini, log sem conversa |
| **Thales** | Backend + CI | Prompt do tutor, deploy no Render, lint automático |
| **Flávio** | Backend | Validação da entrada, testes automáticos, formulário com 30+ alunos |
| **Gustavo** | Backend | Limite de requisições e CORS, bateria anti-cola, conversas com professores |
| **Iagor** | App | Navegação, tela de chat, balões de mensagem |
| **Antonio** | App | Refatoração da tela inicial, camada de serviço, estados de espera e erro |
| **João** | Publicação | Verificação de disponibilidade, publicação web, Release, ficha |

Cada um recebeu um **guia individual em PDF** com passo a passo, prazos, o que olhar no review
e um prompt base para usar com IA. Os guias também estão no repositório, em `docs/guias/`.

## 5. O calendário

São 9 dias. A segunda 21/09 não tem entrega para o professor — é dia de trabalho.

| Dia | Backend | App | Publicação |
|---|---|---|---|
| sáb 19 – dom 20 | Giordano começa o esqueleto | Iagor: navegação | — |
| seg 21 | Giordano fecha o esqueleto | Iagor: tela de chat | Thales: lint no CI |
| **ter 22** | **Esqueleto na `develop`** | Iagor: tela de chat | — |
| qua 23 | Flávio, Gustavo e Thales começam | Antonio: refatoração | — |
| qui 24 | — | Antonio: camada de serviço | João: verificação de disponibilidade |
| sex 25 | Thales: deploy · Flávio: testes | Antonio: estados | João: publicação web |
| sáb 26 | Gustavo: bateria anti-cola | Iagor: balões · Antonio: aviso | **Teste do roteiro, time todo** |
| dom 27 | Correções | Correções | João: Release e ficha |
| **seg 28** | **Apresentação** | | |

**Duas datas são críticas.** Terça 22: sem o esqueleto do backend no ar, três pessoas ficam
paradas. Sábado 26: é quando rodamos o roteiro inteiro juntos e ainda sobra um domingo para
consertar o que não encaixar.

## 6. Como trabalhar

### Git, do jeito que combinamos

Ninguém commita direto na `main` nem na `develop`. **Sem exceção, inclusive o responsável.**

```
git checkout develop
git pull
git checkout -b tipo/descricao-curta
```

Trabalhe, commite, envie, abra o Pull Request **com base na `develop`**, espere a revisão,
mergeie depois de aprovado e **apague a branch**.

Esse último passo não é frescura: o PR #11 da sprint passada conflitou exatamente porque uma
branch continuou viva depois do merge.

Mensagem de commit em português, curta, no imperativo, com prefixo: `feat:` funcionalidade
nova, `fix:` correção, `docs:` documentação, `chore:` manutenção.

### Issues

Cada tarefa da sprint virou uma **issue no GitHub**, com responsável e prazo, dentro do marco
**Release 2**. Na descrição do PR, escreva `closes #N` com o número da sua issue: ela fecha
sozinha quando o PR entrar.

Isso não é burocracia. A ficha de avaliação pede evidência de "issue finalizada" por pessoa, e
issue fechada por PR é a evidência mais fácil de mostrar.

### Review: quem revisa quem

| PR de | Revisor obrigatório |
|---|---|
| Giordano | Flávio |
| Flávio | Gustavo |
| Gustavo | Thales |
| Thales | Giordano |
| João | Iagor |
| Iagor | Antonio |
| Antonio (refatoração) | João |
| Antonio (camada de serviço) | Iagor |

Um review técnico por pessoa é o mínimo. **"LGTM", "ok" e "aprovado" valem zero** — precisa
apontar um problema concreto, sugerir a correção e ter pelo menos 3 linhas técnicas.

## 7. Como a nota funciona

A ficha do professor Edeilson vale 100 pontos:

| Bloco | Pontos | Como é avaliado |
|---|---|---|
| Presença na apresentação | 10 | Individual. Faltou, perdeu |
| Produto da sprint | 40 | Igual para o time: valor entregue, qualidade técnica, decisões de projeto, release publicada |
| Contribuição individual | 50 | PR relevante (15), code review (10), impacto (15), engajamento (10) |

**Duas travas que derrubam nota mesmo com trabalho feito:**

1. **Sem PR relevante**, o teto individual cai para 14 de 50. Ajuste de comentário, indentação
   e CSS pequeno não contam como PR relevante.
2. **Sem code review registrado**, perde-se os 10 pontos desse bloco.

E **engajamento exige 3 evidências** por pessoa: issue finalizada, tarefa concluída no board,
resposta técnica ao PR de um colega, ou participação registrada em reunião. Reunião só conta se
estiver anotada em `docs/reunioes.md` — quem não registra, não pontua.

Um aviso direto: *"estudante sem contribuição zera a nota do produto"*. Quem não entregar não
perde só os 50 individuais, perde também os 40 do time.

## 8. As regras que não se negociam

1. Nada direto na `main` nem na `develop`. Tudo por branch e PR revisado.
2. **Chave de API, senha ou segredo nunca no código, no commit, na URL ou no log.** Esta é a
   única regra sem conserto: apagar depois não resolve, porque fica no histórico do Git.
3. Toda entrada do usuário é hostil até prova em contrário. Valide no servidor.
4. Em dúvida sobre permissão: negue e pare. Nunca "deixa passar por enquanto".
5. Nada de dado falso no caminho de produção.
6. **A IA nunca entrega a resposta do exercício.** É o produto, não uma preferência.
7. Nenhum dado de aluno cruza a fronteira da turma ou da escola.
8. Usuários são menores de idade: só colete o necessário, e **nunca registre o texto das
   conversas em log**.

## 9. Sobre usar IA para programar

Pode usar, e cada guia traz um prompt base pronto para colar. Mas duas condições:

**Você precisa conseguir explicar o que entregou.** Na apresentação, o professor pergunta para
a pessoa, não para o repositório. Código que ninguém sabe defender é código que ninguém
conserta depois — e vale zero na banca.

**Não aceite a primeira resposta da IA.** Ela vai sugerir biblioteca descontinuada (o
`google-generativeai`, por exemplo, que o Google aposentou), vai liberar CORS para o mundo
inteiro e vai copiar exemplo de CSS da web que não funciona em React Native. Os guias marcam
essas armadilhas uma a uma. Peça um arquivo por vez e entenda cada trecho.

## 10. O que **não** entra nesta sprint

Login, turmas, histórico salvo, resposta aparecendo palavra por palavra, trilha de tópicos,
exercícios e painel do professor.

Não é esquecimento: é corte consciente para caber em 9 dias e entregar algo **estável**.
Declarar o que ficou de fora vale ponto no critério de decisões de projeto — é o que separa
"não deu tempo" de "cortamos de propósito".

## 11. O dia da apresentação (28/09)

- **Todos presentes.** Vale 10 pontos individuais.
- **Cada um apresenta a própria parte**, em cerca de 1 minuto. Quem escreveu, explica.
- Abrimos pelo roteiro dos 8 passos, na ordem.
- O servidor será acordado 5 minutos antes, porque a versão gratuita dorme e leva até 50
  segundos para voltar.
- Teremos um vídeo do roteiro gravado no sábado, como plano B se a internet falhar.

## 12. Onde está cada coisa

| O quê | Onde |
|---|---|
| Seu guia individual | `docs/guias/sprint-2-<seu-nome>.md` e o PDF no grupo |
| Plano completo da sprint | `docs/sprints.md` |
| Decisões, riscos e regras do projeto | `PROJECT-CONTEXT.md` |
| Regras de layout (flexbox) | `docs/layout-flexbox.md` |
| Atas de reunião | `docs/reunioes.md` |
| Suas tarefas | GitHub → Issues → marco **Release 2** |

---

Qualquer dúvida, no grupo. Travar em silêncio por duas horas custa mais caro que perguntar em
cinco minutos — e nesta sprint tem gente esperando o trabalho de outra.
