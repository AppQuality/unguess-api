import { RowDataPacket } from "mysql2/promise";
import { snakeToPascal } from "./snakeToPascal";
import prettier from "prettier";

const formatColumnTypes = (columnType: string) => {
  switch (columnType) {
    case "int":
    case "decimal":
    case "mediumint":
    case "bigint":
    case "smallint":
    case "float":
    case "double":
    case "tinyint":
      return "number";
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
      return "string";
    case "binary":
    case "varbinary":
      return "boolean";
    default:
      throw new Error(`Unknown type ${columnType}`);
  }
};

export const format = ({ tableData }: { tableData: RowDataPacket[] }) => {
  let tableNames: string[] = tableData.map((table) => table.TABLE_NAME);
  tableNames = [...new Set(tableNames)];

  const tableDefinitions = tableNames.map((tableName) => {
    const columns = tableData
      .filter((table) => table.TABLE_NAME === tableName)
      .map((item) => {
        return {
          name: item.COLUMN_NAME,
          type: item.DATA_TYPE,
          isNotNull: item.IS_NULLABLE === "NO",
          isPrimary: item.COLUMN_KEY === "PRI",
          columnType: item.COLUMN_TYPE,
        };
      });
    return {
      name: snakeToPascal(tableName),
      table: tableName,
      columns: columns,
    };
  });
  const result: { filename: string; content: string }[] = [];

  tableDefinitions.forEach((table) => {
    const types = table.columns.reduce((carry, column) => {
      return `${carry}${column.name}?: ${formatColumnTypes(column.type)};`;
    }, "");

    const columns = `[${table.columns.reduce((carry, column) => {
      return `${carry}"${column.name} ${column.columnType}${
        column.isPrimary ? ` PRIMARY KEY` : ""
      }${column.isNotNull ? ` NOT NULL` : ""}",`;
    }, "")}]`;

    const paramsName = `${table.name}Params`;
    let data = `
        
import Table from "./tryber_table";

type ${paramsName} = {${types}};

const defaultItem: ${paramsName} = {};
class ${table.name} extends Table<${paramsName}> {
  protected name = "${table.table}";
  protected columns = ${columns};
  constructor() {
    super(defaultItem);
  }
}
const ${table.name.toLowerCase()} = new ${table.name}();
export default ${table.name.toLowerCase()};
export type { ${paramsName} };
    `;

    result.push({
      filename: table.name,
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
