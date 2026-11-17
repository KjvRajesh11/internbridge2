import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/internbridge',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'internbridge-jwt-access-secret-key-32-chars-minimum-xyz123',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'internbridge-jwt-refresh-secret-key-32-chars-minimum-abc789',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  AUTO_SEED_IF_EMPTY: process.env.AUTO_SEED_IF_EMPTY !== 'false',
};
