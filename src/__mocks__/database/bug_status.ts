import Table from "./tryber_table";

type BugStatusParams = {
  id?: number;
  name?: string;
  description?: string;
  icon?: string;
};

const defaultItem: BugStatusParams = {
  name: "???",
  description: "???",
  icon: "???",
};
class Status extends Table<BugStatusParams> {
  protected name = "wp_appq_evd_bug_status";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "name VARCHAR(45)",
    "description VARCHAR(512)",
    "icon VARCHAR(45)",
  ];

  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    await this.insert({
      id: 1,
      name: "Refused",
      description: "The bug has not been accepted",
      icon: "thumb_down",
    });
    await this.insert({
      id: 2,
      name: "Approved",
      description: "Bug approved!",
      icon: "thumb_up",
    });
    await this.insert({
      id: 3,
      name: "Pending",
      description: "Bug under review",
      icon: "loop",
    });
    await this.insert({
      id: 4,
      name: "Need Review",
      description: "More informations are needed to Approve this bug",
      icon: "error_outline",
    });
  }
}
const status = new Status();
export default status;
export type { BugStatusParams };
