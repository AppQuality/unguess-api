import Table from "./tryber_table";

type BugMediaParams = {
  id?: number;
  type?: string;
  title?: string;
  description?: string;
  location?: string;
  bug_id?: number;
  uploaded?: string;
};

const defaultItem: BugMediaParams = {
  type: "image",
  title: "???",
  description: "???",
  location: "???",
};

class Media extends Table<BugMediaParams> {
  protected name = "wp_appq_evd_bug_media";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "type VARCHAR(45)",
    "title VARCHAR(45)",
    "description VARCHAR(45)",
    "location VARCHAR(256)",
    "bug_id int(11)",
    "uploaded datetime",
  ];
  constructor() {
    super(defaultItem);
  }
}
const media = new Media();
export default media;
export type { BugMediaParams };
