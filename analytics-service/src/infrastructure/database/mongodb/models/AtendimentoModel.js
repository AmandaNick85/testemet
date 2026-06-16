import mongoose from 'mongoose';
import TipoAtendimento from '../../../../domain/enums/tipoAtendimento.js';

const AtendimentoSchema = new mongoose.Schema({
  adolescente_id: { type: String, required: true },
  equipe: { type: String, required: true, enum: ['EQUIPE_TECNICA', 'SAUDE_MENTAL'] },
  tipo: { type: String, required: true },
  descricao: { type: String, required: true },
  tecnico_responsavel: { type: String, required: true },
  criado_em: { type: Date, default: Date.now }
}, {
  collection: 'atendimentos', // Força o nome correto da coleção no Mongo
  versionKey: false
});

export default mongoose.model('Atendimento', AtendimentoSchema);