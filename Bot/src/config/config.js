import dotenv from 'dotenv';

dotenv.config();

export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000/api',
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// Validate required config
if (!config.BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required in environment variables');
}

export default config;
