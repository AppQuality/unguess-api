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
