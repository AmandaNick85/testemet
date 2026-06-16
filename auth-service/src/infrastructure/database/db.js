import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const useSsl = process.env.NODE_ENV === 'production'
  || process.env.DATABASE_URL?.includes('sslmode=require')
  || process.env.DATABASE_URL?.includes('neon.tech')
  || process.env.DATABASE_URL?.includes('supabase');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: useSsl ? {
    ssl: { require: true, rejectUnauthorized: false }
  } : {},
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;