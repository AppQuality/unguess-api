import mysql, { RowDataPacket } from "mysql2/promise";
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
          user: db.user || "root",
          password: db.password || "root",
          multipleStatements: true,
          host: db.host || "localhost",
        })
        .then((connection) => {
          resolve(connection);
        });
    });
  }
  return new Promise((resolve, reject) => {
    const ssh = new Client();
    ssh
      .on("ready", function () {
        ssh.forwardOut(
          "192.168.100.102",
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
  connection.end();

  // process.exit(0);
  if (!Array.isArray(results)) {
    console.log("No tables");
    return [];
  }

  return results as RowDataPacket[];
};
