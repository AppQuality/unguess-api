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
    try {
      let userWorkspaces = await this.getUserWorkspaces();

      if (!userWorkspaces.workspaces.length) {
        return this.setSuccess(200, {
          items: [],
          start: 0,
          limit: 0,
          size: 0,
          total: 0,
        });
      }
      return this.setSuccess(200, {
        items: userWorkspaces.workspaces,
        start: this.start,
        limit: this.limit,
        size: userWorkspaces.workspaces.length,
        total: userWorkspaces.total,
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
        tryber.ref("wp_appq_customer.id"),
        tryber.ref("wp_appq_customer.company"),
        tryber.ref("wp_appq_customer.tokens"),
        tryber.ref("wp_appq_evd_profile.name").as("csmName"),
        tryber.ref("wp_appq_evd_profile.surname").as("csmSurname"),
        tryber.ref("wp_appq_evd_profile.email").as("csmEmail"),
        tryber.ref("wp_appq_evd_profile.id").as("csmProfileId"),
        tryber.ref("wp_appq_evd_profile.wp_user_id").as("csmTryberWpUserId"),
        tryber.ref("wp_users.user_url").as("csmUserUrl")
      )
      .join(
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

    try {
      if (
        this.getUser().role !== "administrator" &&
        (!this.getProfileId() || !this.getWordpressId("tryber"))
      )
        return { workspaces: [], total: 0 };

      const result = await query;

      const countResult = await countQuery;

      if (result.length)
        return {
          workspaces: await this.prepareResponse(result),
          total: formatCount(countResult),
        };

      return { workspaces: [], total: 0 };
    } catch (e) {
      //console.log(e.message);
      return { workspaces: [], total: 0 };
    }
  }

  protected async prepareResponse(customers: Array<any>) {
    let workspaces: StoplightComponents["schemas"]["Workspace"][] = [];

    for (const customer of customers) {
      let rawCsm = customer.pm_id
        ? {
            id: customer.pm_id,
            name: customer.csmName + " " + customer.csmSurname,
            email: customer.csmEmail,
            //???? role: "admin",
            profile_id: customer.csmProfileId,
            tryber_wp_user_id: customer.csmTryberWpUserId,
            ...(customer.csmUserUrl && { url: customer.csmUserUrl }),
          }
        : fallBackCsmProfile;

      let csm = await this.loadCsmData(rawCsm);

      workspaces.push({
        id: customer.id,
        company: customer.company,
        logo: customer.company_logo || "",
        tokens: customer.tokens,
        csm,
      });
    }

    return workspaces;
  }

  protected async loadCsmData(
    csm: StoplightComponents["schemas"]["Workspace"]["csm"]
  ) {
    const csmProfiles: {
      [id: number]: StoplightComponents["schemas"]["Workspace"]["csm"];
    } = {};

    if (csm.id in csmProfiles) return csmProfiles[csm.id];

    csmProfiles[csm.id] = csm;

    return csm;
  }
}
