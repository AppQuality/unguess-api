import Table from "./unguess_table";

type CustomStatusParams = {
  id?: number;
  name?: string;
};

const defaultItem: CustomStatusParams = {
  id: 0,
  name: "custom_status",
};

const defaultCustomStatuses = [
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
    name: "solved",
  },
  {
    id: 6,
    name: "not a bug",
  },
];

class CustomStatuses extends Table<CustomStatusParams> {
  protected name = "wp_ug_bug_custom_status";
  protected columns = ["id INTEGER PRIMARY KEY NOT NULL", "name VARCHAR(45)"];
  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    defaultCustomStatuses.forEach(async (customStatus) => {
      await this.insert(customStatus);
    });
  }

  getDefaultItems() {
    return defaultCustomStatuses;
  }
}
const priorities = new CustomStatuses();
export default priorities;
export type { CustomStatusParams };
