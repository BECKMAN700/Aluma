export const turmas: Array<{
  id: string;
  nome: string;
  serie: string;
  turno: 'Manhã' | 'Tarde';
  professorResponsavel: string;
  quantidadeAlunos: number;
}> = [
  {
    id: 'turma-8a',
    nome: '8º ano A',
    serie: '8º ano',
    turno: 'Manhã',
    professorResponsavel: 'Camila Souza',
    quantidadeAlunos: 28,
  },
  {
    id: 'turma-8b',
    nome: '8º ano B',
    serie: '8º ano',
    turno: 'Tarde',
    professorResponsavel: 'Rafael Nunes',
    quantidadeAlunos: 31,
  },
  {
    id: 'turma-9a',
    nome: '9º ano A',
    serie: '9º ano',
    turno: 'Manhã',
    professorResponsavel: 'Marina Costa',
    quantidadeAlunos: 27,
  },
];

export const duvidas: Array<{
  id: string;
  turmaId: string;
  aluno: string;
  materia: 'Matemática' | 'Português' | 'Ciências' | 'História' | 'Geografia' | 'Biologia';
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'média' | 'alta';
  status: 'pendente' | 'respondida' | 'em revisão';
  data: string;
}> = [
  {
    id: 'duvida-001',
    turmaId: 'turma-8a',
    aluno: 'Ana Beatriz',
    materia: 'Matemática',
    titulo: 'Regra de três simples',
    descricao: 'Não entendi como resolver um problema de regra de três quando a grandeza está inversamente proporcional.',
    prioridade: 'alta',
    status: 'pendente',
    data: '2026-09-01',
  },
  {
    id: 'duvida-002',
    turmaId: 'turma-8b',
    aluno: 'Lucas Mendes',
    materia: 'Português',
    titulo: 'Interpretação de texto',
    descricao: 'Gostaria de entender como identificar a ideia principal de um texto dissertativo e separar argumento de opinião.',
    prioridade: 'média',
    status: 'respondida',
    data: '2026-08-30',
  },
  {
    id: 'duvida-003',
    turmaId: 'turma-9a',
    aluno: 'Sofia Ribeiro',
    materia: 'Ciências',
    titulo: 'Fotossíntese e respiração celular',
    descricao: 'Queria entender a diferença entre fotossíntese e respiração celular em plantas e como isso se relaciona com a produção de energia.',
    prioridade: 'alta',
    status: 'em revisão',
    data: '2026-09-02',
  },
  {
    id: 'duvida-004',
    turmaId: 'turma-8a',
    aluno: 'Pedro Almeida',
    materia: 'História',
    titulo: 'Revolução Industrial',
    descricao: 'Preciso de exemplos de como as mudanças tecnológicas alteraram a vida das pessoas na Europa durante o século XIX.',
    prioridade: 'baixa',
    status: 'pendente',
    data: '2026-08-29',
  },
  {
    id: 'duvida-005',
    turmaId: 'turma-8b',
    aluno: 'Mariana Costa',
    materia: 'Geografia',
    titulo: 'Formação dos climas',
    descricao: 'Não consigo relacionar latitude, altitude e massas de ar com os diferentes tipos de clima do Brasil.',
    prioridade: 'média',
    status: 'respondida',
    data: '2026-08-28',
  },
];
