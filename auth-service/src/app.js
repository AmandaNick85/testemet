import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './infrastructure/controllers/authController.js'; // Vamos ajustar o controller a seguir

const app = express();

// Middlewares de Segurança exigidos na arquitetura
app.use(helmet());
app.use(cors({ origin: '*' })); // Permite que nosso frontend React acesse a API
app.use(express.json());

// Evita ataques de força bruta no login
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: { error: 'Muitas requisições vindas deste IP, tente novamente mais tarde.' }
});
app.use('/api', limiter);

// Rotas do Microsserviço
app.use('/api/auth', authRoutes);

// Rota de checagem de saúde do container
app.get('/health', (req, res) => res.status(200).json({ status: 'UP', service: 'auth-service' }));

export default app;