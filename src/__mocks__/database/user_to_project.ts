import Table from "./tryber_table";

type UserToProjectParams = {
  wp_user_id?: number;
  project_id?: number;
};
const defaultItem: UserToProjectParams = {
  wp_user_id: 1,
  project_id: 1,
};

class UserToProjects extends Table<UserToProjectParams> {
  protected name = "wp_appq_user_to_project";
  protected columns = ["wp_user_id int(11)", "project_id int(11)"];
  constructor() {
    super(defaultItem);
  }
}
const userToProjects = new UserToProjects();
export default userToProjects;
export type { UserToProjectParams };

// Backward compatibility
const data = {
  basicItem: async (params: UserToProjectParams) => {
    return await userToProjects.insert(params);
  },
};

export { data };
