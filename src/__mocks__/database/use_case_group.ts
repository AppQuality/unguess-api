import Table from "./tryber_table";

type UseCaseGroupParams = {
  task_id: number;
  group_id: number;
};

const defaultItem: UseCaseGroupParams = {
  task_id: -1,
  group_id: 0,
};

class UseCaseGroup extends Table<UseCaseGroupParams> {
  protected name = "wp_appq_campaign_task_group";
  protected columns = ["task_id int(11)", "group_id int(11)"];
  constructor() {
    super(defaultItem);
  }
}
const useCaseGroup = new UseCaseGroup();
export default useCaseGroup;
export type { UseCaseGroupParams };
