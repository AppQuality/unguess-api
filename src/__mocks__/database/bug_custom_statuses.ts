import Table from "./unguess_table";

type BugStatusParams = {
  bug_id?: number;
  custom_status_id?: number;
};

const defaultItem: BugStatusParams = {
  bug_id: 0,
  custom_status_id: 0,
};

class BugStatuses extends Table<BugStatusParams> {
  protected name = "wp_ug_bug_custom_status_to_bug";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "bug_id INTEGER NOT NULL UNIQUE",
    "custom_status_id INTEGER NOT NULL",
  ];
  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    await this.insert({
      bug_id: 1,
      custom_status_id: 1,
    });
  }
};

const bug_custom_statuses = new BugStatuses();
export default bug_custom_statuses;
export type { BugStatusParams };
