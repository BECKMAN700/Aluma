# Aluma — Business Model Canvas

## 1. Segmentos de clientes

### Quem paga

* Escolas da rede privada.
* Secretarias de educação da rede pública.

### Quem usa

* **Alunos:** utilizam o Aluma como tutor educacional para estudar, praticar e identificar suas dificuldades.
* **Professores:** cadastram turmas e conteúdos, acompanham o desempenho dos alunos e identificam os pontos em que a turma está tendo dificuldades.

### Etapa de ensino

* **V1:** Ensino Fundamental.
* **Visão futura:** Ensino Médio.

### Recorte inicial da V1

* Uma disciplina e uma série.
* Recomendação atual: **Matemática — 9º ano**.

---

## 2. Proposta de valor

### Para o aluno

* Tutor educacional que **nunca entrega a resposta pronta**.
* Orientação sobre o que estudar e como estudar.
* Exemplos e perguntas que estimulam o aluno a chegar à resposta por conta própria.
* Exercícios com correção e explicação dos erros.
* Trilha de estudos para acompanhar o progresso nos tópicos.

### Para o professor

* Cadastro de turmas, alunos e conteúdos da matéria.
* Acompanhamento do desempenho da turma.
* Visualização dos pontos em que os alunos estão tendo dificuldades.
* Apoio da IA para identificar onde cada aluno travou e indicar pontos que podem ser reforçados em aula.

### Para a escola

* Uso controlado da IA para fins educacionais.
* Redução da utilização da IA como ferramenta de cola.
* Visibilidade sobre o desempenho e as dificuldades das turmas.
* Tratamento de dados orientado aos requisitos da LGPD para menores.

---

## 3. Canais

* Escola.
* Professores.
* Alunos por meio da instituição de ensino.
* Aplicação web acessível pelo navegador.
* Aplicação mobile planejada a partir da mesma base tecnológica.

### Estratégia inicial

A aplicação será **web primeiro**, deixando a publicação em lojas de aplicativos para uma etapa posterior.

---

## 4. Relacionamento com clientes

### Escolas e secretarias de educação

* Relacionamento institucional.
* Oferta de uma ferramenta de IA voltada exclusivamente para fins educacionais.
* Acompanhamento do uso e desempenho por meio dos recursos disponíveis para professores e administradores.

### Professores

* Professor alimenta o sistema com turmas, alunos e conteúdos.
* Painel para acompanhamento do desempenho da turma.
* Informações sobre pontos de dificuldade para auxiliar o planejamento das aulas.

### Alunos

* Acesso por e-mail institucional da escola.
* Tutor socrático que conduz o aluno durante o aprendizado.
* Trilha de estudos e exercícios para acompanhamento da evolução.
* A IA não fornece respostas prontas aos exercícios.

---

## 5. Fontes de receita

* **Licença por escola por ano.**

O modelo de receita segue o ciclo de compra anual das escolas.

> **Valor da licença: a validar.**

Não há, neste momento, valor financeiro definido no `PROJECT-CONTEXT.md`. Portanto, nenhum preço é estabelecido neste Canvas.

---

## 6. Recursos principais

### Recursos tecnológicos

* Aplicação web e mobile.
* React Native + Expo.
* TypeScript.
* API REST.
* Backend em Python + FastAPI.
* Banco de dados.
* Serviço de IA baseado no Google Gemini 3.5 Flash Lite.
* Hospedagem do backend no Render.
* GitHub para código, Issues e Pull Requests.
* Sentry para monitoramento.

### Recursos de produto

* Conteúdo educacional cadastrado pelo professor.
* Trilha de estudos.
* Tutoria socrática.
* Exercícios com correção e explicação.
* Painel de desempenho do professor.
* Dados de progresso dos alunos.

### Recursos humanos

* Equipe responsável pelo desenvolvimento do produto, documentação e demais artefatos do projeto.

---

## 7. Atividades-chave

* Desenvolvimento e manutenção da aplicação.
* Desenvolvimento e manutenção da API e backend.
* Integração e gerenciamento do serviço de IA.
* Desenvolvimento da tutoria socrática.
* Cadastro e organização dos conteúdos educacionais.
* Desenvolvimento dos exercícios e mecanismos de correção.
* Desenvolvimento do painel de acompanhamento do professor.
* Implementação de autenticação, permissões e isolamento entre turmas e escolas.
* Proteção e tratamento adequado dos dados dos alunos.
* Testes e integração contínua.
* Monitoramento da aplicação.
* Validação do produto com alunos, professores e profissionais da área educacional.
* Evolução do produto conforme os resultados da validação.

### Atividades prioritárias da V1

1. Login por e-mail institucional e definição dos papéis de usuário.
2. Cadastro de turmas, alunos e conteúdo pelo professor.
3. Trilha de estudos do aluno.
4. Chat de tutoria socrática.
5. Exercícios com correção e explicação.
6. Painel do professor com os pontos em que a turma está tendo dificuldades.

---

## 8. Parcerias principais

* **Sebrae Supernova:** contexto de validação e desenvolvimento do projeto como startup/produto.
* **Universidade Federal do Tocantins (UFT):** contexto acadêmico das disciplinas relacionadas ao desenvolvimento do projeto.
* **Professores e profissionais da área educacional:** importantes para validação do conteúdo e da proposta pedagógica.
* **Escolas:** potenciais parceiras para validação com usuários reais e posterior utilização do produto.
* **Equipe do projeto:** responsável pelo desenvolvimento e evolução da solução.

> Parcerias comerciais ou institucionais adicionais: **a validar**.

---

## 9. Estrutura de custos

### Infraestrutura

* **R$ 0/mês na V1**, utilizando somente camadas gratuitas dos serviços definidos pela equipe.
* Render — Web Service gratuito.
* Google Gemini — camada gratuita.
* Sentry — plano gratuito.
* Subdomínio gratuito para a demonstração.

### Desenvolvimento

* Custos financeiros diretos: **a validar**.

### Premissa financeira atual

A V1 foi planejada sem orçamento para infraestrutura paga. Caso os limites das camadas gratuitas sejam ultrapassados ou o produto avance para uso real em escala, os custos deverão ser reavaliados.
