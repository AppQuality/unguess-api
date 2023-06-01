/** OPENAPI-CLASS: patch-projects-pid */
import * as db from "@src/features/db";
import { getProjectById } from "@src/utils/projects";
import ProjectRoute from "@src/features/routes/ProjectRoute";

const patchableFields = ["display_name"]; // Only allow these fields to be patched (for now)

interface iBody {
  [key: string]: string;
}

export default class Route extends ProjectRoute<{
  response: StoplightOperations["patch-projects-pid"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["patch-projects-pid"]["parameters"]["path"];
  body: StoplightOperations["patch-projects-pid"]["requestBody"]["content"]["application/json"];
}> {
  private requestBody: iBody = {};

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    this.setBody();
  }

  private setBody() {
    this.requestBody = this.getBody();
  }

  protected async prepare(): Promise<void> {
    // Check if the body contains allowed patchableFields
    const validData = Object.keys(this.requestBody)
      .filter((key) => patchableFields.includes(key))
      .reduce((obj: iBody, key) => {
        obj[key] = this.requestBody[key];
        return obj;
      }, {});

    const project = await getProjectById({
      user: this.getUser(),
      projectId: this.getProjectId(),
    });

    const changes = Object.keys(validData).map((key) =>
      db.format(`${key} = ?`, [validData[key]])
    );

    const updateQuery = db.format(
      `UPDATE wp_appq_project SET ${changes.join(",")} WHERE id = ?`,
      [project.id]
    );

    await db.query(updateQuery);

    return this.setSuccess(200, {
      ...project,
      name: validData.display_name,
    });
  }
}
