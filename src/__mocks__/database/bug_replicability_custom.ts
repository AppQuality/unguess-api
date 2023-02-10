import Table from "./tryber_table";

type CustomBugReplicabilityParams = {
  id?: number;
  campaign_id?: number;
  bug_replicability_id?: number;
};

const defaultItem: CustomBugReplicabilityParams = {
  id: 1,
  campaign_id: 1,
  bug_replicability_id: 1,
};
class CustomReplicabilities extends Table<CustomBugReplicabilityParams> {
  protected name = "wp_appq_additional_bug_replicabilities";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "campaign_id INTEGER",
    "bug_replicability_id INTEGER",
  ];
  constructor() {
    super(defaultItem);
  }
}
const customReplicabilities = new CustomReplicabilities();
export default customReplicabilities;
export type { CustomBugReplicabilityParams };
