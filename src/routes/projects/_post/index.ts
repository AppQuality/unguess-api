/** OPENAPI-CLASS: post-projects */
import * as db from "@src/features/db";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getWorkspace } from "@src/utils/workspaces";
import { createProject } from "@src/utils/projects";
import UserRoute from "@src/features/routes/UserRoute";

export default class Route extends UserRoute<{
  body: StoplightOperations["post-projects"]["requestBody"]["content"]["application/json"];
  response: StoplightOperations["post-projects"]["responses"]["200"]["content"]["application/json"];
}> {
  private workspaceId: number;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const body = this.getBody();
    const { customer_id: workspaceId } = body;

    this.workspaceId = workspaceId;
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;

    if (this.isAdmin()) return true;

    if (
      !(await this.hasPermission()) ||
      !(await getWorkspace({
        workspaceId: this.workspaceId,
        user: this.getUser(),
      }))
    ) {
      this.setError(403, {
        code: 400,
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }

    return true;
  }

  protected isAdmin() {
    return this.getUser().role === "administrator";
  }

  protected async prepare() {
    const project = await createProject(this.getBody(), this.getUser());
    return this.setSuccess(200, project);
  }

  protected async hasPermission() {
    const workspaceSql = db.format(
      `SELECT * FROM wp_appq_user_to_customer
        WHERE wp_user_id = ? AND customer_id = ?`,
      [this.getUser().tryber_wp_user_id, this.workspaceId]
    );

    const access = await db.query(workspaceSql);

    return access.length > 0;
  }
}
