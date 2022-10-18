import Table from "./tryber_table";

type BugSeverityParams = {
  id?: number;
  name?: string;
  description?: string;
};

const defaultItem: BugSeverityParams = {
  name: "???",
  description: "???",
};
class Severities extends Table<BugSeverityParams> {
  protected name = "wp_appq_evd_severity";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "name VARCHAR(45)",
    "description VARCHAR(512)",
  ];
  constructor() {
    super(defaultItem);
  }
}
const severities = new Severities();
export default severities;
export type { BugSeverityParams };
