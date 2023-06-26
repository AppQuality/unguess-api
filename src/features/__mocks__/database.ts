import unguessDb from "@appquality/unguess-database";
import tryberDb from "@appquality/tryber-database";

export const unguess = unguessDb({
  client: "better-sqlite3",
  connection: {
    filename: ":memory:",
  },
  useNullAsDefault: true,
});

export const tryber = tryberDb({
  client: "better-sqlite3",
  connection: {
    filename: ":memory:",
  },
  useNullAsDefault: true,
});
