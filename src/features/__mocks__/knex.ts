import knex from "knex";

export const unguess = knex({
  client: "better-sqlite3",
  connection: {
    filename: ":memory:",
  },
  useNullAsDefault: true,
});

export const tryber = knex({
  client: "better-sqlite3",
  connection: {
    filename: ":memory:",
  },
  useNullAsDefault: true,
});
