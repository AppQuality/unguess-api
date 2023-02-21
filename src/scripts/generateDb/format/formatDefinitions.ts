import { RowDataPacket } from "mysql2";

export const formatDefinitions = (dbName: string, column: RowDataPacket) => {
  return `${getColumnCreationFunction(column)}${
    column.IS_NULLABLE === "NO" ? ".notNullable()" : ""
  }${getDefault(dbName, column)};`;
};

const getDefault = (dbName: string, column: RowDataPacket) => {
  if (column.COLUMN_DEFAULT === null) return "";

  if (["CURRENT_TIMESTAMP"].includes(column.COLUMN_DEFAULT)) {
    return `.defaultTo(${dbName}.fn.now())`;
  }
  if (!isNaN(column.COLUMN_DEFAULT) && column.COLUMN_DEFAULT !== "") {
    return `.defaultTo(${column.COLUMN_DEFAULT})`;
  }

  if (
    ["varchar", "enum", "timestamp", "datetime", "date", "binary"].includes(
      column.DATA_TYPE
    )
  ) {
    return `.defaultTo("${column.COLUMN_DEFAULT}")`;
  }
  console.log(column);

  throw new Error(`Invalid column default ${column.COLUMN_DEFAULT}`);
};

const getColumnCreationFunction = (column: RowDataPacket) => {
  if (column.EXTRA.includes("auto_increment")) {
    return `table.increments("${column.COLUMN_NAME}")`;
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
      return `table.integer("${column.COLUMN_NAME}")`;
    case "longtext":
    case "mediumtext":
    case "text":
    case "tinytext":
    case "char":
    case "varchar":
    case "date":
    case "time":
    case "enum":
    case "longblob":
      return `table.string("${column.COLUMN_NAME}")`;
    case "timestamp":
      return `table.timestamp("${column.COLUMN_NAME}")`;
    case "datetime":
    case "date":
    case "time":
      return `table.datetime("${column.COLUMN_NAME}")`;
    case "binary":
    case "varbinary":
      return `table.boolean("${column.COLUMN_NAME}")`;
    default:
      throw new Error(`Unknown type ${JSON.stringify(column)}`);
  }
};
