import dotenv from 'dotenv';
dotenv.config();

interface Config {
  url: string;
  dialect: 'postgres';
}

interface Configs {
  development: Config;
  production: Config;
}

const config: Configs = {
  development: {
    url: process.env.DATABASE_URL!,
    dialect: 'postgres',
  },
  production: {
    url: process.env.DATABASE_URL!,
    dialect: 'postgres',
  },
};

export default config;
