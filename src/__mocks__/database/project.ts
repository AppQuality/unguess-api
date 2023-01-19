import Table from "./tryber_table";

type ProjectParams = {
  id?: number;
  display_name?: string;
  customer_id?: number;
  last_edit?: string;
  created_on?: string;
  edited_by?: number;
};
const defaultItem: ProjectParams = {
  id: 1,
  display_name: "Nome del progetto abbastanza figo",
  created_on: "2017-07-20 00:00:00",
  last_edit: "2017-07-20 00:00:00",
  edited_by: 1,
};

class Projects extends Table<ProjectParams> {
  protected name = "wp_appq_project";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "display_name varchar(64)",
    "customer_id int(11)",
    "last_edit timestamp",
    "created_on timestamp",
    "edited_by int(11)",
  ];
  constructor() {
    super(defaultItem);
  }
}
const projects = new Projects();
export default projects;
export type { ProjectParams };

// Backward compatibility
const data = {
  basicProject: async (params: ProjectParams) => {
    return await projects.insert(params);
  },
};

export { data };
