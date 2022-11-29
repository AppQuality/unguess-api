import Table from "./tryber_table";

type BugReadStatusParams = {
  id?: number;
  wp_id?: number;
  bug_id?: number;
  is_read?: number;
  read_on?: string;
};

const defaultItem: BugReadStatusParams = {
  is_read: 1,
};
class ReadStatus extends Table<BugReadStatusParams> {
  protected name = "wp_appq_bug_read_status";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "wp_id INTEGER",
    "bug_id INTEGER",
    "is_read INTEGER DEFAULT 0",
    "read_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
  ];

  constructor() {
    super(defaultItem);
  }
}
const readStatus = new ReadStatus();
export default readStatus;
export type { BugReadStatusParams };
