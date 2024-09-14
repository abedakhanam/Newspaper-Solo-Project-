interface Config {
  database: string;
  username: string;
  password: string;
  host: string;
  dialect: string;
  port: number;
}

interface Configs {
  development: Config;
  production: Config;
}

const dbconfig = {
  database: 'newspaper_db',
  username: 'postgres',
  password: 'pc9874',
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
};

export default dbconfig;
