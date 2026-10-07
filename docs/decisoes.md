# Aluma — Histórico de decisões

> O **porquê** de cada decisão, com data e contexto. O [`PROJECT-CONTEXT.md`](../PROJECT-CONTEXT.md)
> §6 guarda só o que vale hoje, em uma linha; aqui fica a história completa. Decisão nova entra
> no topo.

## 07/10/2026 — o Aluma vira plataforma com login, turma e material

Contexto: a Release 2 entregou um chat aberto, sem conta, sem turma e sem professor. O pitch
fala em "a IA que a escola controla" e o produto não mostrava escola nenhuma. O João decidiu
levar o projeto ao modelo do Google Classroom, mantendo custo zero.

| Decisão | Escolha | Por quê | Custo aceito |
|---|---|---|---|
| Banco, login e arquivos | **Supabase**, plano gratuito | Um serviço só entrega Postgres, login por e-mail e arquivos. A senha nunca passa pelo nosso código. A alternativa era escrever cadastro e sessão no FastAPI: mais código para defender, mais lugar para errar em segurança | Depender de terceiro; o plano gratuito pausa após 7 dias sem uso |
| Por onde passam os dados | Tudo pelo **FastAPI**; o app usa o Supabase só para login | Uma porta só: a regra de quem vê o quê fica em um arquivo, testável. A alternativa (app lendo o banco direto, com regras no Supabase) dá menos código, mas espalha a regra de acesso em dois lugares | Mais rotas para escrever |
| Tranca no banco | RLS ligado em todas as tabelas, sem política | A chave pública do Supabase vai dentro do app; sem isso qualquer pessoa leria o banco com ela | Nenhum |
| Quem vira professor | Conta criada **pela equipe**, por script de administração. Cadastro pelo app é sempre aluno | A ideia inicial era convite por e-mail. Sem e-mail de confirmação, qualquer pessoa criaria conta com o e-mail de um professor convidado e viraria professor | A equipe cadastra cada professor na mão |
| Escola | Cadastrada pela equipe | Combina com vender licença por escola e impede escola falsa | Idem |
| Como o aluno entra na turma | **Código da turma**, como no Google Classroom | Funciona para várias escolas sem cadastrar aluno por aluno | Código vazado deixa entrar quem não é da turma; o professor vê a lista de alunos |
| E-mail de confirmação e "esqueci a senha" | **Desligados** | O envio gratuito do Supabase manda 2 a 3 e-mails por hora e só para e-mails da própria equipe. Ligar exige domínio próprio | Conta com e-mail digitado errado não se recupera |
| Material do professor | **PDF ligado a um tópico**; o servidor extrai o texto e só o texto daquele tópico vai para a IA | Simples e cabe no teto de US$ 3/mês. A busca por similaridade em todos os arquivos é mais uma peça para manter e custa mais por mensagem | Material limitado em tamanho; PDF escaneado não funciona |
| Limite de requisições | Por **usuário**, não por IP | Uma turma inteira no Wi-Fi da escola sai por um IP só e se bloquearia | Nenhum |
| Streaming | **Cortado** | A resposta tem de 3 a 5 linhas e chega em 1 a 2 segundos; consumir resposta aos poucos no React Native é a parte mais arriscada | A resposta aparece de uma vez |
| LGPD e usuários menores | **Suspensa na fase de apresentação** | O projeto é uma demonstração acadêmica com contas fictícias; as exigências estavam travando o planejamento. Consentimento dos pais e exclusão de dados saem do plano | Tudo isso precisa voltar antes de qualquer uso com aluno real |
| Organização do repositório | Backend por assunto (`nucleo/`, `chat/`, `turmas/`), mesmo formato em toda pasta; documentos divididos; código sem uso apagado | Gente e IA leem só a pasta da tarefa, em vez do projeto inteiro | Um PR de reorganização antes de a sprint começar |
| Ordem das entregas | Sprint 3: login e turma. Sprint 4: matéria e material. Refinamento: painel do professor | Tudo depende de saber quem é a pessoa e de qual turma ela é | A trilha, que estava proposta para a Sprint 3, atrasa uma sprint |

## Até 28/09/2026 — decisões anteriores

Tabela original da §6 do `PROJECT-CONTEXT.md`, preservada como estava.


| Decisão | Escolha | Por quê |
|---|---|---|
| Tutoria | **Nunca entrega a resposta pronta.** Guia, exemplifica, pergunta de volta | É o diferencial e é a defesa anti-cola. As duas coisas são o mesmo mecanismo |
| Escopo de assunto | Só assunto educacional; fora disso, recusa | Requisito para a escola aceitar |
| Login do aluno | E-mail institucional da escola. Professor coloca o aluno na turma | Escolha da equipe |
| Turmas | Aluno pertence a **uma** turma; professor tem **várias** | Escolha da equipe |
| Visibilidade do professor | Vê **resumo** do desempenho, não a conversa crua | Privacidade do adolescente |
| Isolamento | Professor **jamais** vê aluno de outra turma ou de outra escola | Regra de segurança inviolável |
| Histórico | Guardado até o aluno mudar de turma no ano seguinte. Aluno **não** apaga | Escolha da equipe |
| Coleta de dados | Só o estritamente necessário. Sem CPF, sem foto | LGPD + princípio de minimização |
| Consentimento | Dos pais 🔶 mecanismo a definir | LGPD, menores de idade |
| Auditoria | Log simples em ações sensíveis | Padrão aceito |
| Falha da IA | Erro explícito e claro + conteúdo estático de reserva. Nunca inventar | Padrão aceito |
| Offline | Fora da V1 | Custa caro e arrisca o prazo |
| Recursos do aparelho | Nenhum na V1 (sem câmera, microfone, push) | Escopo |
| Acessibilidade | Básico: teclado, contraste, rótulo para leitor de tela | Padrão aceito |
| Peso do app | O mais leve possível; precisa abrir em 3G e celular fraco | Realidade do público |
| Infra | R$ 0/mês, só camada gratuita | Sem orçamento |
| Domínio | Subdomínio grátis na demo | Sem orçamento |
| Interface | Duas linguagens visuais: sóbria para professor, viva para o aluno | Escolha da equipe |
| Modelo de receita | Licença por escola por ano | Ciclo de compra da escola é anual |
| Métrica de sucesso | Aluno ativo por semana | Padrão aceito |
| Monitoramento | Log estruturado + Sentry (plano gratuito) | Padrão aceito |
| Dados de demonstração | Script de seed com turma fictícia, isolado do caminho de produção | Demo não pode ficar vazia |
| Divisão do trabalho | Fatias verticais por funcionalidade, não por camada | Ninguém fica bloqueado esperando o outro |
| Decisão final | João Pedro Beckman | Confirmado |
| Modo de trabalho com a IA assistente | **A IA implementa a solução inteira, em nível sênior, e explica o porquê; quem commita precisa saber explicar o código** | Decisão do João (15/09/2026): a Release 1 foi recusada por não ser funcional e o prazo é curto. A explicação continua obrigatória porque a banca pergunta |
| Backend | **Python + FastAPI**, em `backend/` no mesmo repositório (monorepo) | A equipe constrói o próprio, sem esperar resposta do professor (ADR da equipe, 12/09/2026) |
| Hospedagem do backend | **Render**, Web Service gratuito, deploy direto do GitHub | Único com free tier permanente e sem cartão em 2026. Custo: cold start de 30-50s após ~15 min de inatividade — aceitável para uso acadêmico |
| Hospedagem do app web | **Netlify**, plano gratuito, build `npx expo export -p web` direto do GitHub (`netlify.toml`). Produção publica a `main`; a `develop` e cada PR ganham link de teste próprio | Plano gratuito em créditos (300/mês): só o deploy de produção gasta (15 cada). Previews e o link da `develop` são grátis. Se os créditos acabarem, o site sai do ar até o mês virar. Decidido em 27/09/2026 |
| Provedor de IA principal | **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`), via SDK `anthropic` (Python) | Trocado em 28/09/2026, dia da apresentação da Sprint 2: o Gemini gratuito respondeu 503 (Google sobrecarregado) em ondas por horas, e o app mostrou "tutor indisponivel" até pelo link oficial. Custo: crédito pré-pago no console.anthropic.com, cobrado à parte do plano Pro do João; workspace `Aluma` com limite de US$3/mês (teto de R$20 decidido pelo João) e recarga automática desligada. Esgotou, a Anthropic recusa e o Gemini assume, sem cobrança extra. A API da Anthropic não usa os dados para treinar modelos. Versão fixa pelo mesmo motivo do Gemini: a bateria anti-cola não muda de alvo sozinha |
| Provedor de IA de reserva | **Google Gemini** (`gemini-3.5-flash-lite`), via `google-genai` (Python), com streaming | Tier gratuito permanente (não é trial), ~1.500 req/dia, sem cartão. Modelo trocado em 21/09/2026: a linha 2.5 foi descontinuada para contas novas (404 ao chamar, inclusive no `flash-lite`), e o `gemini-3.6-flash` indicado pelo próprio Google como substituto respondeu em 41s e depois falhou por alta demanda — o `3.5-flash-lite` responde a mesma pergunta do roteiro em 2,3s. Versão fixa em vez do alias `gemini-flash-lite-latest` para a bateria anti-cola não mudar de alvo sozinha. Custo: no tier gratuito, os prompts podem ser usados pela Google para treinar modelos — ver risco de LGPD na §8 |
| Camada de abstração para IA (LangChain) | **Não usar por ora** (YAGNI) | Reavaliar só se o projeto passar a precisar de RAG sobre o material da disciplina |
| Protocolo de streaming | Backend implementa o **Data Stream Protocol do AI SDK** | Permite o app (Expo/React Native) consumir a resposta token a token sem depender das bibliotecas JS do AI SDK |

