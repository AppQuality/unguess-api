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

const unguessDb = {
  host: process.env.SCHEMA_DB_HOST_UNGUESS,
  user: process.env.SCHEMA_DB_USER_UNGUESS,
  password: process.env.SCHEMA_DB_PASSWORD_UNGUESS,
  database: process.env.SCHEMA_DB_NAME_UNGUESS,
};

const config: { [key: string]: Knex.Config } = {
  tryber: {
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

  unguess: {
    client: "mysql",
    connection: {
      host: "localhost",
      port: 5431,
      user: unguessDb.user,
      password: unguessDb.password,
      database: unguessDb.database,
    },
    pool: { min: 0, max: 7 },
    migrations: {
      directory: "./migrations/unguess",
      tableName: "knex_migrations",
    },
  },
};

module.exports = config;
