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
  const result: {
    filename: string;
    content: string;
    types: string;
    tableName: string;
  }[] = [];

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
      (carry, column) => `${carry}${formatDefinitions(database, column)}`,
      ""
    );

    let keys = "";
    if (table.keys.length > 0) {
      keys = `table.unique(${JSON.stringify(table.keys)});`;
    }

    let data = `
    import {  ${database} } from "@src/features/knex";

    class Table {
      public do() {
        return  ${database}("${table.TABLE_NAME}");
      }
    
      public create() {
        return  ${database}.schema.createTable(
          "${table.TABLE_NAME}",
          function (table) {
            ${definitions}
            ${keys}
          }
        );
      }
      public drop() {
        return  ${database}.schema.dropTable("${table.TABLE_NAME}");
      }
    }
    
    const item = new Table();
    
    export default item;
    
`;

    result.push({
      filename: pascalCaseName,
      content: data,
      types: `{${types}}`,
      tableName: table.TABLE_NAME,
    });
  });

  for (let i = 0; i < result.length; i++) {
    result[i].content = prettier.format(result[i].content, {
      parser: "typescript",
    });
  }

  return result;
};
