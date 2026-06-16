import app from './app.js';
import sequelize from './infrastructure/database/db.js';
import User from './infrastructure/database/models/User.js';
import bcrypt from 'bcryptjs'; // Importação necessária para criptografar a senha padrão

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // 1. Autentica e conecta ao Postgres
    await sequelize.authenticate();
    console.log('📦 Conexão com o PostgreSQL estabelecida com sucesso via Sequelize!');

    // 2. Cria as tabelas se elas não existirem no banco (sem quebrar o banco)
    await sequelize.sync({ alter: true });
    console.log('🧬 Tabelas do banco sincronizadas perfeitamente.');

    // ==========================================
    // INJEÇÃO AUTOMÁTICA DE USUÁRIOS (DEGASE)
    // ==========================================
    const hashSenha = await bcrypt.hash('Med@123', 10);

    // Garante o Diretor Técnico
    await User.findOrCreate({
      where: { id_institucional: '1001' },
      defaults: {
        name: 'Diretor Técnico',
        password: hashSenha,
        role: 'DIRETOR'
      }
    });

    // Garante o Técnico de Saúde
    await User.findOrCreate({
      where: { id_institucional: '2002' },
      defaults: {
        name: 'Tecnico de Saude',
        password: hashSenha,
        role: 'TECNICO'
      }
    });
    console.log('👥 Usuários padrão (1001 e 2002) verificados/injetados no banco.');
    // ==========================================

    // 3. Inicia o servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Auth-Service rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Falha catastrófica ao iniciar o Auth-Service:', error);
    process.exit(1); // Fecha o processo em caso de falha crítica de conexão
  }
}

startServer();