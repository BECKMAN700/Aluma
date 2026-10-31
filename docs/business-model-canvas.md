# Aluma — Business Model Canvas

> Versão enviada ao Sebrae Supernova em 20/10/2026, nos cards da plataforma (título + conteúdo).
> Responsáveis por bloco e contexto da entrega em [`sebrae-supernova.md`](sebrae-supernova.md).
> O que é **hipótese** ainda não foi validado com escola, professor ou aluno.

## 1. Segmentos de clientes

### Quem paga

* Escolas particulares do ensino fundamental, começando por Palmas/TO como piloto (hipótese).
* Fase seguinte: secretarias de educação.

### Quem usa

* **Alunos** do 6º ao 9º ano, em qualquer disciplina. O piloto é Matemática, 9º ano.
* **Professores** de todas as disciplinas.

---

## 2. Proposta de valor

* Tutor que **nunca entrega a resposta**: guia com perguntas e pistas até o aluno chegar sozinho
  na solução.
* A recusa em dar a resposta é também a defesa anti-cola.
* A escola controla a IA, restrita a fins educacionais.
* Privacidade do aluno: o professor vai ver um **resumo** de onde a turma trava, sem ler a
  conversa (próxima etapa; o painel ainda não existe).
* Problema: só 16,5% dos alunos do 9º ano têm aprendizado adequado em Matemática (Saeb 2023).
  O card enviado arredondou para 16%.

---

## 3. Canais

* Venda direta a escolas e apresentação a professores e coordenadores.
* O aluno entra na turma por código e usa pelo navegador (web primeiro), no celular ou no
  computador, sem instalar nada. Pode virar app nas lojas depois.

---

## 4. Relacionamento com clientes

* **Aluno:** self-service com o tutor.
* **Professor:** cria a turma e acompanha.
* **Escola:** contato direto, contrato anual e suporte.
* **Engajamento (futuro):** gamificação com progresso por tópico dominado. Premia o raciocínio,
  não a velocidade.

---

## 5. Fontes de receita

| Título | Conteúdo |
|---|---|
| Licença anual por escola | Cobrada por aluno ativo, alinhada ao ciclo anual de compra das escolas |
| Preço (hipótese) | **R$ 10 por aluno/mês (R$ 120/ano)**, com limite de uso. A validar com coordenadores |
| Margem | No uso médio, a IA custa cerca de R$ 4,40 por aluno/mês, sobrando cerca de 56% |
| Referência de mercado | Khanmigo cobra US$ 15 por aluno de escolas (fonte a confirmar). Auvien e Geekie não publicam preço |
| Fase 2 | Contratos com secretarias de educação |

---

## 6. Recursos principais

* Equipe da UFT.
* IA: Claude Haiku 4.5 (principal), com Google Gemini de reserva.
* App React Native + Expo; backend Python (FastAPI).
* Supabase (banco e login), Render (servidor), Netlify (web).

---

## 7. Atividades-chave

* Desenvolver o app e a API.
* Calibrar o tutor para guiar sem entregar a resposta.
* Testar o tutor contra pedidos de resposta pronta ([`bateria-anti-cola.md`](bateria-anti-cola.md)).
* Validar com alunos, professores e gestores.

---

## 8. Parcerias principais

* Escolas e professores para o piloto (a confirmar).
* UFT (apoio acadêmico).
* Anthropic e Google (IA).
* Supabase, Render e Netlify.

O Sebrae Supernova saiu das parcerias: é o programa, não um parceiro do negócio.

---

## 9. Estrutura de custos

Versão final a partir da análise do Giordano.

| Título | Conteúdo |
|---|---|
| Custo de IA | Claude Haiku 4.5: US$ 1 por milhão de tokens de entrada e US$ 5 de saída. Estimativa: R$ 2 a 9 por aluno/mês, conforme o uso (câmbio R$ 5,5) |
| Economia com cache | O prompt socrático se repete; a entrada reaproveitada custa 90% menos. A estimativa é um teto |
| Infraestrutura | R$ 0/mês na V1 (planos gratuitos). Ao escalar, custo fixo baixo dividido entre as escolas |
| Equipe e suporte | Maior custo no início |
| Conformidade | Adequação ao ECA Digital e à LGPD antes do uso com alunos reais |

**Premissa não medida:** 25 mil tokens por conversa. Conferir no painel de uso da Anthropic com
conversas reais antes de defender a margem.

Na fase de apresentação, o gasto real com IA continua limitado ao crédito pré-pago de US$ 3/mês
(ver [`PROJECT-CONTEXT.md`](../PROJECT-CONTEXT.md) §4).
