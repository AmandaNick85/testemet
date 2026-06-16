const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'postgres', // Conecta direto no container do banco
  database: process.env.DB_NAME || 'medmetrics_auth', 
  password: process.env.DB_PASSWORD || 'postgres', 
  port: process.env.DB_PORT || 5432,
});

async function runSeed() {
  try {
    await client.connect();
    console.log('🌱 Conectado ao banco para rodar o seed do DEGASE...');

    // Cria a tabela caso ela não exista, já com o ID Institucional
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        id_institucional VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Limpa a tabela para não duplicar os usuários de teste
    await client.query('TRUNCATE TABLE "Users" RESTART IDENTITY;');

    const senhaPadrao = 'Med@123';
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(senhaPadrao, salt);

    // Inserir Diretor Geral (ID: 1001)
    await client.query(
      `INSERT INTO "Users" (name, id_institucional, password, role) VALUES ($1, $2, $3, $4)`,
      ['Diretor Geral', '1001', hashSenha, 'Diretor']
    );

    // Inserir Técnico (ID: 2002)
    await client.query(
      `INSERT INTO "Users" (name, id_institucional, password, role) VALUES ($1, $2, $3, $4)`,
      ['Tecnico de Saude', '2002', hashSenha, 'Técnico']
    );

    console.log('✅ Perfeito! Usuários criados com sucesso no banco!');
    console.log('🆔 ID: 1001 | Senha: Med@123 (Diretor)');
    console.log('🆔 ID: 2002 | Senha: Med@123 (Técnico)');

  } catch (error) {
    console.error('❌ Erro ao rodar o seed:', error);
  } finally {
    await client.end();
  }
}

runSeed();