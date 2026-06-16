import express from 'express';
import cors from 'cors';
import AtendimentoRepository from './infrastructure/database/mongodb/AtendimentoRepository.js';
import RegistrarAtendimento from './domain/usecases/RegistrarAtendimento.js';

const app = express();

app.use(cors());
app.use(express.json());

const atendimentoRepository = new AtendimentoRepository();
const registrarAtendimentoUseCase = new RegistrarAtendimento(atendimentoRepository);

app.post('/api/analytics/atendimentos', async (req, res) => {
  try {
    const { adolescente_id, equipe, tipo, descricao, tecnico_responsavel } = req.body;
    
    const resultado = await registrarAtendimentoUseCase.execute({
      adolescente_id,
      equipe,
      tipo,
      descricao,
      tecnico_responsavel
    });

    return res.status(201).json({
      success: true,
      message: 'Atendimento gravado no MongoDB com sucesso!',
      data: resultado
    });
  } catch (error) {
    console.error('Erro no UseCase Analytics:', error.message);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/health', (req, res) => res.status(200).json({ status: 'UP', service: 'analytics-service' }));

export default app;