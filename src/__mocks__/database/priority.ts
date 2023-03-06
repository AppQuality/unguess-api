import Table from "./unguess_table";

type PriorityParams = {
  id?: number;
  name?: string;
};

const defaultItem: PriorityParams = {
  id: 0,
  name: "priority",
};

class Priorities extends Table<PriorityParams> {
  protected name = "wp_ug_priority";
  protected columns = ["id INTEGER PRIMARY KEY NOT NULL", "name VARCHAR(45)"];
  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    await this.insert({
      id: 1,
      name: "lowest",
    });

    await this.insert({
      id: 2,
      name: "low",
    });

    await this.insert({
      id: 3,
      name: "medium",
    });

    await this.insert({
      id: 4,
      name: "high",
    });

    await this.insert({
      id: 5,
      name: "highest",
    });
  }

  getDefaultItems() {
    return [
      {
        id: 1,
        name: "lowest",
      },
      {
        id: 2,
        name: "low",
      },
      {
        id: 3,
        name: "medium",
      },
      {
        id: 4,
        name: "high",
      },
      {
        id: 5,
        name: "highest",
      },
    ];
  }
}
const priorities = new Priorities();
export default priorities;
export type { PriorityParams };
