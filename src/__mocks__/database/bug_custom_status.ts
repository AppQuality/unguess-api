import Table from "./unguess_table";

type BugCustomStatusParams = {
  custom_status_id?: number;
  bug_id?: number;
};

const defaultItem: BugCustomStatusParams = {
  custom_status_id: 0,
  bug_id: 0,
};

class BugCustomStatuses extends Table<BugCustomStatusParams> {
  protected name = "wp_ug_bug_custom_status_to_bug";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "custom_status_id INTEGER NOT NULL",
    "bug_id INTEGER NOT NULL UNIQUE",
  ];
  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    await this.insert({
      custom_status_id: 1,
      bug_id: 1,
    });
  }
}
const bug_custom_statuses = new BugCustomStatuses();
export default bug_custom_statuses;
export type { BugCustomStatusParams };
