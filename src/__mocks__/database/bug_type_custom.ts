import Table from "./tryber_table";

type CustomBugTypeParams = {
  id?: number;
  campaign_id?: number;
  bug_type_id?: number;
};

const defaultItem: CustomBugTypeParams = {
  id: 1,
  campaign_id: 1,
  bug_type_id: 1,
};
class CustomBugTypes extends Table<CustomBugTypeParams> {
  protected name = "wp_appq_additional_bug_types";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "campaign_id INTEGER",
    "bug_type_id INTEGER",
  ];
  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    await this.insert({
      id: 1,
      campaign_id: 1,
      bug_type_id: 1,
    });

    await this.insert({
      id: 2,
      campaign_id: 1,
      bug_type_id: 5,
    });
  }
}
const customBugTypes = new CustomBugTypes();
export default customBugTypes;
export type { CustomBugTypeParams };
