import Atendimento from '../domain/entities/Atendimento.js';

describe('Unidade de Domínio: Entidade Atendimento (Validações SOLID)', () => {
  
  // Teste 1: Sucesso
  test('Deve criar uma instância válida de Atendimento se todos os dados estiverem corretos', () => {
    const dadosValidos = {
      adolescente_id: '5005',
      equipe: 'EQUIPE_TECNICA',
      tipo: 'INDIVIDUAL',
      descricao: 'Atendimento social de rotina realizado com sucesso.',
      tecnico_responsavel: 'Carlos Silva'
    };

    const atendimento = new Atendimento(dadosValidos);

    expect(atendimento.adolescente_id).toBe('5005');
    expect(atendimento.equipe).toBe('EQUIPE_TECNICA');
    expect(atendimento.tipo).toBe('INDIVIDUAL');
  });

  // Teste 2: Falha por equipe inválida
  test('Deve lançar um erro se a equipe enviada não pertencer ao escopo técnico permitido', () => {
    const dadosEquipeInvalida = {
      adolescente_id: '5005',
      equipe: 'ENFERMAGEM', // Enfermagem foi excluída do escopo conforme regras de negócio
      tipo: 'INDIVIDUAL',
      descricao: 'Descrição técnica.',
      tecnico_responsavel: 'Carlos Silva'
    };

    expect(() => {
      new Atendimento(dadosEquipeInvalida);
    }).toThrow('Equipe inválida para este lançamento: ENFERMAGEM');
  });

  // Teste 3: Falha por tipo de atendimento fora do enum original
  test('Deve lançar um erro se o tipo de atendimento não constar no Enum original de domínio', () => {
    const dadosTipoInvalido = {
      adolescente_id: '5005',
      equipe: 'SAUDE_MENTAL',
      tipo: 'INTERNACAO_MEDICA', // Não faz parte dos 5 tipos originais (Individual, Familiar, etc)
      descricao: 'Descrição técnica.',
      tecnico_responsavel: 'Carlos Silva'
    };

    expect(() => {
      new Atendimento(dadosTipoInvalido);
    }).toThrow('Tipo de atendimento inválido: INTERNACAO_MEDICA');
  });
});