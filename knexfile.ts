import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();
// Update with your config settings.

const tryberDb = {
  host: process.env.SCHEMA_DB_HOST,
  user: process.env.SCHEMA_DB_USER,
  password: process.env.SCHEMA_DB_PASSWORD,
  database: process.env.SCHEMA_DB_NAME,
};

const config: { [key: string]: Knex.Config } = {
  tryberStaging: {
    client: "mysql",
    connection: {
      host: "localhost",
      port: 5432,
      user: tryberDb.user,
      password: tryberDb.password,
      database: tryberDb.database,
    },
    pool: { min: 0, max: 7 },
    migrations: {
      directory: "./migrations/tryber",
      tableName: "knex_migrations",
    },
  },

  tryberProduction: {
    client: "mysql",
    connection: {
      host: tryberDb.host,
      user: tryberDb.user,
      password: tryberDb.password,
      database: tryberDb.database,
    },
    pool: { min: 0, max: 7 },
    migrations: {
      directory: "./migrations/tryber",
      tableName: "knex_migrations",
    },
  },
};

module.exports = config;
