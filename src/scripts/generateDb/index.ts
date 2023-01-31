import fs from "fs";
import dotenv from "dotenv";
import { getTablesAndColumns } from "./createConnection";
import { format } from "./format";

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

  fs.mkdirSync("./src/types/tables", { recursive: true });

  const files = format({ tableData: tables });

  files.forEach((file) => {
    fs.writeFileSync(`./src/types/tables/${file.filename}.ts`, file.content);
  });

  fs.readdirSync(`./src/types/tables/`).forEach((file) => {
    if (!files.map((t) => t.filename).includes(file.replace(".ts", ""))) {
      fs.unlinkSync(`./src/types/tables/${file}`);
    }
  });

  process.exit(0);
})();
