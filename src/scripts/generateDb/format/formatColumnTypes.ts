export const formatColumnTypes = (columnType: string) => {
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
    case "tinytext":
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
