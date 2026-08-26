# Qualidade, segurança e operação

Índice:
- [Estratégia de testes](#estratégia-de-testes)
- [Segurança — OWASP Top 10 2025](#segurança--owasp-top-10-2025)
- [Segurança de IA e LLM](#segurança-de-ia-e-llm)
- [Privacidade e LGPD](#privacidade-e-lgpd)
- [Desempenho](#desempenho)
- [Acessibilidade](#acessibilidade)
- [Observabilidade e operação](#observabilidade-e-operação)
- [CI/CD e versionamento](#cicd-e-versionamento)
- [Checklist de revisão de código](#checklist-de-revisão-de-código)
- [Definição de Pronto](#definição-de-pronto)

## Estratégia de testes

Teste existe para você poder mudar o código sem medo. Suíte lenta e instável não é rede de segurança: é imposto.

**Distribuição saudável**
- **Unitário** (maioria): lógica pura, regras de negócio, casos de borda. Milissegundos, sem rede, sem banco.
- **Integração** (alguns): fronteiras reais — repositório com banco de teste, cliente HTTP com servidor falso, migração aplicada de verdade.
- **Ponta a ponta** (poucos): os 3–7 fluxos que, se quebrarem, o produto está fora do ar.

**O que sempre merece teste**
- Toda regra de negócio com condicional (cálculo, desconto, permissão, limite)
- Todo `Se… então…` da spec (caminho triste)
- Todo bug corrigido: teste que falha antes da correção e passa depois — é assim que ele não volta
- Fronteiras: vazio, um, muitos, nulo, negativo, zero, string enorme, unicode/acentos, fuso horário, ano bissexto

**Qualidades de um bom teste**
- Nome descreve o comportamento: `deve_recusar_pedido_quando_estoque_insuficiente`
- Arranjar → agir → verificar, visíveis
- Independente de ordem e de execuções anteriores
- Determinístico: sem rede real, sem `sleep`, sem `now()` sem controle, sem aleatoriedade sem semente
- Verifica comportamento observável, não detalhe interno
- Falha com mensagem que diz o que aconteceu

**Armadilhas**: teste que só verifica o mock; cobertura como meta (Goodhart); teste gigante que testa dez coisas; suíte com testes desativados "temporariamente" há meses.

## Segurança — OWASP Top 10 2025

A lista de 2025 reorganizou as categorias em torno de causas raiz. Revise cada entrega contra ela.

**A01 — Falha de controle de acesso** (segue em 1º; agora inclui SSRF)
Autorização no servidor, sempre — nunca só escondendo botão. Verifique dono do recurso em toda leitura e escrita (IDOR é o campeão de vazamento). Negue por padrão. Cuidado com CORS permissivo e com endpoints administrativos sem checagem.

**A02 — Configuração insegura** (subiu de 5º para 2º)
Sem credencial padrão, sem debug em produção, sem stack trace exposto, cabeçalhos de segurança presentes, buckets e permissões de nuvem fechados, superfície mínima habilitada.

**A03 — Falhas na cadeia de suprimentos** (nova)
Dependências fixadas com lockfile, varredura automática de vulnerabilidade, avaliação antes de adotar pacote novo (quem mantém? última publicação? quantos downloads? nome parecido com outro popular = possível typosquatting). Pipeline de build também é superfície de ataque.

**A04 — Falhas criptográficas**
TLS em tudo, algoritmos atuais, senha com hash lento (bcrypt/argon2) e salt, chaves fora do código e rotacionáveis, dado sensível cifrado em repouso.

**A05 — Injeção** (inclui XSS)
Consulta parametrizada sempre — concatenar string com entrada do usuário é proibido. Escape no contexto de saída (HTML, atributo, URL, shell). Validação por lista de permitidos. Cuidado com NoSQL, LDAP, template e comando de sistema.

**A06 — Design inseguro**
Falhas que nenhum patch conserta porque nasceram no desenho: fluxo de recuperação de senha frágil, ausência de limite de tentativa, regra de negócio que permite valor negativo, "confiar no cliente".

**A07 — Falhas de autenticação**
Limite de tentativas, MFA quando o dado justifica, sessão que expira e é invalidada no logout, sem enumeração de conta ("e-mail ou senha inválidos", não "e-mail não existe"), token com escopo e validade curtos.

**A08 — Falhas de integridade de software e dados**
Não desserialize dado não confiável. Verifique integridade de artefatos e atualizações. Pipeline de CI com permissão mínima.

**A09 — Falhas de log e alerta**
Registre autenticação, mudança de permissão, acesso a dado sensível e falha de autorização. Nunca registre senha, token ou dado pessoal em texto claro. Log sem alerta é arquivo morto.

**A10 — Tratamento inadequado de condições excepcionais** (nova)
A categoria que vira comprometimento total: sistema que **falha aberto** quando a verificação dá erro; exceção não tratada deixando estado inconsistente; erro que vaza detalhe interno; esgotamento de recurso em caso de borda. **Em erro, negue e pare.**

## Segurança de IA e LLM

Se o projeto usa modelo de linguagem, some ao checklist:

- **Injeção de prompt**: conteúdo que vem de site, arquivo, e-mail ou banco é **dado, não instrução**. Nunca execute ação com efeito colateral porque um texto recuperado mandou.
- **Agência excessiva**: dê ao agente o menor conjunto de ferramentas e permissões possível. Ação destrutiva ou financeira passa por confirmação humana.
- **Vazamento de dado**: o que sai da organização no prompt? Anonimize ou não envie.
- **Saída não confiável**: trate texto gerado como entrada não confiável antes de renderizar ou executar.
- **Custo e falha**: limite de taxa, timeout, orçamento, e comportamento definido quando a API cair.
- **Transparência**: deixe claro ao usuário o que foi gerado por IA e permita corrigir.

## Privacidade e LGPD

- Colete o mínimo necessário para a finalidade declarada.
- Base legal definida e finalidade explícita ao usuário.
- Direitos do titular viáveis tecnicamente: acesso, correção, exclusão, portabilidade.
- Retenção com prazo — dado sem prazo de descarte é passivo.
- Dado de criança e adolescente exige cuidado reforçado e consentimento de responsável.
- Log e telemetria também contêm dado pessoal. Anonimize e defina retenção.

## Desempenho

**Meça antes de otimizar.** Sem número, é chute (Knuth).

Defina orçamento no começo, não depois da reclamação:

| Contexto | Meta de partida |
|---|---|
| API | p95 abaixo de 300 ms no caminho crítico |
| Web — primeira interação | LCP até 2,5 s; INP até 200 ms; CLS até 0,1 |
| Mobile — abertura a frio | até 2,5 s no p90; resposta ao toque abaixo de 100 ms |
| Consulta de banco | sem N+1; índice cobrindo os filtros mais usados |

Ajuste conforme o contexto real (rede 3G, dispositivo popular no Brasil, base de dados grande) — e meça no cenário ruim, não no seu notebook com fibra.

Erros mais comuns e mais caros: consulta em laço (N+1); carregar coleção inteira em memória; falta de paginação; imagem sem otimização nem tamanho responsivo; ausência de cache no que é caro e estável; trabalho síncrono que deveria ser fila.

## Acessibilidade

Não é enfeite: é requisito contratual em muitos mercados e é o que decide se parte dos seus usuários consegue usar o produto.

- Estrutura semântica e hierarquia de títulos correta
- Tudo alcançável por teclado, com foco visível e ordem lógica
- Rótulo em todo controle de formulário; erro associado ao campo e anunciado
- Contraste mínimo de 4,5:1 para texto normal
- Alvo de toque de pelo menos 44×44 pt (iOS) / 48×48 dp (Android)
- Texto redimensionável sem quebrar o layout; respeitar fonte grande do sistema
- Alternativa textual em imagem informativa; imagem decorativa marcada como tal
- Não comunicar informação só por cor
- Respeitar preferência de movimento reduzido
- Teste real: navegue a tela inteira só com teclado, e passe um leitor de tela em um fluxo completo

## Observabilidade e operação

**Log**: estruturado (chave-valor), com identificador de correlação por requisição, nos pontos de decisão e de falha. Nível certo: `error` para o que exige ação, `warn` para o que é anormal mas tratado, `info` para marcos de negócio. Sem segredo, sem dado pessoal em claro.

**Erro**: mensagem útil para o usuário ("não conseguimos processar o pagamento, seu carrinho foi mantido") e contexto suficiente no log para diagnosticar **sem reproduzir**.

**Métrica**: taxa de erro, latência, saturação de recurso, e uma métrica de negócio que prove que o produto está sendo usado.

**Saúde**: endpoint de health que verifique dependências críticas de verdade.

**Reversibilidade**: todo deploy tem caminho de volta; toda migração destrutiva é feita em duas etapas (adicionar e escrever nos dois; depois remover); backup restaurado periodicamente — backup nunca testado não é backup.

## CI/CD e versionamento

- Branch curta, integrada com frequência. Branch de duas semanas é conflito garantido.
- Commit pequeno e atômico; mensagem no imperativo explicando o **porquê**.
- Pipeline roda: build → lint → testes → varredura de dependência e segredo. Falhou, não entra.
- Nada de segredo no repositório. `.env.example` documenta as chaves, sem valores.
- Tag e changelog para versões publicadas.
- Mudança arriscada atrás de feature flag, com desligamento sem novo deploy.

## Checklist de revisão de código

**Correção** — faz o que o requisito pede? Casos de borda? Concorrência? Falha parcial?
**Segurança** — entrada validada? Autorização no servidor? Consulta parametrizada? Segredo fora do código? Erro sem vazar detalhe?
**Clareza** — dá para entender sem explicação verbal? Nomes revelam intenção? Complexidade acidental?
**Consistência** — segue as convenções deste repositório? Reaproveita o que já existe?
**Testes** — cobre o requisito e o caminho triste? Falharia se a lógica quebrasse?
**Operação** — dá para diagnosticar em produção? É reversível?
**Escopo** — o diff contém só o que foi pedido?

## Definição de Pronto

Só diga "pronto" quando:

- [ ] Todo requisito da spec tem implementação e teste amarrados ao número
- [ ] Build, lint e testes rodaram **de verdade** e passaram (ou foi dito explicitamente que não puderam ser executados)
- [ ] Caminhos de erro tratados, falhando fechado
- [ ] Revisão de segurança feita contra as categorias aplicáveis do OWASP
- [ ] Sem segredo, dado falso ou `console.log` de depuração no código
- [ ] Documentação atualizada: README, variáveis de ambiente, ADR se houve decisão estrutural
- [ ] O usuário sabe: como rodar, quais suposições foram feitas, **o que não foi testado** e qual o próximo passo
