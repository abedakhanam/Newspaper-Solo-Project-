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
  database: "newspaper",
  username: "mysqlclient",
  password: "admin",
  host: "localhost",
  dialect: "postgres",
  port: 5432,
};

export default dbconfig;
