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

  async addDefaultItems() {
    await this.insert({
      id: 1,
      name: "Sometimes",
      description:
        "With all conditions and processes being equal, the bug occurs in sporadically/unpredictably, but it is always possible to reproduce it by making multiple attempts.",
    });

    await this.insert({
      id: 2,
      name: "Always",
      description:
        "With all conditions and processes being equal, the bug occurs under the same conditions and processes, at each replication attempt. To be such, the bug must be successfully reproduced at least 3 out of 3 times.",
    });

    await this.insert({
      id: 3,
      name: "Once",
      description:
        "With all conditions and processes being equal, the bug only occurred once and could not be replicated (at least 3 attempts needed).",
    });
  }
}
const replicability = new Replicability();
export default replicability;
export type { BugReplicabilityParams };
