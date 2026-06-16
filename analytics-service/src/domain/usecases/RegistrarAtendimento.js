import Atendimento from '../entities/Atendimento.js'; // <-- Caminho atualizado e limpo!

export default class RegistrarAtendimento {
  constructor(atendimentoRepository) {
    this.atendimentoRepository = atendimentoRepository;
  }

  async execute(dadosEntrada) {
    const novoAtendimento = new Atendimento(dadosEntrada);
    return await this.atendimentoRepository.salvar(novoAtendimento);
  }
}