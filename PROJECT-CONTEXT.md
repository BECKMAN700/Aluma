# Aluma — Contexto do Projeto

> Documento vivo. É a **constituição** do projeto: o que já foi decidido e por quê.
> Antes de abrir qualquer discussão sobre "e se a gente fizesse...", consulte aqui.
> Local sugerido no repositório: raiz, como `PROJECT-CONTEXT.md`.
>
> Versão 0.1 — 25/08/2026 — consolidada a partir do questionário de descoberta.
> Status: **rascunho aguardando confirmação da equipe** nos pontos marcados 🔶.

---

## 1. Problema e usuário

**Dor (aluno):** o aluno não tem um guia que entenda *o que especificamente* ele não entendeu. Muitos também não sabem **o que** estudar nem **como** estudar — e é dessa falta de direção que nasce o desinteresse. As alternativas atuais são o ChatGPT (que a maioria não sabe usar, e que entrega a resposta pronta) ou professor particular (que custa dinheiro).

**Dor (escola):** a escola hoje ou proíbe a IA ou finge que ela não existe. Nos dois casos o aluno usa mesmo assim, sem supervisão, para copiar resposta. A escola não tem controle, não tem visibilidade e não tem dado sobre onde a turma está travando.

**Usuário que paga:** a escola (rede privada) ou a secretaria de educação (rede pública).
**Usuário que usa:** aluno e professor.
**Etapa de ensino:** fundamental primeiro; médio depois.

## 2. Proposta de valor

Para o **aluno**: um tutor que nunca entrega a resposta. Ele mostra o que estudar, como estudar, dá exemplos e obriga o aluno a pensar até chegar sozinho.

Para o **professor**: ele alimenta o conteúdo da matéria, vê o desempenho da turma, recebe da IA o mapa de onde cada aluno travou e dicas do que reforçar em aula.

Para a **escola**: controle sobre a IA que os alunos já usam de qualquer jeito — com uso restrito a fins educacionais, resistência à cola por construção, e conformidade com LGPD para menores.

**A frase do pitch (rascunho a lapidar):** *"Seus alunos já usam IA para copiar resposta. O Aluma é a IA que a escola controla — e que se recusa a dar a resposta."*

## 3. Escopo

### Dentro da V1 🔶 proposta a confirmar

| # | Funcionalidade | Por que entra |
|---|---|---|
| 1 | Login por e-mail institucional, papéis aluno/professor/admin | Sem isso nada mais funciona |
| 2 | Professor cadastra turma, alunos e o conteúdo da matéria | É o que faz a IA falar do conteúdo certo |
| 3 | Trilha do aluno: tópicos com status (não iniciado / em andamento / dominado) | É o "o que estudar" da dor central |
| 4 | Chat de tutoria socrática sobre um tópico | É **o** diferencial. Sem isso não há produto |
| 5 | Exercícios com correção e explicação do erro | É como o sistema descobre onde o aluno travou |
| 6 | Painel do professor: onde a turma está travando | É o que a escola compra |

### Fora da V1 (roadmap, aparecem no pitch como visão)

Gamificação/XP, notificações, relatório para coordenação, painel do responsável, correção de redação, resumos e flashcards, modo offline, chat entre alunos (esse último está fora **permanentemente**).

### Recorte de conteúdo 🔶

Uma disciplina e uma série na V1. Recomendação: **Matemática, 9º ano** — currículo BNCC bem documentado, é onde a tutoria socrática mais brilha, e é fácil demonstrar em vídeo.

## 4. Stack — decidida pela disciplina, não por preferência

A ementa de Desenvolvimento Webmobile (UFT/Palmas, Prof. Jackson Gomes) define o terreno. Não há escolha aqui, e isso é bom: elimina uma decisão.

| Camada | Tecnologia | Origem |
|---|---|---|
| App (web + mobile, mesmo código) | **React Native + Expo** | Exigido pela ementa |
| Linguagem | **TypeScript** | Exigido pela ementa |
| Navegação | Expo Router (navegação universal + deep links) | Ementa, encontro 6 |
| Estado remoto e cache | definido no encontro 13 | Ementa |
| Testes + CI | lint e testes a cada push, GitHub Actions | Ementa, encontros 15–16 |
| API | REST, contrato tipado documentado | Ementa, encontro 9 |
| Backend | 🔶 **pendência** — ver seção 9 | — |
| IA | provedor com camada trocável, começando por camada gratuita | Decisão da equipe |

**Distribuição:** aplicação universal — roda no navegador e no celular a partir do mesmo código. Build instalável via EAS é possível, mas <cite index="13-1">a ementa deixa claro que build em nuvem não é requisito para aprovação quando houver limitação de conta ou plataforma</cite>. Logo: **web primeiro, loja fica para depois.**

## 5. Arquitetura em uma imagem mental

```
[App Expo — aluno]      [App Expo — professor]
        \                        /
         \                      /
          →  API REST (contrato tipado)  ←
                      |
              +-------+-------+
              |               |
         Banco de dados   Serviço de IA
        (escolas, turmas,  (tutoria socrática,
         progresso,         geração e correção
         conversas)         de exercícios)
```

Duas regras que definem tudo:

1. **A chave da API de IA nunca fica no app.** Toda chamada de IA passa pelo servidor. Chave no app = chave pública = conta zerada por terceiros. Isso é inegociável.
2. **O app não decide regra de negócio.** Quem pode ver o quê é decidido no servidor, sempre.

## 6. Decisões fechadas

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
| Modo de trabalho com a IA assistente | **Ensinar, não entregar código pronto** | Escolha da equipe |

## 7. Regras invioláveis

1. Ninguém trabalha direto na `main`. Tudo por branch + PR revisado. (já no README)
2. Chave de API, senha ou segredo **nunca** no código, no commit, na URL ou no log.
3. Toda entrada do usuário é hostil até prova em contrário: valide no servidor.
4. Em erro ou dúvida sobre permissão: **negue e pare**. Nunca "deixa passar por enquanto".
5. Nada de dado falso ou mock no caminho de produção. Seed é isolado e sinalizado.
6. A IA nunca entrega a resposta do exercício. É requisito de produto, não preferência.
7. Nenhum dado de aluno cruza a fronteira da turma/escola.

## 8. Riscos conhecidos

| Risco | Gravidade | Como estamos tratando |
|---|---|---|
| Equipe não domina TypeScript/React ainda | **Alta** | Marcos 1–7 da disciplina não exigem IA nem API. Aproveitar essa janela para aprender construindo |
| Zero validação com escola ou aluno real | **Alta** | Ação urgente — ver seção 10 |
| Sem orçamento para API de IA | Alta | Camada gratuita + cache agressivo + conteúdo pré-gerado para a demo |
| Escopo maior que o prazo | Alta | Corte já aplicado na seção 3. Revisar a cada marco |
| Aluno de fundamental em escola pública pode não ter e-mail institucional | Média | Rever decisão de login se a validação confirmar. Plano B: código de turma |
| Domínio `aluma.com` e `aluma.com.br` indisponíveis | Baixa | Não bloqueia nada agora. Resolver antes de qualquer registro de marca |
| Conteúdo pedagógico sem validação de especialista | Média | Ancorar em BNCC + material do próprio professor da escola. Buscar validação com um licenciado |
| IA alucinar em conteúdo escolar | Média | Restringir ao material do professor, botão de reportar, revisão do professor |

## 9. Pendências

**Para o professor de Desenvolvimento Webmobile:**

1. A API REST que o projeto vai consumir é **fornecida pelo senhor** ou cada equipe constrói a sua? A ementa diz "disponível ou provida para o projeto" e isso muda o plano inteiro.
2. Se a equipe construir: há restrição de linguagem/framework no servidor?
3. Onde a versão web deve ser publicada? Há infraestrutura da UFT ou usamos serviço gratuito?

**Para o professor de Projeto de Sistemas:**

4. Quais artefatos além do Supernova serão cobrados (documento de requisitos, UML, cronograma)?

**Da equipe:**

5. Confirmar o corte de escopo da seção 3.
6. Confirmar a disciplina e série da V1.
7. Enviar a logo provisória.
8. Definir como o consentimento dos pais é coletado na prática.

## 10. Ação urgente — validação

O Supernova avalia validação, e hoje ela é **zero**: nenhuma conversa com aluno, professor ou diretor. Os módulos vão de 28/08 a 08/10 e a entrega do pitch fecha em 22/10. A janela para conseguir evidência é **agora**.

Meta mínima para as próximas duas semanas:
- Formulário respondido por **30+ alunos** do fundamental/médio (dá para rodar em grupo de WhatsApp de escola, primo, vizinho)
- **3 conversas** de 20 minutos com professores
- **1 conversa** com um coordenador ou diretor

Isso é barato, cabe no fim de semana, e é a diferença entre "achamos que" e "perguntamos para 34 pessoas e 71% disseram".

## 11. Equipe

| Nome | Função | GitHub |
|---|---|---|
| João Pedro Beckman | Responsável pelo projeto, decisão final | @BECKMAN700 |
| Giordano Bruno de Moura Fragoso Santos | Desenvolvedor | @GiordanOBru |
| Flávio | Desenvolvedor | @flaviohen16 |
| Gustavo Bringel | Desenvolvedor | @GustavoBringel |
| Iago | Desenvolvedor | @iagorlrnc |
| Thales Rafael | Desenvolvedor | @thalesrafael10 |

Ferramentas: GitHub (código, Issues, PR) + Trello (cronograma).

## 12. Calendário

| Data | Marco |
|---|---|
| 26/08 | Supernova — evento de boas-vindas |
| 28/08 a 08/10 | Supernova — módulos, da ideação ao pitch |
| Encontro 2 da disciplina | Descoberta: problema, personas, backlog, repositório configurado |
| Encontro 7 | MVP navegável com dados locais |
| 09/10 a 22/10 | Supernova — entrega do pitch + Business Model Canvas |
| Encontro 13 | Integração com API real |
| 26/10 a 16/11 | Supernova — avaliação pela banca |
| Encontro 16 | Entrega final: demo, distribuição, documentação, retrospectiva |
| 17/11 a 23/11 | Supernova — resultados |