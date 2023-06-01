import knex from "knex";
import unguessDb from "@appquality/unguess-database";
import tryberDb from "@appquality/tryber-database";

export const unguess = unguessDb({
  client: "better-sqlite3",
  connection: {
    filename: "unguess.db",
  },
  useNullAsDefault: true,
});

export const tryber = tryberDb({
  client: "better-sqlite3",
  connection: {
    filename: "tryber.db",
  },
  useNullAsDefault: true,
});
