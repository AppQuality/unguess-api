/** OPENAPI-CLASS: get-workspaces */
import { getGravatar } from "@src/utils/users";
import { formatCount } from "@src/utils/paginations";
import { tryber } from "@src/features/database";
import {
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
  fallBackCsmProfile,
} from "@src/utils/constants";
import UserRoute from "@src/features/routes/UserRoute";

export default class WorkspacesRoute extends UserRoute<{
  response: StoplightOperations["get-workspaces"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-workspaces"]["parameters"]["query"];
}> {
  private limit: StoplightComponents["parameters"]["limit"] =
    LIMIT_QUERY_PARAM_DEFAULT;
  private start: StoplightComponents["parameters"]["start"] =
    START_QUERY_PARAM_DEFAULT;
  private orderBy: "id" | "company" | "tokens" = "id";
  private order: "ASC" | "DESC" = "ASC";

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const parameters =
      this.getQuery() as StoplightOperations["get-workspaces"]["parameters"]["query"];

    this.limit = Number(parameters.limit) || LIMIT_QUERY_PARAM_DEFAULT;
    this.start = Number(parameters.start) || START_QUERY_PARAM_DEFAULT;

    this.order =
      parameters.order &&
      ["ASC", "DESC"].includes(parameters.order.toUpperCase())
        ? (parameters.order.toUpperCase() as "DESC" | "ASC")
        : "ASC";

    this.orderBy =
      parameters.orderBy &&
      ["id", "company", "tokens"].includes(parameters.orderBy.toLowerCase())
        ? (parameters.orderBy.toLowerCase() as "id" | "company" | "tokens")
        : "id";
  }

  protected async prepare() {
    const emptyResponse = {
      items: [],
      start: 0,
      limit: 0,
      size: 0,
      total: 0,
    };

    try {
      if (
        this.getUser().role !== "administrator" &&
        (!this.getProfileId() || !this.getWordpressId("tryber"))
      )
        return this.setSuccess(200, emptyResponse);

      const userWorkspaces = await this.getUserWorkspaces();
      const preparedWorkspaces = await this.prepareResponse(userWorkspaces);

      if (!preparedWorkspaces.workspaces.length) {
        return this.setSuccess(200, emptyResponse);
      }
      return this.setSuccess(200, {
        items: preparedWorkspaces.workspaces,
        start: this.start,
        limit: this.limit,
        size: preparedWorkspaces.workspaces.length,
        total: preparedWorkspaces.total,
      });
    } catch (e) {
      return this.setError(500, {
        code: 500,
        message: "Internal Server Error", //TODO: manage error
      } as OpenapiError);
    }
  }

  protected async getUserWorkspaces() {
    let query = tryber.tables.WpAppqCustomer.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_customer").as("workspaceId"),
        tryber.ref("company").withSchema("wp_appq_customer").as("companyName"),
        tryber.ref("tokens").withSchema("wp_appq_customer").as("tokens"),
        tryber.ref("pm_id").withSchema("wp_appq_customer").as("pmId"),
        tryber
          .ref("company_logo")
          .withSchema("wp_appq_customer")
          .as("companyLogo"),
        tryber.ref("name").withSchema("wp_appq_evd_profile").as("csmName"),
        tryber
          .ref("surname")
          .withSchema("wp_appq_evd_profile")
          .as("csmSurname"),
        tryber.ref("email").withSchema("wp_appq_evd_profile").as("csmEmail"),
        tryber.ref("id").withSchema("wp_appq_evd_profile").as("csmProfileId"),
        tryber
          .ref("wp_user_id")
          .withSchema("wp_appq_evd_profile")
          .as("csmTryberWpUserId"),
        tryber.ref("user_url").withSchema("wp_users").as("csmUserUrl")
      )
      .leftJoin(
        "wp_appq_user_to_customer",
        "wp_appq_customer.id",
        "wp_appq_user_to_customer.customer_id"
      )
      .leftJoin(
        "wp_appq_evd_profile",
        "wp_appq_customer.pm_id",
        "wp_appq_evd_profile.id"
      )
      .leftJoin("wp_users", "wp_appq_evd_profile.wp_user_id", "wp_users.ID")
      .groupBy("wp_appq_customer.id");

    if (this.getUser().role !== "administrator") {
      query = query.where(
        "wp_appq_user_to_customer.wp_user_id",
        this.getWordpressId("tryber") ? this.getWordpressId("tryber") : 0
      );
    }

    if (this.orderBy) {
      query = query.orderBy(
        `wp_appq_customer.${this.orderBy}`,
        `${this.order || "ASC"}`
      );
    }

    if (this.limit) {
      query = query
        .limit(this.limit)
        .offset(this.start ? this.start : START_QUERY_PARAM_DEFAULT);
    }

    return await query;
  }

  protected async getWorkspacesFromSharedItems(
    workspaces: Awaited<ReturnType<typeof this.getUserWorkspaces>>
  ) {
    //If user is administrator, we don't need to search for shared projects
    if (this.getUser().role === "administrator") return [];

    //Search for shared projects
    const wsFromProjects = await this.getWorkspacesFromProjects();
    const wsFromCampaigns = await this.getWorkspacesFromCampaigns();

    let shared = [...wsFromProjects, ...wsFromCampaigns];
    if (wsFromProjects.length && wsFromCampaigns.length) {
      const uniqueWorkspaces = Array.from(
        new Set(shared.map((ws) => ws.workspaceId))
      ).map((workspaceId) => {
        const objectsWithWorkspaceId = shared.filter(
          (ws) => ws.workspaceId === workspaceId
        );
        const sumOfSharedItems = objectsWithWorkspaceId.reduce(
          (sum, obj) => sum + obj.total,
          0
        );
        return { ...objectsWithWorkspaceId[0], total: sumOfSharedItems };
      });

      shared = uniqueWorkspaces;
    }

    //Merge shared workspaces from projects and campaigns with user workspaces
    const wp_ids: Array<number> = workspaces.map((w) => w.workspaceId);

    // Remove duplicated workspaces from sharedWorkspaces
    const filteredSharedWorkspaces = shared.filter(
      (w) => !wp_ids.includes(w.workspaceId)
    );

    return filteredSharedWorkspaces;
  }

  private async getWorkspacesFromProjects() {
    const workspaces = await tryber.tables.WpAppqUserToProject.do()
      .select(
        tryber.ref("wp_appq_customer.id").as("workspaceId"),
        tryber.ref("wp_appq_customer.company").as("companyName"),
        tryber.ref("wp_appq_customer.tokens").as("tokens"),
        tryber.ref("wp_appq_customer.pm_id").as("pmId"),
        tryber.ref("wp_appq_customer.company_logo").as("companyLogo"),
        tryber.ref("wp_appq_evd_profile.name").as("csmName"),
        tryber.ref("wp_appq_evd_profile.surname").as("csmSurname"),
        tryber.ref("wp_appq_evd_profile.email").as("csmEmail"),
        tryber.ref("wp_appq_evd_profile.id").as("csmProfileId"),
        tryber.ref("wp_appq_evd_profile.wp_user_id").as("csmTryberWpUserId"),
        tryber.ref("wp_users.user_url").as("csmUserUrl")
      )
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
      .leftJoin(
        "wp_appq_evd_profile",
        "wp_appq_customer.pm_id",
        "wp_appq_evd_profile.id"
      )
      .leftJoin("wp_users", "wp_appq_evd_profile.wp_user_id", "wp_users.ID")
      .where(
        "wp_appq_user_to_project.wp_user_id",
        this.getUser().tryber_wp_user_id
      )
      .groupBy("wp_appq_customer.id");

    return workspaces.length
      ? workspaces.map((ws) => ({
          ...ws,
          total: this.countToInt(ws.total),
        }))
      : [];
  }

  private async getWorkspacesFromCampaigns() {
    const workspaces = await tryber.tables.WpAppqUserToCampaign.do()
      .select(
        tryber.ref("wp_appq_customer.id").as("workspaceId"),
        tryber.ref("wp_appq_customer.company").as("companyName"),
        tryber.ref("wp_appq_customer.tokens").as("tokens"),
        tryber.ref("wp_appq_customer.pm_id").as("pmId"),
        tryber.ref("wp_appq_customer.company_logo").as("companyLogo"),
        tryber.ref("wp_appq_evd_profile.name").as("csmName"),
        tryber.ref("wp_appq_evd_profile.surname").as("csmSurname"),
        tryber.ref("wp_appq_evd_profile.email").as("csmEmail"),
        tryber.ref("wp_appq_evd_profile.id").as("csmProfileId"),
        tryber.ref("wp_appq_evd_profile.wp_user_id").as("csmTryberWpUserId"),
        tryber.ref("wp_users.user_url").as("csmUserUrl")
      )
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
      .leftJoin(
        "wp_appq_evd_profile",
        "wp_appq_customer.pm_id",
        "wp_appq_evd_profile.id"
      )
      .leftJoin("wp_users", "wp_appq_evd_profile.wp_user_id", "wp_users.ID")
      .where(
        "wp_appq_user_to_campaign.wp_user_id",
        this.getUser().tryber_wp_user_id
      )
      .groupBy("wp_appq_customer.id");

    return workspaces.length
      ? workspaces.map((ws) => ({
          ...ws,
          total: this.countToInt(ws.total),
        }))
      : [];
  }

  private countToInt(count?: string | number) {
    if (typeof count === "undefined") return 0;
    if (typeof count === "string") return Number.parseInt(count);

    return count;
  }

  private async getTotalWorkspaces() {
    let countQuery = tryber.tables.WpAppqCustomer.do()
      .countDistinct("wp_appq_customer.id as count")
      .join(
        "wp_appq_user_to_customer",
        "wp_appq_customer.id",
        "wp_appq_user_to_customer.customer_id"
      )
      .leftJoin(
        "wp_appq_evd_profile",
        "wp_appq_customer.pm_id",
        "wp_appq_evd_profile.id"
      );

    if (this.getUser().role !== "administrator") {
      countQuery = countQuery.where(
        "wp_appq_user_to_customer.wp_user_id",
        this.getWordpressId("tryber") ? this.getWordpressId("tryber") : 0
      );
    }

    const total = await countQuery;

    return formatCount(total);
  }

  protected async prepareResponse(
    rawWorkspaces: Awaited<ReturnType<typeof this.getUserWorkspaces>>
  ) {
    try {
      const sharedWorkspaces = await this.getWorkspacesFromSharedItems(
        rawWorkspaces
      );

      const results = [...rawWorkspaces, ...sharedWorkspaces];

      const countResult = await this.getTotalWorkspaces();

      if (results.length) {
        let workspaces: StoplightComponents["schemas"]["Workspace"][] = [];

        // Prepare csm object to be returned
        for (const workspace of results) {
          const csm = workspace.pmId
            ? {
                id: workspace.pmId,
                name: workspace.csmName + " " + workspace.csmSurname,
                email: workspace.csmEmail,
                profile_id: workspace.csmProfileId,
                tryber_wp_user_id: workspace.csmTryberWpUserId,
                ...(workspace.csmUserUrl && { url: workspace.csmUserUrl }),
              }
            : fallBackCsmProfile;

          workspaces.push({
            id: workspace.workspaceId,
            company: workspace.companyName,
            logo: workspace.companyLogo || "",
            tokens: workspace.tokens,
            csm,
            isShared: "total" in workspace || false,
            sharedItems: "total" in workspace ? workspace.total : 0,
          } as StoplightComponents["schemas"]["Workspace"]);
        }

        return {
          workspaces,
          total: countResult + sharedWorkspaces.length,
        };
      }

      return { workspaces: [], total: 0 };
    } catch (e) {
      return { workspaces: [], total: 0 };
    }
  }
}
