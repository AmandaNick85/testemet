import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  technicianId: {
    type: String, // ID que vem do Postgres (auth-service) como UUID string
    required: [true, 'O ID do técnico é obrigatório.'],
    index: true // Indexado para buscas rápidas por relatórios de técnicos específicos
  },
  technicianName: {
    type: String,
    required: [true, 'O nome do técnico é obrigatório.']
  },
  equipmentType: {
    type: String,
    required: [true, 'O tipo de equipamento é obrigatório.'],
    enum: ['RAIO-X', 'TOMÓGRAFO', 'RESPIRADOR', 'MONITOR', 'OUTRO']
  },
  description: {
    type: String,
    required: [true, 'A descrição do atendimento é obrigatória.']
  },
  durationMinutes: {
    type: Number,
    required: [true, 'A duração do atendimento em minutos é obrigatória.']
  },
  status: {
    type: String,
    required: true,
    enum: ['CONCLUÍDO', 'EM_ANDAMENTO', 'AGUARDANDO_PEÇA'],
    default: 'CONCLUÍDO'
  }
}, {
  timestamps: true // Cria automaticamente createdAt e updatedAt para os relatórios temporais
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;