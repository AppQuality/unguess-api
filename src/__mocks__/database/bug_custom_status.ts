import Table from "./unguess_table";

type StatusParams = {
  id?: number;
  name?: string;
};

const defaultItem: StatusParams = {
  id: 0,
  name: "status",
};

class BugCustomStatuses extends Table<StatusParams> {
  protected name = "unguess_bug_custom_status";
  protected columns = ["id INTEGER PRIMARY KEY NOT NULL", "name VARCHAR(45)"];
  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    await this.insert({
      id: 1,
      name: "to do",
    });

    await this.insert({
      id: 2,
      name: "to be imported",
    });

    await this.insert({
      id: 3,
      name: "open",
    });

    await this.insert({
      id: 4,
      name: "pending",
    });

    await this.insert({
      id: 5,
      name: "to be retested",
    });

    await this.insert({
      id: 6,
      name: "solved",
    });

    await this.insert({
      id: 7,
      name: "not a bug",
    });
  }

  getDefaultItems() {
    return [
      {
        id: 1,
        name: "to do",
      },
      {
        id: 2,
        name: "to be imported",
      },
      {
        id: 3,
        name: "open",
      },
      {
        id: 4,
        name: "pending",
      },
      {
        id: 5,
        name: "to be retested",
      },
      {
        id: 6,
        name: "solved",
      },
      {
        id: 7,
        name: "not a bug",
      }
    ];
  };

  sortedDefaultItems(how?: 'ASC' | 'DESC') {
    return this.getDefaultItems().sort((t1, t2) => how === 'ASC' ? t1.id - t2.id : t2.id - t1.id)
  };
}
const bug_custom_status = new BugCustomStatuses();
export default bug_custom_status;
export type { StatusParams };