import * as db from "@src/features/db";

interface Sql {
  type: string;
}

export const createProject = async (
  project_request: StoplightComponents["requestBodies"]["Project"]["content"]["application/json"],
  user: UserType
): Promise<StoplightComponents["schemas"]["Project"]> => {
  // Define fields to be updated
  let project_fields = ["display_name", "customer_id", "edited_by"];

  // Define values from request body
  let project_values = [
    project_request.name as string,
    project_request.customer_id as number,
    user.profile_id as number,
  ];

  let insert_sql =
    `INSERT INTO wp_appq_project (` +
    project_fields.join(",") +
    `) VALUES (${project_values.map((value) =>
      typeof value === "string" ? "'" + value + "'" : value
    )})`;
  let insert_result = await db.query(insert_sql);

  let prj_id;
  if (insert_result.insertId) {
    // MySql
    prj_id = insert_result.insertId;
  } else if (insert_result.lastInsertRowid) {
    // Sqlite
    prj_id = insert_result.lastInsertRowid;
  }

  let project = await db.query(
    db.format(
      `SELECT 
        id,
        display_name,
        customer_id
        FROM wp_appq_project
        WHERE id = ?`,
      [prj_id]
    )
  );

  project = project[0];

  return {
    id: project.id,
    name: project.display_name,
    campaigns_count: 0,
  };
};
