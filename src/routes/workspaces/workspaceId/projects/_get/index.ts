/** OPENAPI-CLASS: get-workspace-projects */
import * as db from "@src/features/db";
import { formatCount } from "@src/utils/paginations";
import {
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import WorkspaceRoute from "@src/features/routes/WorkspaceRoute";

export default class Route extends WorkspaceRoute<{
  response: StoplightOperations["get-workspace-projects"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-workspace-projects"]["parameters"]["path"];
  query: StoplightOperations["get-workspace-projects"]["parameters"]["query"];
}> {
  private limit: number = LIMIT_QUERY_PARAM_DEFAULT;
  private start: number = START_QUERY_PARAM_DEFAULT;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const query = this.getQuery();
    if (query.limit) this.limit = parseInt(query.limit as unknown as string);
    if (query.start) this.start = parseInt(query.start as unknown as string);
  }

  protected async prepare(): Promise<void> {
    const projects = await this.getProjects();

    const total = await this.getProjectsCount();

    const enhancedProjects = await this.formatProjects(projects);

    return this.setSuccess(200, {
      items: enhancedProjects,
      start: this.start,
      limit: this.limit,
      size: enhancedProjects.length,
      total,
    });
  }

  protected async getProjects(): Promise<
    {
      id: number;
      display_name: string;
      customer_id: number;
    }[]
  > {
    let projectSql = `SELECT id, display_name, customer_id FROM wp_appq_project WHERE customer_id = ? ORDER BY id`;

    if (this.limit) {
      projectSql += ` LIMIT ${this.limit} OFFSET ${this.start}`;
    }

    return await db.query(db.format(projectSql, [this.getWorkspaceId()]));
  }

  protected async getProjectsCount(): Promise<number> {
    const countQuery = `SELECT COUNT(*) as count FROM wp_appq_project WHERE customer_id = ?`;
    let total = await db.query(db.format(countQuery, [this.getWorkspaceId()]));
    total = formatCount(total);

    return total;
  }

  protected async formatProjects(
    projects: {
      id: number;
      display_name: string;
      customer_id: number;
    }[]
  ): Promise<StoplightComponents["schemas"]["Project"][]> {
    let returnProjects: StoplightComponents["schemas"]["Project"][] = [];
    for (const project of projects) {
      if (this.getUser().role !== "administrator") {
        // Check if user can see this project
        let hasPermission = false;
        const userToProjectSql =
          "SELECT * FROM wp_appq_user_to_project WHERE project_id = ? AND wp_user_id = ?";
        let userToProjectRows: Array<{
          wp_user_id: number;
          project_id: number;
        }> = await db.query(
          db.format(userToProjectSql, [project.id, this.getUserId()])
        );

        if (userToProjectRows.length) {
          hasPermission = true;
        }

        if (!hasPermission) {
          continue;
        }
      }

      let item: StoplightComponents["schemas"]["Project"] = {
        id: project.id,
        name: project.display_name,
        campaigns_count: await this.getCampaignsCount(project.id),
        workspaceId: Number(project.customer_id),
      };

      returnProjects.push(item);
    }

    return returnProjects;
  }

  protected async getCampaignsCount(projectId: number): Promise<number> {
    const campaignSql =
      "SELECT COUNT(*) AS count FROM wp_appq_evd_campaign WHERE project_id = ?";
    const result = await db.query(db.format(campaignSql, [projectId]));

    return result[0].count;
  }
}
