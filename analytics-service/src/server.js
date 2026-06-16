import app from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3002;

function resolveMongoUri() {
  if (process.env.MONGO_URI?.trim()) {
    return process.env.MONGO_URI.trim();
  }

  // No Render, exige MONGO_URI configurada no painel (Environment)
  if (process.env.RENDER) {
    return null;
  }

  // Fallback apenas para Docker Compose local
  return 'mongodb://mongodb:27017/medmetrics';
}

const MONGO_URI = resolveMongoUri();

async function connectMongo() {
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI não configurada no Render.');
    console.error('   Vá em: medmetrics-analytics-service → Environment → Add Variable');
    console.error('   Key: MONGO_URI');
    console.error('   Value: mongodb+srv://usuario:senha@cluster.mongodb.net/medmetrics');
    process.exit(1);
  }

  const maskedUri = MONGO_URI.replace(/:([^:@/]+)@/, ':****@');
  console.log(`🔌 MongoDB: ${maskedUri}`);

  try {
    mongoose.set('strictQuery', false);
    // Tenta ligar à base de dados NoSQL
    await mongoose.connect(MONGO_URI);
    console.log('🍃 Ligação ao MongoDB estabelecida com sucesso para análise de dados!');

    // Inicia o Express para ouvir requisições do Frontend
    app.listen(PORT, () => {
      console.log(`🚀 Analytics-Service ativo e a escutar na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Falha crítica ao ligar ao MongoDB:', error);
    process.exit(1); // Encerra o processo caso a base de dados não suba
  }
}

connectMongo();