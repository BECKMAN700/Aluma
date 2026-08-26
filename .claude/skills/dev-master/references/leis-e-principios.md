# Leis e princípios de engenharia de software

Não são curiosidades para citar em reunião. Cada uma descreve um jeito recorrente de projetos darem errado. Use-as como **heurística de decisão** ("qual lei essa escolha está violando?") e como **argumento** quando precisar segurar uma decisão ruim.

Índice:
- [Arquitetura e complexidade](#arquitetura-e-complexidade)
- [Código e design](#código-e-design)
- [Qualidade, testes e manutenção](#qualidade-testes-e-manutenção)
- [Pessoas, times e organização](#pessoas-times-e-organização)
- [Tempo, estimativa e métricas](#tempo-estimativa-e-métricas)
- [Escala e desempenho](#escala-e-desempenho)
- [Aplicando em ordem de decisão](#aplicando-em-ordem-de-decisão)

## Arquitetura e complexidade

**Lei de Gall** — Todo sistema complexo que funciona evoluiu de um sistema simples que funcionava. Sistema complexo projetado do zero nunca funciona e não dá para consertar; tem que recomeçar do simples.
→ *Na prática*: entregue a versão mínima que funciona de ponta a ponta antes de generalizar. Não é preguiça, é a única rota historicamente confiável.

**Lei de Conway** — A estrutura do sistema espelha a estrutura de comunicação de quem o constrói.
→ *Na prática*: uma pessoa sozinha não deveria manter sete serviços independentes. Se o time é você, o sistema deveria ser um monolito bem modularizado. A manobra inversa também vale: quer módulos desacoplados? Defina fronteiras de responsabilidade claras desde o começo.

**Lei de Hyrum** — Com usuários suficientes, todo comportamento observável do seu sistema vira dependência de alguém, esteja no contrato ou não.
→ *Na prática*: ordenação "acidental" de resultado, formato de mensagem de erro, tempo de resposta — tudo isso vira contrato. Documente o que é garantido e versione mudanças no resto.

**Falácias da computação distribuída** — a rede não é confiável, a latência não é zero, a banda não é infinita, a topologia não muda, o transporte não tem custo.
→ *Na prática*: toda chamada que atravessa processo precisa de timeout explícito, retry com backoff e jitter, limite de concorrência, e comportamento definido para falha. "Vai dar certo" não é tratamento de erro.

**Teorema CAP** — sob partição de rede, escolha entre consistência e disponibilidade.
→ *Na prática*: decida conscientemente. Saldo bancário exige consistência. Contador de curtidas não. Escrever essa escolha num ADR evita uma discussão de seis meses depois.

**Lei das abstrações vazadas** — toda abstração não trivial vaza detalhes da camada de baixo.
→ *Na prática*: ORM não isenta de entender SQL. Framework de estado não isenta de entender renderização. Quando algo estranho acontecer, desça uma camada.

**Lei de Tesler (conservação da complexidade)** — toda aplicação tem uma complexidade irredutível: ela só muda de lugar.
→ *Na prática*: simplificar a vida do usuário significa absorver complexidade no código. Escolha conscientemente quem paga: usuário, código, ou operação.

**Efeito do segundo sistema** — a reescrita "definitiva" tende a virar o sistema mais inchado da carreira.
→ *Na prática*: prefira estrangulamento incremental (rotear pedaço por pedaço para o novo) a Big Bang.

## Código e design

**KISS** — a solução mais simples que atende ao requisito real vence.

**DRY, com cuidado** — não repita *conhecimento*. Repetição textual acidental de duas linhas parecidas que evoluem por motivos diferentes é melhor que abstração errada. Abstração prematura custa mais que duplicação.

**YAGNI** — não implemente o que ainda não foi pedido. Cada "e no futuro talvez" é código para manter, testar e depurar hoje.

**SOLID** — em resumo útil: cada módulo tem um motivo para mudar; extensão sem alterar o que já funciona; substituto precisa se comportar como o original; interface enxuta é melhor que interface ampla; dependa de contrato, não de implementação concreta.

**Princípio da menor surpresa** — o código deve fazer o que o nome promete. Função chamada `getUser` não deveria gravar no banco.

**Lei de Postel (robustez)** — seja rigoroso no que envia, tolerante no que aceita. Com uma ressalva moderna: tolerância excessiva na entrada esconde bug do produtor e vira problema de segurança. Aceite variações inofensivas de formato, **nunca** valores inválidos.

**Lei de Kernighan** — depurar é duas vezes mais difícil que escrever. Se você escreveu no limite da sua capacidade, não vai conseguir depurar.
→ *Na prática*: escreva mais simples do que consegue. Deixe folga cognitiva para o dia em que quebrar às 23h.

**Regra do escoteiro** — deixe o código um pouco melhor do que encontrou. Sem transformar em reescrita não solicitada.

**Teoria das janelas quebradas** — um `TODO` ignorado, um teste desativado, um aviso do lint tolerado: a degradação acelera sozinha. Ou conserta, ou registra explicitamente como dívida com prazo.

**Dívida técnica** — atalho consciente com juros. Aceitável quando é decisão registrada e com data de pagamento. Inaceitável quando é só bagunça sem nome.

## Qualidade, testes e manutenção

**Pirâmide de testes** — muitos testes unitários rápidos, alguns de integração, poucos de ponta a ponta. Invertido (só E2E), a suíte fica lenta, instável e ninguém confia.

**Regra da Beyoncé** — "se você gostava, devia ter colocado um teste". Se um comportamento importa, ele precisa quebrar o build quando sumir.

**Paradoxo do pesticida** — repetir os mesmos testes para sempre deixa de encontrar bugs novos. Revise a suíte quando o sistema mudar de forma.

**Lei de Linus** — com olhos suficientes, todo bug é raso. Revisão de código e teste com usuário real encontram o que você não enxerga sozinho.

**Lei de Murphy** — o que pode dar errado, vai. Teste o caminho triste: rede caindo no meio, entrada malformada, disco cheio, duas requisições simultâneas, relógio errado, terceiro devolvendo HTML no lugar de JSON.

**Leis de Lehman** — software em uso muda continuamente e sua complexidade cresce, a menos que se trabalhe ativamente para reduzi-la.
→ *Na prática*: reserve capacidade recorrente para manutenção. Projeto sem tempo de manutenção apodrece por definição.

## Pessoas, times e organização

**Lei de Brooks** — adicionar gente a projeto atrasado atrasa mais.

**Efeito Ringelmann / regra das duas pizzas** — produtividade individual cai conforme o grupo cresce. Times pequenos e autônomos entregam mais.

**Fator ônibus** — quantas pessoas precisam sumir para o projeto travar? Se a resposta é 1, documentação e revisão cruzada deixam de ser luxo.

**Princípio de Peter / Efeito Dunning-Kruger** — confiança e competência não andam juntas. Vale para você também: quando tiver muita certeza sobre algo que não verificou, verifique.

**Lei de Cunningham** — a maneira mais rápida de obter a resposta certa é apresentar uma resposta errada. Traduzido para o trabalho: mostre um rascunho concreto cedo, é mais eficaz que pedir requisitos no abstrato.

## Tempo, estimativa e métricas

**Lei de Hofstadter** — sempre demora mais do que você espera, mesmo levando em conta a Lei de Hofstadter.

**Lei de Parkinson** — o trabalho se expande para ocupar o tempo disponível. Prazo ajuda; prazo fantasioso destrói.

**Regra 90-90** — os primeiros 90% do código consomem 90% do tempo; os 10% restantes consomem os outros 90%. Integração, casos de borda e polimento são metade do trabalho, não sobras.

**Lei de Goodhart** — quando uma métrica vira meta, deixa de ser boa métrica. Meça cobertura de teste e alguém escreve teste que não testa nada.

**Lei de Gilb** — qualquer coisa que você precise quantificar pode ser medida de um jeito melhor do que não medir.

**Métricas DORA** — frequência de entrega, tempo de mudança, taxa de falha em mudança, tempo de recuperação e taxa de retrabalho. Servem para diagnóstico do sistema de entrega, não para ranquear pessoas.

**Modelo de capacidades de IA (DORA 2025)** — sete capacidades determinam se IA ajuda ou piora: postura clara sobre IA, ecossistema de dados saudável, dados internos acessíveis à IA, versionamento forte, trabalho em lotes pequenos, foco no usuário e plataforma interna de qualidade. A conclusão central: **IA é amplificador** — melhora time bom e piora time bagunçado. Sem foco no usuário, adoção de IA correlaciona com perda de desempenho: entrega-se mais rápido a coisa errada.

## Escala e desempenho

**Otimização prematura (Knuth)** — otimizar sem medir é chute. Meça, ache o gargalo real, otimize ali, meça de novo.

**Lei de Amdahl** — o ganho de paralelizar é limitado pela parte que não paraleliza. Não adianta oito núcleos se 70% do trabalho é sequencial.

**Lei de Little** — itens no sistema = taxa de chegada × tempo médio no sistema. Serve para fila, thread pool e também para trabalho em andamento no time: reduzir WIP reduz tempo de entrega.

**Princípio de Pareto** — 20% do código causa 80% dos problemas. Encontre esses 20% (arquivos que mais mudam, que mais aparecem em bug) e trate com carinho.

## Aplicando em ordem de decisão

Sequência de perguntas que evita a maioria dos erros graves:

1. Isso resolve o problema **real** do usuário? (foco no usuário; sem isso, velocidade é dano)
2. É a versão mais simples que funciona? (Gall, KISS, YAGNI)
3. O que acontece quando falha? (Murphy, falácias distribuídas, falhar fechado)
4. Quem pode acessar o quê, e como isso é imposto? (OWASP A01, menor privilégio)
5. Como eu **sei** que funciona — e como saberei que quebrou? (Beyoncé, observabilidade)
6. Dá para reverter? (lotes pequenos, versionamento forte)
7. A próxima pessoa vai entender por que está assim? (Kernighan, ADR, fator ônibus)
