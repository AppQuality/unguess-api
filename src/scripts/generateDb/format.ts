import { RowDataPacket } from "mysql2/promise";
import { snakeToPascal } from "./snakeToPascal";

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
    let data = `import Table from "./tryber_table";

    type ${table.name}Params = {
      ${table.columns.reduce((carry, column) => {
        return `${carry}  ${column.name}?: ${formatColumnTypes(
          column.type
        )};\r`;
      }, "")}
    };
    
    const defaultItem: ${table.name}Params= {
    };
    class ${table.name} extends Table<${table.name}Params> {
      protected name = "${table.table}";
      protected columns = [
        ${table.columns.reduce((carry, column) => {
          return `${carry}        "${column.name} ${column.type}",\r`;
        }, "")}
      ];
      constructor() {
        super(defaultItem);
      }
    }
    const ${table.name.toLowerCase()} = new ${table.name}();
    export default ${table.name.toLowerCase()};
    export type { ${table.name}Params };
    `;

    result.push({
      filename: table.name,
      content: data,
    });
  });
  return result;
};
