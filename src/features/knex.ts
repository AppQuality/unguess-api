import knex from "knex";
import config from "../config";

export const unguess = knex({
  client: "mysql",
  connection: {
    host: config.unguessDb.host,
    user: config.unguessDb.user,
    password: config.unguessDb.password,
    database: config.unguessDb.database,
  },
  pool: { min: 0, max: 7 },
});

export const tryber = knex({
  client: "mysql",
  connection: {
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  },
  pool: { min: 0, max: 7 },
});
