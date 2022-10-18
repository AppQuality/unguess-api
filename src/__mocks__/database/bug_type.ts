import Table from "./tryber_table";

type BugTypeParams = {
  id?: number;
  name?: string;
  description?: string;
  is_enabled?: boolean;
};

const defaultItem: BugTypeParams = {
  name: "???",
  description: "???",
};
class Types extends Table<BugTypeParams> {
  protected name = "wp_appq_evd_bug_type";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "name VARCHAR(45)",
    "description VARCHAR(512)",
    "is_enabled INT(1) NOT NULL DEFAULT 1",
  ];
  constructor() {
    super(defaultItem);
  }
}
const types = new Types();
export default types;
export type { BugTypeParams };
