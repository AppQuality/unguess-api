import * as db from "@src/features/db";
import WorkspaceRoute from "./WorkspaceRoute";
import { tryber } from "../database";

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

    if (pid) {
      this.project_id = Number.parseInt(pid);
    }

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
    if (!(await super.filter())) {
      // The user does not have access to the workspace
      return !!(await this.checkPrjAccess());
    }

    // The user has access to the workspace
    return true;
  }

  protected async checkPrjAccess(): Promise<boolean> {
    const hasAccess = await tryber.tables.WpAppqUserToProject.do()
      .select()
      .where({
        wp_user_id: this.getUser().tryber_wp_user_id || 0,
        project_id: this.getProjectId(),
      })
      .first();

    return !!hasAccess;
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
