import Table from "./tryber_table";

type BugReplicabilityParams = {
  id?: number;
  name?: string;
  description?: string;
};

const defaultItem: BugReplicabilityParams = {
  name: "???",
  description: "???",
};
class Replicability extends Table<BugReplicabilityParams> {
  protected name = "wp_appq_evd_bug_replicability";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "name VARCHAR(45)",
    "description VARCHAR(512)",
  ];
  constructor() {
    super(defaultItem);
  }
}
const replicability = new Replicability();
export default replicability;
export type { BugReplicabilityParams };
