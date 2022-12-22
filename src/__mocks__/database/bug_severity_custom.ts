import Table from "./tryber_table";

type CustomBugSeverityParams = {
  id?: number;
  campaign_id?: number;
  bug_severity_id?: number;
};

const defaultItem: CustomBugSeverityParams = {
  id: 1,
  campaign_id: 1,
  bug_severity_id: 1,
};
class CustomSeverities extends Table<CustomBugSeverityParams> {
  protected name = "wp_appq_additional_bug_severities";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "campaign_id INTEGER",
    "bug_severity_id INTEGER",
  ];
  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    await this.insert({
      id: 1,
      campaign_id: 1,
      bug_severity_id: 1,
    });

    await this.insert({
      id: 2,
      campaign_id: 1,
      bug_severity_id: 4,
    });
  }
}
const customSeverities = new CustomSeverities();
export default customSeverities;
export type { CustomBugSeverityParams };
