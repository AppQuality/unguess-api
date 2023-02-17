import mysql, { RowDataPacket } from "mysql2/promise";
import { getFirstAvailableIp } from "./getFirstAvailableIp";
import { Client } from "ssh2";

const createConnection = async ({
  sshConfig,
  db,
}: {
  sshConfig?: {
    host: string;
    port: number;
    username: string;
    privateKey: string;
  };
  db: { user: string; password: string; host: string };
}): Promise<mysql.Connection> => {
  if (!sshConfig) {
    return new Promise((resolve, reject) => {
      mysql
        .createConnection({
          user: db.user || "test",
          password: db.password || "test",
          multipleStatements: true,
          host: db.host || "localhost",
        })
        .then((connection) => {
          resolve(connection);
        });
    });
  }
  const ip = await getFirstAvailableIp();
  return new Promise((resolve, reject) => {
    const ssh = new Client();
    ssh
      .on("ready", function () {
        ssh.forwardOut(
          ip,
          3306,
          db.host || "localhost",
          3306,
          function (err, stream) {
            if (err) return reject(err);

            mysql
              .createConnection({
                user: db.user || "root",
                password: db.password || "root",
                multipleStatements: true,
                stream: stream,
              })
              .then((connection) => {
                resolve(connection);
              });
          }
        );
      })
      .connect({
        host: sshConfig.host,
        port: sshConfig.port,
        username: sshConfig.username,
        privateKey: sshConfig.privateKey,
      });
  });
};

export const getTablesAndColumns = async ({
  sshConfig,
  db,
}: {
  sshConfig?: {
    host: string;
    port: number;
    username: string;
    privateKey: string;
  };
  db: { user: string; password: string; host: string; database: string };
}) => {
  const connection = await createConnection({
    sshConfig,
    db,
  });

  const [results] = await connection.execute(
    `SELECT col.*
    FROM information_schema.columns col
    JOIN information_schema.tables tab ON (col.TABLE_NAME = tab.TABLE_NAME)
    WHERE col.table_schema = '${db.database}' AND tab.table_type = 'BASE TABLE';`
  );
  const tables = results as RowDataPacket[];
  let tableNames: string[] = tables.map((table) => table.TABLE_NAME);
  tableNames = [...new Set(tableNames)];

  const [keysResult] = await connection.execute(
    `SELECT GROUP_CONCAT(COLUMN_NAME) as keyList,k.TABLE_NAME
    FROM information_schema.table_constraints t
             JOIN information_schema.key_column_usage k
                  USING (constraint_name, table_schema, table_name)
    WHERE k.CONSTRAINT_SCHEMA = "${db.database}"
      AND CONSTRAINT_NAME != "PRIMARY" GROUP BY TABLE_NAME;
    `
  );
  const keys = keysResult as RowDataPacket[];

  const [primaryKeysResult] = await connection.execute(
    `SELECT GROUP_CONCAT(COLUMN_NAME) as keyList,k.TABLE_NAME
    FROM information_schema.table_constraints t
             JOIN information_schema.key_column_usage k
                  USING (constraint_name, table_schema, table_name)
    WHERE k.CONSTRAINT_SCHEMA = "${db.database}"
      AND CONSTRAINT_NAME = "PRIMARY" GROUP BY TABLE_NAME;
    `
  );
  const primaryKeys = primaryKeysResult as RowDataPacket[];

  connection.end();

  const enhancedTables = tableNames.map((tableName) => {
    const columns = tables.filter((table) => table.TABLE_NAME === tableName);
    const tableKeys = keys.filter((key) => key.TABLE_NAME === tableName);
    const tablePrimaryKeys = primaryKeys.filter(
      (key) => key.TABLE_NAME === tableName
    );
    const keyList: string[] =
      tableKeys.length > 0 && tableKeys[0].keyList
        ? tableKeys[0].keyList.split(",")
        : [];
    const primaryKeyList: string[] =
      tablePrimaryKeys.length > 0 && tablePrimaryKeys[0].keyList
        ? tablePrimaryKeys[0].keyList.split(",")
        : [];
    return {
      TABLE_NAME: tableName,
      columns,
      keys: [...keyList, ...(primaryKeyList.length > 1 ? primaryKeyList : [])],
    };
  });

  // process.exit(0);
  if (!Array.isArray(results)) {
    console.log("No tables");
    return [];
  }

  return enhancedTables;
};
