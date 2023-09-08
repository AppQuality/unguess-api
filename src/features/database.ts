import knex from "knex";
import config from "../config";

import unguessDb from "@appquality/unguess-database";
import tryberDb from "@appquality/tryber-database";

export const unguess = unguessDb({
  client: "mysql",
  connection: {
    host: config.unguessDb.host,
    user: config.unguessDb.user,
    password: config.unguessDb.password,
    database: config.unguessDb.database,
    charset: "utf8mb4_unicode_ci",
  },
  pool: { min: 0, max: 7 },
});

export const tryber = tryberDb({
  client: "mysql",
  connection: {
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    charset: "utf8mb4_unicode_ci",
  },
  pool: { min: 0, max: 7 },
});
