import Table from "./tryber_table";

type BugTagsParams = {
  id?: number;
  tag_id?: number;
  display_name?: string;
  slug?: string;
  bug_id?: number;
  campaign_id?: number;
  description?: string;
  author_wp_id?: number;
  author_tid?: number;
  creation_date?: string;
  is_public?: number;
};

const defaultItem: BugTagsParams = {
  tag_id: 0,
  display_name: "???",
  slug: "???",
  bug_id: 0,
  campaign_id: 0,
  description: "???",
};

class Tags extends Table<BugTagsParams> {
  protected name = "wp_appq_bug_taxonomy";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "tag_id INTEGER",
    "display_name VARCHAR(45)",
    "slug VARCHAR(200)",
    "bug_id INTEGER",
    "campaign_id INTEGER",
    "description VARCHAR(512)",
    "author_wp_id INTEGER DEFAULT 0",
    "author_tid INTEGER DEFAULT 0",
    "is_public INTEGER DEFAULT 1",
    "creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
  ];
  constructor() {
    super(defaultItem);
  }
}
const tags = new Tags();
export default tags;
export type { BugTagsParams };
