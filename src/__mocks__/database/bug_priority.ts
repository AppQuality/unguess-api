import Table from "./unguess_table";

type BugPriorityParams = {
  bug_id?: number;
  priority_id?: number;
};

const defaultItem: BugPriorityParams = {
  bug_id: 0,
  priority_id: 0,
};
class BugPriorities extends Table<BugPriorityParams> {
  protected name = "wp_ug_priority_to_bug";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "bug_id INTEGER NOT NULL UNIQUE",
    "priority_id INTEGER NOT NULL",
  ];
  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    await this.insert({
      bug_id: 1,
      priority_id: 1,
    });
  }
}
const bug_priorities = new BugPriorities();
export default bug_priorities;
export type { BugPriorityParams };
