import Table from "./unguess_table";

type CustomStatusPhaseParams = {
  id?: number;
  name?: string;
  phase_id?: number;
  color?: string;
  is_default?: number;
};

const defaultItem: CustomStatusPhaseParams = {
  id: 1,
  name: "working",
};

const defaultCustomStatusPhases = [
  {
    id: 1,
    name: "working",
  },
  {
    id: 2,
    name: "completed",
  },
];

class CustomStatusPhases extends Table<CustomStatusPhaseParams> {
  protected name = "wp_ug_bug_custom_status_phase";
  protected columns = ["id INTEGER PRIMARY KEY NOT NULL", "name VARCHAR(45)"];
  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    defaultCustomStatusPhases.forEach(async (customStatusPhase) => {
      await this.insert({
        id: customStatusPhase.id,
        name: customStatusPhase.name,
      });
    });
  }

  getDefaultItems() {
    return defaultCustomStatusPhases;
  }
}
const priorities = new CustomStatusPhases();
export default priorities;
export type { CustomStatusPhaseParams };
