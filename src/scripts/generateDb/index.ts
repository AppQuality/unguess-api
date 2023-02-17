import fs from "fs";
import dotenv from "dotenv";
import { getTablesAndColumns } from "./createConnection";
import { format } from "./format";
import { snakeToPascal } from "./snakeToPascal";
import prettier from "prettier";

dotenv.config();

if (process.argv.length < 3) {
  console.info("Missing database name (tryber or unguess)");
  process.exit(0);
}
if (process.argv[2] !== "tryber" && process.argv[2] !== "unguess") {
  console.info(
    `Invalid database name "${process.argv[2]}" (tryber or unguess)`
  );
  process.exit(0);
}

const database: "tryber" | "unguess" = process.argv[2];
const db =
  database === "unguess"
    ? {
        host: process.env.SCHEMA_DB_HOST_UNGUESS,
        user: process.env.SCHEMA_DB_USER_UNGUESS,
        password: process.env.SCHEMA_DB_PASSWORD_UNGUESS,
        database: process.env.SCHEMA_DB_NAME_UNGUESS,
      }
    : {
        host: process.env.SCHEMA_DB_HOST,
        user: process.env.SCHEMA_DB_USER,
        password: process.env.SCHEMA_DB_PASSWORD,
        database: process.env.SCHEMA_DB_NAME,
      };

if (!Object.values(db).every((value) => typeof value !== "undefined"))
  throw `Missing env variables in db ${JSON.stringify(db)}`;

const sshConfig = {
  host: process.env.SCHEMA_SSH_HOST,
  port: process.env.SCHEMA_SSH_PORT
    ? parseInt(process.env.SCHEMA_SSH_PORT)
    : undefined,
  username: process.env.SCHEMA_SSH_USERNAME,
  privateKey: process.env.SCHEMA_SSH_PRIVATE_KEY
    ? require("fs").readFileSync(process.env.SCHEMA_SSH_PRIVATE_KEY)
    : undefined,
};

const isSshDefined = Object.values(sshConfig).every(
  (value) => typeof value !== "undefined"
);

const path = `./src/features/tables/${database}`;

(async () => {
  const tables = await getTablesAndColumns({
    sshConfig: isSshDefined ? (sshConfig as any) : undefined,
    db: db as any,
  });

  fs.mkdirSync(path, { recursive: true });

  const files = format({ tableData: tables, database });

  let types = `import { Knex } from "knex"; declare module "knex/types/tables" {`;
  let typeLinks = ``;
  let tableImport = ``;
  let tableInit = ``;
  files.forEach((file) => {
    fs.writeFileSync(`${path}/${file.filename}.ts`, file.content);
    types += `interface i${snakeToPascal(file.tableName)} ${file.types}`;
    typeLinks += `${file.tableName}: i${snakeToPascal(file.tableName)};`;
    tableImport += `import ${snakeToPascal(file.tableName)} from "${path}/${
      file.filename
    }";`;
    tableInit += `${snakeToPascal(file.tableName)}.create();`;
  });
  types += ` interface Tables {${typeLinks}} }`;

  fs.writeFileSync(
    `./src/${database}TableTypes.ts`,
    prettier.format(types, { parser: "typescript" })
  );
  fs.writeFileSync(
    `${path}.ts`,
    prettier.format(`${tableImport}; export default () => {${tableInit}}`, {
      parser: "typescript",
    })
  );

  fs.readdirSync(path).forEach((file) => {
    if (!files.map((t) => t.filename).includes(file.replace(".ts", ""))) {
      fs.unlinkSync(`${path}/${file}`);
    }
  });

  process.exit(0);
})();
