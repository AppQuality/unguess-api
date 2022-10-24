import Table from "./tryber_table";

type CampaingAdditionalFieldsDataParams = {
  bug_id?: number;
  type_id?: number;
  value?: string;
};

const defaultItem: CampaingAdditionalFieldsDataParams = {
  value: "???",
};

class AdditionalFieldsData extends Table<CampaingAdditionalFieldsDataParams> {
  protected name = "wp_appq_campaign_additional_fields_data";
  protected columns = [
    "bug_id INTEGER NOT NULL",
    "type_id INTEGER NOT NULL",
    "value VARCHAR(128)",
  ];
  constructor() {
    super(defaultItem);
  }
}
const additionalFieldsData = new AdditionalFieldsData();
export default additionalFieldsData;
export type { CampaingAdditionalFieldsDataParams };
