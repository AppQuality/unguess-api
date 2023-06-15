import { tryber, unguess } from "../database";
import UserRoute from "./UserRoute";
import { fallBackCsmProfile } from "@src/utils/constants";

export default class WorkspaceRoute<
  T extends RouteClassTypes & {
    parameters: T["parameters"] & { wid: string };
  }
> extends UserRoute<T> {
  protected workspace_id: number | undefined;
  protected workspace: StoplightComponents["schemas"]["Workspace"] | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const { wid } = this.getParameters() as T["parameters"] & { wid: string };

    if (wid) {
      this.workspace_id = Number.parseInt(wid);
    }
  }

  protected async init(): Promise<void> {
    await super.init();

    if (!this.workspace_id || isNaN(this.workspace_id)) {
      this.setError(400, {
        code: 400,
        message: "Invalid workspace id",
      } as OpenapiError);

      throw new Error("Invalid workspace id");
    }

    await this.initWorkspace();

    if (!this.workspace) {
      this.setError(403, {
        code: 403,
        message: "Workspace not found",
      } as OpenapiError);

      throw new Error("Workspace not found");
    }
  }

  protected async checkWSAccess(): Promise<boolean> {
    const user = this.getUser();
    if (user.role === "administrator") return true;

    // Check if user has permission to get the customer
    const hasAccess = await tryber.tables.WpAppqUserToCustomer.do()
      .select()
      .where({
        wp_user_id: user.tryber_wp_user_id || 0,
        customer_id: this.getWorkspaceId(),
      })
      .first();

    return !!hasAccess;
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;

    const access = await this.checkWSAccess();

    if (!access) {
      this.setError(403, {
        code: 403,
        message: "Workspace not found",
      } as OpenapiError);

      return false;
    }

    return true;
  }

  private async initWorkspace() {
    try {
      // Check if workspace exists
      const workspace = await tryber.tables.WpAppqCustomer.do()
        .select(
          tryber.ref("id").withSchema("wp_appq_customer"),
          "company",
          "tokens",
          "company_logo",
          "pm_id",
          tryber
            .ref("wp_user_id")
            .withSchema("wp_appq_evd_profile")
            .as("csmTryberWpUserId"),
          tryber.ref("name").withSchema("wp_appq_evd_profile").as("csmName"),
          tryber
            .ref("surname")
            .withSchema("wp_appq_evd_profile")
            .as("csmSurname"),
          tryber.ref("email").withSchema("wp_appq_evd_profile").as("csmEmail"),
          tryber.ref("user_url").withSchema("wp_users").as("csmUserUrl")
        )
        .leftJoin(
          "wp_appq_evd_profile",
          "wp_appq_evd_profile.id",
          "wp_appq_customer.pm_id"
        )
        .leftJoin("wp_users", "wp_users.ID", "wp_appq_evd_profile.wp_user_id")
        .where("wp_appq_customer.id", this.getWorkspaceId())
        .first();

      if (workspace) {
        //Add CSM info
        const csm = workspace.csmEmail
          ? {
              id: workspace.pm_id,
              name: workspace.csmName + " " + workspace.csmSurname,
              email: workspace.csmEmail,
              profile_id: workspace.pm_id,
              tryber_wp_user_id: workspace.csmTryberWpUserId,
              ...(workspace.csmUserUrl && { url: workspace.csmUserUrl }),
            }
          : fallBackCsmProfile;

        // Get workspace's express coins
        const coins = await this.getCoins();

        this.workspace = {
          id: workspace.id,
          company: workspace.company,
          tokens: workspace.tokens,
          ...(workspace.company_logo && { logo: workspace.company_logo }),
          csm: csm,
          coins: coins,
        } as StoplightComponents["schemas"]["Workspace"];
      }
    } catch (error) {
      return false;
    }
    return true;
  }

  protected async getCoins() {
    const coins = await unguess.tables.WpUgCoins.do()
      .sum({ total: "amount" })
      .where({
        customer_id: this.getWorkspaceId(),
      })
      .groupBy("customer_id")
      .first();

    return coins?.total || 0;
  }

  protected getWorkspaceId() {
    if (typeof this.workspace_id === "undefined")
      throw new Error("Invalid workspace");
    return this.workspace_id;
  }

  protected getWorkspace() {
    if (!this.workspace) throw new Error("Invalid workspace");
    return this.workspace;
  }

  protected async getSharedProjects() {
    const projects = await tryber.tables.WpAppqUserToProject.do()
      .select("project_id")
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
      .groupBy("project_id");

    return projects.map((p) => p.project_id);
  }

  protected async getSharedCampaigns() {
    const campaigns = await tryber.tables.WpAppqUserToCampaign.do()
      .select("campaign_id")
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
      .groupBy("campaign_id");

    return campaigns.map((c) => c.campaign_id);
  }
}
