/** OPENAPI-CLASS: get-workspace */
import { tryber } from "@src/features/database";
import WorkspaceRoute from "@src/features/routes/WorkspaceRoute";
import { getGravatar } from "@src/utils/users";

export default class Route extends WorkspaceRoute<{
  response: StoplightOperations["get-workspace"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-workspace"]["parameters"]["path"];
}> {
  private countToInt(count?: string | number) {
    if (typeof count === "undefined") return 0;
    if (typeof count === "string") return Number.parseInt(count);

    return count;
  }
  private async getSharedProjects() {
    const projects = await tryber.tables.WpAppqUserToProject.do()
      .countDistinct({ total: "wp_appq_project.id" })
      .join(
        "wp_appq_project",
        "wp_appq_project.id",
        "wp_appq_user_to_project.project_id"
      )
      .join(
        "wp_appq_customer",
        "wp_appq_customer.id",
        "wp_appq_project.customer_id"
      )
      .where(
        "wp_appq_user_to_project.wp_user_id",
        this.getUser().tryber_wp_user_id
      )
      .andWhere("wp_appq_customer.id", this.getWorkspaceId())
      .first();

    return projects?.total ? this.countToInt(projects.total) : 0;
  }

  private async getSharedCampaigns() {
    const campaigns = await tryber.tables.WpAppqUserToCampaign.do()
      .countDistinct({ total: "wp_appq_evd_campaign.id" })
      .join(
        "wp_appq_evd_campaign",
        "wp_appq_evd_campaign.id",
        "wp_appq_user_to_campaign.campaign_id"
      )
      .join(
        "wp_appq_project",
        "wp_appq_project.id",
        "wp_appq_evd_campaign.project_id"
      )
      .join(
        "wp_appq_customer",
        "wp_appq_customer.id",
        "wp_appq_project.customer_id"
      )
      .where(
        "wp_appq_user_to_campaign.wp_user_id",
        this.getUser().tryber_wp_user_id
      )
      .andWhere("wp_appq_customer.id", this.getWorkspaceId())
      .first();

    return campaigns?.total ? this.countToInt(campaigns.total) : 0;
  }
  protected async hasSharedItems(): Promise<number> {
    const sharedProjects = await this.getSharedProjects();
    const sharedCampaigns = await this.getSharedCampaigns();

    return sharedProjects + sharedCampaigns;
  }

  protected async filter(): Promise<boolean> {
    const access = await this.checkWSAccess();

    if (!access) {
      const sharedItems = await this.hasSharedItems();
      if (sharedItems > 0 && this.workspace) {
        this.workspace = {
          ...this.workspace,
          isShared: true,
          sharedItems,
        };

        return true;
      }
      this.setError(403, {
        code: 403,
        message: "Workspace not found",
      } as OpenapiError);

      return false;
    }

    return true;
  }

  protected async prepare(): Promise<void> {
    if (this.workspace) {
      // Add CSM profile picture
      let profilePic = await getGravatar(this.workspace.csm.email);
      if (profilePic) this.workspace.csm.picture = profilePic;
    }

    this.setSuccess(200, this.workspace);
  }
}
