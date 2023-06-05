// import { tryber, unguess } from "../database";
import UserRoute from "./UserRoute";
import * as db from "@src/features/db";
import WorkspaceRoute from "./WorkspaceRoute";

export default class ProjectRoute<
  T extends RouteClassTypes & {
    parameters: T["parameters"] & { pid: string };
  }
> extends WorkspaceRoute<T> {
  protected project_id: number;
  protected project: StoplightComponents["schemas"]["Project"] | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const { pid } = this.getParameters() as T["parameters"] & { pid: string };

    if (!pid) throw new Error("Missing project id");

    this.project_id = Number.parseInt(pid);
  }

  protected async init(): Promise<void> {
    if (isNaN(this.project_id)) {
      this.setError(400, {
        code: 400,
        message: "Invalid project id",
      } as OpenapiError);

      throw new Error("Invalid project id");
    }

    await this.initProject();

    if (!this.project) {
      this.setError(403, {
        code: 403,
        message: "Project not found or not accessible",
      } as OpenapiError);

      throw new Error("Project not found or not accessible");
    }

    this.workspace_id = this.project.workspaceId;
    await super.init();
  }

  protected async filter(): Promise<boolean> {
    const user = this.getUser();
    if (user.role === "administrator") return true;

    if (!(await super.filter())) {
      console.log(
        "filtering in project route, the user does NOT have access to the workspace"
      );

      return !!(await this.hasAccessToProject());
    } else {
      console.log(
        "filtering in project route, the user has access to the workspace"
      );
      return true;
    }
  }

  private async hasAccessToWorkspace(wid: number): Promise<boolean> {
    const workspaceSql = db.format(
      `SELECT * FROM wp_appq_user_to_customer u2c
        WHERE u2c.wp_user_id = ? AND u2c.customer_id = ?`,
      [this.getUser().tryber_wp_user_id, wid]
    );

    const access = await db.query(workspaceSql);

    return access.length > 0;
  }

  private async hasAccessToProject(): Promise<boolean> {
    const projectSql = db.format(
      `SELECT * FROM wp_appq_user_to_project u2p
        WHERE u2p.wp_user_id = ? AND u2p.project_id = ?`,
      [this.getUser().tryber_wp_user_id, this.project_id]
    );

    const access = await db.query(projectSql);

    return access.length > 0;
  }

  private async countProjectCampaigns(): Promise<number> {
    const campaignsCountSql =
      "SELECT COUNT(*) AS count FROM wp_appq_evd_campaign WHERE project_id = ?";
    const campaignsCount = await db.query(
      db.format(campaignsCountSql, [this.project_id])
    );

    return campaignsCount[0].count;
  }

  private async initProject() {
    try {
      // Check if project exists
      const user = this.getUser();

      const projectSql = db.format(
        `SELECT p.customer_id as wid, p.* FROM wp_appq_project p
          WHERE p.id = ?`,
        [this.project_id]
      );

      let project = await db.query(projectSql);

      if (!project.length)
        return this.setError(403, {
          code: 403,
          message: "Project not found or not accessible",
        } as OpenapiError);

      project = project[0] as {
        id: number;
        display_name: string;
        wid: number;
        customer_id: number;
        name: string;
      };

      this.workspace_id = project.wid;

      this.project = {
        id: project.id,
        name: project.display_name,
        campaigns_count: await this.countProjectCampaigns(),
        workspaceId: project.wid ?? -1,
      } as StoplightComponents["schemas"]["Project"];
    } catch (error) {
      return false;
    }
    return true;
  }

  protected getProjectId() {
    if (typeof this.project_id === "undefined")
      throw new Error("Invalid project");
    return this.project_id;
  }

  protected getProject() {
    if (!this.project) throw new Error("Invalid project");
    return this.project;
  }
}
