import { RowDataPacket } from "mysql2";

export const formatDefinitions = (column: RowDataPacket) => {
  if (column.isPrimary) {
    return `table.increments("${column.COLUMN_NAME}");`;
  }
  switch (column.DATA_TYPE) {
    case "int":
    case "decimal":
    case "mediumint":
    case "bigint":
    case "smallint":
    case "float":
    case "double":
    case "tinyint":
      return `table.integer("${column.COLUMN_NAME}");`;
    case "longtext":
    case "mediumtext":
    case "text":
    case "tinytext":
    case "char":
    case "varchar":
    case "datetime":
    case "date":
    case "time":
    case "enum":
    case "longblob":
      return `table.string("${column.COLUMN_NAME}");`;
    case "timestamp":
      return `table.timestamp("${column.COLUMN_NAME}");`;
    case "datetime":
    case "date":
    case "time":
      return `table.datetime("${column.COLUMN_NAME}");`;
    case "binary":
    case "varbinary":
      return `table.boolean("${column.COLUMN_NAME}");`;
    default:
      throw new Error(`Unknown type ${JSON.stringify(column)}`);
  }
};
