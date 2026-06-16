import TipoAtendimento from '../enums/tipoAtendimento.js';

export default class Atendimento {
  constructor({ adolescente_id, equipe, tipo, descricao, tecnico_responsavel }) {
    if (!adolescente_id || !descricao) {
      throw new Error('Campos obrigatórios ausentes: adolescente_id e descricao.');
    }

    // Validação estrita do domínio do DEGASE
    const equipesPermitidas = ['EQUIPE_TECNICA', 'SAUDE_MENTAL'];
    if (!equipesPermitidas.includes(equipe)) {
      throw new Error(`Equipe inválida para este lançamento: ${equipe}`);
    }

    // Validação contra o Enum original exigido
    if (!TipoAtendimento[tipo]) {
      throw new Error(`Tipo de atendimento inválido: ${tipo}`);
    }

    this.adolescente_id = adolescente_id;
    this.equipe = equipe;
    this.tipo = tipo;
    this.descricao = descricao;
    this.tecnico_responsavel = tecnico_responsavel;
    this.criado_em = new Date();
  }
}