import Table from "./unguess_table";

type CustomStatusParams = {
  id?: number;
  name?: string;
  phase_id?: number;
  color?: string;
  is_default?: number;
};

const defaultItem: CustomStatusParams = {
  id: 0,
  name: "custom_status",
  phase_id: 1,
  color: "ffffff",
  is_default: 1,
};

const defaultCustomStatuses = [
  {
    id: 1,
    name: "to do",
    phase: {
      id: 1,
      name: "working",
    },
    color: "ffffff",
    is_default: 1,
  },
  {
    id: 2,
    name: "pending",
    phase: {
      id: 1,
      name: "working",
    },
    color: "ffffff",
    is_default: 1,
  },
  {
    id: 3,
    name: "to be imported",
    phase: {
      id: 1,
      name: "working",
    },
    color: "ffffff",
    is_default: 1,
  },
  {
    id: 4,
    name: "open",
    phase: {
      id: 1,
      name: "working",
    },
    color: "ffffff",
    is_default: 1,
  },
  {
    id: 5,
    name: "to be retested",
    phase: {
      id: 1,
      name: "working",
    },
    color: "ffffff",
    is_default: 1,
  },
  {
    id: 6,
    name: "solved",
    phase: {
      id: 2,
      name: "completed",
    },
    color: "ffffff",
    is_default: 1,
  },
  {
    id: 7,
    name: "not a bug",
    phase: {
      id: 2,
      name: "completed",
    },
    color: "ffffff",
    is_default: 1,
  },
  {
    id: 8,
    name: "under IT analysis",
    phase: {
      id: 1,
      name: "working",
    },
    color: "ffffff",
    is_default: 1,
  },
];

class CustomStatuses extends Table<CustomStatusParams> {
  protected name = "wp_ug_bug_custom_status";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "name VARCHAR(45)",
    "phase_id INTEGER",
    "color VARCHAR(45)",
    "campaign_id INTEGER",
    "is_default INTEGER DEFAULT 0",
    "created_at DATETIME",
    "updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP",
  ];
  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    defaultCustomStatuses.forEach(async (customStatus) => {
      await this.insert({
        id: customStatus.id,
        name: customStatus.name,
        phase_id: customStatus.phase.id,
        color: customStatus.color,
        is_default: customStatus.is_default,
      });
    });
  }

  getDefaultItems() {
    return defaultCustomStatuses;
  }
}
const priorities = new CustomStatuses();
export default priorities;
export type { CustomStatusParams };
