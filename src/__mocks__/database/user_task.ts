import Table from "./tryber_table";

type UserTaskParams = {
  id?: number;
  task_id?: number;
  tester_id?: number;
  is_completed?: number;
  creation_date?: string;
};

const defaultItem: UserTaskParams = {
  is_completed: 1,
};

class UserTask extends Table<UserTaskParams> {
  protected name = "wp_appq_user_task";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "tester_id INTEGER NOT NULL",
    "task_id INTEGER NOT NULL",
    "is_completed INTEGER NOT NULL",
    "creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
  ];
  constructor() {
    super(defaultItem);
  }
}

const userTask = new UserTask();
export default userTask;
export type { UserTaskParams };
