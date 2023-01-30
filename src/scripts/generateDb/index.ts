import fs from "fs";
import dotenv from "dotenv";
import { snakeToPascal } from "./snakeToPascal";
import { getTablesAndColumns } from "./createConnection";

dotenv.config();

const db = {
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

(async () => {
  const tables = await getTablesAndColumns({
    sshConfig: isSshDefined ? (sshConfig as any) : undefined,
    db: db as any,
  });

  let tableNames: string[] = tables.map((table) => table.TABLE_NAME);
  tableNames = [...new Set(tableNames)];

  const tableDefinitions = tableNames.map((tableName) => {
    const columns = tables
      .filter((table) => table.TABLE_NAME === tableName)
      .map((item) => {
        return {
          name: item.COLUMN_NAME,
          type: item.DATA_TYPE,
        };
      });
    return {
      name: snakeToPascal(tableName),
      columns: columns,
    };
  });

  fs.mkdirSync(`./src/types/tables/`, { recursive: true });

  tableDefinitions.forEach((table) => {
    let data = `export type ${table.name} = {`;
    table.columns.forEach((column) => {
      switch (column.type) {
        case "int":
        case "decimal":
        case "mediumint":
        case "bigint":
        case "smallint":
        case "float":
        case "double":
        case "tinyint":
          column.type = "number";
          break;
        case "longtext":
        case "timestamp":
        case "mediumtext":
        case "text":
        case "char":
        case "varchar":
        case "datetime":
        case "date":
        case "time":
        case "enum":
        case "longblob":
          column.type = "string";
          break;
        case "binary":
        case "varbinary":
          column.type = "boolean";
          break;
        default:
          throw new Error(`Unknown type ${column.type}`);
      }
      data += `  ${column.name}: ${column.type};\r`;
    });
    data += `}\r`;

    fs.writeFileSync(`./src/types/tables/${table.name}.ts`, data);
  });

  fs.readdirSync(`./src/types/tables/`).forEach((file) => {
    if (
      !tableDefinitions.map((t) => t.name).includes(file.replace(".ts", ""))
    ) {
      fs.unlinkSync(`./src/types/tables/${file}`);
    }
  });

  process.exit(0);
})();
