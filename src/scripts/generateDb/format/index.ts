import { RowDataPacket } from "mysql2/promise";
import { snakeToPascal } from "../snakeToPascal";
import { formatColumnTypes } from "./formatColumnTypes";
import { formatDefinitions } from "./formatDefinitions";
import prettier from "prettier";

export const format = ({
  tableData,
  database,
}: {
  tableData: { TABLE_NAME: string; columns: RowDataPacket[]; keys: string[] }[];
  database: "unguess" | "tryber";
}) => {
  const result: { filename: string; content: string }[] = [];

  tableData.forEach((table) => {
    const pascalCaseName = snakeToPascal(table.TABLE_NAME);
    const types = table.columns.reduce(
      (carry, column) =>
        `${carry}${column.COLUMN_NAME}: ${formatColumnTypes(
          column.DATA_TYPE
        )};`,
      ""
    );

    const definitions = table.columns.reduce(
      (carry, column) => `${carry}${formatDefinitions(column)}`,
      ""
    );

    let keys = "";
    if (table.keys.length > 0) {
      keys = `table.unique(${JSON.stringify(table.keys)});`;
    }

    let data = `
import { ${database} } from "@src/features/knex";

interface iTable {${types}}

const table = () => ${database}<iTable>("${table.TABLE_NAME}");

const create = () =>
  ${database}.schema.createTable("${table.TABLE_NAME}", function (table) {
    ${definitions}
    ${keys}
  });

const drop = () => ${database}.schema.dropTable("${table.TABLE_NAME}");

export default table;
export { create, drop };
`;

    result.push({
      filename: pascalCaseName,
      content: data,
    });
  });

  for (let i = 0; i < result.length; i++) {
    result[i].content = prettier.format(result[i].content, {
      parser: "typescript",
    });
  }

  return result;
};
