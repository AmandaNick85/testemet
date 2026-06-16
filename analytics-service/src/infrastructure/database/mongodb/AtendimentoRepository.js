import AtendimentoModel from './models/AtendimentoModel.js';

export default class AtendimentoRepository {
  // O UseCase chama essa função passando a entidade de domínio limpa
  async salvar(atendimentoEntidade) {
    // Transforma a entidade limpa de domínio em um documento persistido no MongoDB
    const novoDocumento = new AtendimentoModel({
      adolescente_id: atendimentoEntidade.adolescente_id,
      equipe: atendimentoEntidade.equipe,
      tipo: atendimentoEntidade.tipo,
      descricao: atendimentoEntidade.descricao,
      tecnico_responsavel: atendimentoEntidade.tecnico_responsavel,
      criado_em: atendimentoEntidade.criado_em
    });

    return await novoDocumento.save();
  }

  // Gato Mestre pro Fabrício (CRUD/Listagem): Caso queira listar os últimos atendimentos depois
  async listarTodos() {
    return await AtendimentoModel.find().sort({ criado_em: -1 });
  }
}