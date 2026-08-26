# Banco de perguntas de descoberta

Índice:
- [Como usar](#como-usar)
- [Núcleo — vale para qualquer projeto](#núcleo)
- [Trilha: web / frontend](#trilha-web--frontend)
- [Trilha: mobile](#trilha-mobile)
- [Trilha: backend / API](#trilha-backend--api)
- [Trilha: dados, analytics e IA](#trilha-dados-analytics-e-ia)
- [Trilha: CLI, script e automação](#trilha-cli-script-e-automação)
- [Trilha: projeto existente / legado](#trilha-projeto-existente--legado)
- [Perguntas de bug e incidente](#perguntas-de-bug-e-incidente)
- [Da resposta para a decisão](#da-resposta-para-a-decisão)
- [Perguntas que você NÃO deve fazer](#perguntas-que-você-não-deve-fazer)

## Como usar

Não dispare a lista inteira. O fluxo é:

1. Faça a Fase 0 (reconhecimento) e risque tudo que você já descobriu sozinho.
2. Escolha a trilha do projeto e junte com o núcleo.
3. Ordene por **impacto na decisão**: o que muda a arquitetura vem antes do que muda um rótulo de botão.
4. Corte para 5–7 perguntas. O resto vira suposição declarada ou pergunta de rodada 2.
5. Ofereça um padrão em cada pergunta, para o usuário poder responder "usa os padrões" e destravar.

Sinal de que você perguntou demais: o usuário responde "sei lá, você que sabe". Quando isso acontecer, pare de perguntar, assuma os padrões, declare-os e siga.

## Núcleo

**Problema e usuário**
- Quem vai usar isso e o que essa pessoa está tentando fazer?
- Hoje ela resolve como? (Existe planilha, papel, concorrente, gambiarra?)
- O que precisa ser verdade para você dizer "está pronto"?
- Se der tudo certo, o que muda na prática para essa pessoa?

**Escopo**
- O que está explicitamente fora, mesmo que pareça óbvio incluir?
- É protótipo para validar ideia, MVP para usuários reais, ou sistema que vai rodar por anos?
- Qual a menor versão que já teria valor?

**Restrições**
- Alguma tecnologia obrigatória ou proibida? (empresa, faculdade, cliente, o que a equipe sabe)
- Qual o orçamento de infraestrutura por mês? (isso decide arquitetura mais que qualquer preferência)
- Prazo e quem toca o código depois de você?

**Dados e permissões**
- Quais são as entidades principais e como se relacionam?
- Tem dado pessoal, financeiro, de saúde ou de menor de idade? (define nível 4 e obrigações de LGPD)
- Existem papéis diferentes de usuário? O que um jamais pode ver do outro?
- Quanto dado se espera em 6 meses e em 2 anos?

**Operação**
- Onde isso vai rodar e quem faz o deploy?
- Como você fica sabendo que quebrou?
- Precisa de histórico/auditoria de quem fez o quê?

## Trilha: web / frontend

- Quais navegadores e versões mínimas? Precisa funcionar em celular?
- Já existe design, protótipo (Figma) ou design system? Ou eu decido o visual?
- Renderização no servidor importa? (SEO, link compartilhável, primeira carga em rede ruim)
- É público, atrás de login, ou os dois? Quais rotas exigem sessão?
- Precisa de internacionalização, múltiplas moedas ou fusos?
- Tem requisito de acessibilidade formal (WCAG 2.2 AA, licitação, contrato)?
- Onde o estado vive: servidor, cliente, ou ambos com sincronização?
- Formulários longos precisam salvar rascunho automaticamente?

## Trilha: mobile

Ver `trilha-mobile.md` para o detalhamento. Perguntas de abertura:

- iOS, Android ou os dois? Versões mínimas de sistema?
- Nativo, cross-platform ou PWA? Já tem preferência ou eu recomendo com trade-offs?
- Precisa funcionar sem internet? Se sim: só leitura em cache, ou também escrita com sincronização depois?
- Vai usar câmera, GPS, notificação push, biometria, Bluetooth, arquivos?
- Publicação nas lojas está no escopo? Contas de desenvolvedor já existem?
- Tem backend próprio ou consome API de terceiro?

## Trilha: backend / API

- Quem consome: seu próprio front, apps móveis, parceiros externos, ou público?
- Estilo de API: REST, GraphQL, RPC? Já existe convenção na casa?
- Versionamento de contrato: precisa manter compatibilidade com clientes antigos?
- Autenticação: sessão, token, OAuth, chave de API? Quem emite e revoga?
- Volume: requisições por segundo no pico, tamanho de payload, uploads grandes?
- Alguma operação demorada que deveria ser assíncrona (fila, job, webhook)?
- Precisa de idempotência? (pagamento, criação de pedido, reprocessamento)
- Transações que cruzam serviços: o que acontece se a segunda etapa falhar?
- Retenção e backup: por quanto tempo guardar, com que frequência restaurar é testado?

## Trilha: dados, analytics e IA

- De onde vêm os dados, com que frequência atualizam e quem é dono deles?
- Qual a qualidade real? (campos faltando, duplicatas, formatos inconsistentes)
- É análise pontual ou pipeline que roda sozinho? Se roda sozinho, o que fazer quando a fonte falhar?
- Qual pergunta de negócio essa análise responde? (sem isso, o gráfico é decoração)
- Em projetos com modelo: qual o custo de um falso positivo vs. falso negativo? Isso define a métrica.
- Precisa explicar a decisão do modelo para alguém? (regulação, confiança do usuário)
- Usa LLM? Então: prompt injection, dado sensível saindo da organização, custo por chamada, comportamento quando a API cair, e o que acontece quando o modelo alucina.
- Como fica claro para o usuário final que aquilo foi gerado por IA?

## Trilha: CLI, script e automação

- Roda uma vez ou vira rotina agendada?
- Quem executa: só você, a equipe, ou vai para um repositório público?
- Se rodar duas vezes seguidas, pode duplicar efeito? (idempotência)
- Mexe em arquivos, banco ou serviços de produção? Precisa de modo simulação (`--dry-run`)?
- Como reportar progresso e erro: saída legível, código de saída, log em arquivo?
- Onde ficam as credenciais?

## Trilha: projeto existente / legado

- Qual dor concreta motivou mexer nisso agora?
- O que **não pode** quebrar de jeito nenhum?
- Existe teste automatizado? Se não, como se valida hoje que continua funcionando?
- Tem parte do código que todo mundo evita tocar? Por quê?
- Dá para fazer mudança incremental ou exige janela de manutenção?
- Existe documentação de decisões antigas, ou o conhecimento está na cabeça de alguém?
- Alguma dependência sem manutenção ou versão travada por motivo desconhecido?

## Perguntas de bug e incidente

- Qual o comportamento esperado e qual o observado, com um exemplo concreto?
- Passo a passo mínimo para reproduzir. Reproduz sempre ou às vezes?
- Quando começou? O que mudou por perto dessa data (deploy, dependência, dado, config)?
- Acontece em todos os ambientes e para todos os usuários, ou é específico?
- Tem log, stack trace, print, ID de requisição?
- Qual o impacto agora: quantas pessoas, tem contorno temporário, é perda de dado?

Antes de propor correção, **forme uma hipótese e prove**. Corrigir sintoma sem entender causa cria dois bugs: o antigo escondido e o novo.

## Da resposta para a decisão

Cada resposta precisa virar algo concreto. Mapeamento típico:

| Resposta do usuário | O que isso decide |
|---|---|
| "É só para validar a ideia" | Nível 1–2, sem infra elaborada, otimize para descartar depois |
| "Vai ter dado de aluno/paciente/cliente" | Nível 4: criptografia, controle de acesso por linha, retenção, log de auditoria |
| "Precisa funcionar sem internet" | Arquitetura offline-first, fila local, resolução de conflito, feedback de sincronização |
| "A equipe é só eu" | Monolito modular, stack conhecida, automação de deploy simples, nada de microsserviço |
| "Tem que estar pronto semana que vem" | Corte escopo explicitamente agora; registre o que foi adiado |
| "Não sei ainda" | Escolha o caminho mais reversível e registre um ADR com "revisitar quando X" |
| "O sistema atual é lento" | Meça antes de mudar; sem número, otimização é chute |

## Perguntas que você NÃO deve fazer

- Qualquer coisa que esteja no README, no `package.json` ou no código — leia.
- "Que banco você quer usar?" para quem não é técnico. Pergunte sobre necessidade (busca por texto? relatórios? relação entre entidades?) e **você** escolhe.
- Perguntas de implementação disfarçadas de requisito ("prefere useReducer ou Zustand?") — é você que decide e justifica.
- Cinco perguntas para um script de dez linhas.
- Pedir permissão para começar depois de já ter tudo o que precisa. Comece e mostre.
