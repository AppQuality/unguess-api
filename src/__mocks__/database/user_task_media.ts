import Table from "./tryber_table";

type UserTaskMediaParams = {
  id?: number;
  campaign_task_id?: number;
  user_task_id?: number;
  tester_id?: number;
  filename?: string;
  size?: number;
  location?: string;
  status?: number;
  favorite?: number;
  creation_date?: string;
};

const defaultItem: UserTaskMediaParams = {};
class UserTaskMedia extends Table<UserTaskMediaParams> {
  protected name = "wp_appq_user_task_media";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "campaign_task_id INTEGER NOT NULL",
    "user_task_id INTEGER NOT NULL",
    "tester_id INTEGER NOT NULL",
    "filename VARCHAR(128) DEFAULT '' NULL",
    "size INTEGER DEFAULT 0 NOT NULL",
    "location VARCHAR(128) NOT NULL",
    "status INTEGER DEFAULT 0 NOT NULL",
    "favorite INTEGER DEFAULT 0 NOT NULL",
    "creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
  ];
  constructor() {
    super(defaultItem);
  }
}

const userTaskMedia = new UserTaskMedia();
export default userTaskMedia;
export type { UserTaskMediaParams };
