/** OPENAPI-CLASS: get-workspaces */
import { getGravatar } from "@src/utils/users";
import { formatCount } from "@src/utils/paginations";
import { tryber } from "@src/features/database";
import {
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
  fallBackCsmProfile,
} from "@src/utils/constants";
import {
  WorkspaceOrderBy,
  WorkspaceOrders,
} from "@src/utils/workspaces/getUserWorkspaces";
import UserRoute from "@src/features/routes/UserRoute";

interface GetWorkspacesArgs {
  limit: StoplightComponents["parameters"]["limit"];
  start: StoplightComponents["parameters"]["start"];
  orderBy: WorkspaceOrderBy;
  order: WorkspaceOrders;
}
type PaginationParams = {
  items: Array<any>;
  limit?: StoplightComponents["parameters"]["limit"] | string;
  start?: StoplightComponents["parameters"]["start"] | string;
  total: number;
};

export default class WorkspacesRoute extends UserRoute<{
  response: StoplightOperations["get-workspaces"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-workspaces"]["parameters"]["query"];
}> {
  protected csmProfiles: {
    [id: number]: StoplightComponents["schemas"]["Workspace"]["csm"];
  } = {};

  protected async prepare() {
    const parameters =
      this.getQuery() as StoplightOperations["get-workspaces"]["parameters"]["query"];
    try {
      console.log("parameters", parameters);
      const limit = parameters.limit
        ? parseInt(parameters.limit.toString())
        : LIMIT_QUERY_PARAM_DEFAULT;

      const start = parameters.start
        ? parseInt(parameters.start.toString())
        : START_QUERY_PARAM_DEFAULT;

      const order =
        parameters.order &&
        ["ASC", "DESC"].includes(parameters.order.toUpperCase())
          ? (parameters.order.toUpperCase() as "DESC" | "ASC")
          : "ASC";

      const orderBy =
        parameters.orderBy &&
        ["id", "company", "tokens"].includes(parameters.orderBy.toLowerCase())
          ? (parameters.orderBy.toLowerCase() as "id" | "company" | "tokens")
          : "id";

      let userWorkspaces = await this.getUserWorkspaces({
        limit,
        start,
        order,
        orderBy,
      });

      console.log("limit", limit);

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
        start,
        limit,
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

  protected paginateItems(data: PaginationParams) {
    let { items, limit, start, total } = data;

    return items.length
      ? {
          items,
          start,
          limit,
          size: items.length,
          total,
        }
      : this.emptyPaginatedResponse();
  }

  protected emptyPaginatedResponse() {
    return {
      items: [],
      start: 0,
      limit: 0,
      size: 0,
      total: 0,
    };
  }

  protected async getUserWorkspaces(args: GetWorkspacesArgs) {
    const { limit, start, order, orderBy } = args;
    let query = tryber.tables.WpAppqCustomer.do()
      .select(
        "wp_appq_customer.*",
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

    if (orderBy) {
      query = query.orderBy(`wp_appq_customer.${orderBy}`, `${order || "ASC"}`);
    }

    if (limit) {
      query = query
        .limit(limit)
        .offset(start ? start : START_QUERY_PARAM_DEFAULT);
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
    if (csm.id in this.csmProfiles) return this.csmProfiles[csm.id];

    let profilePic = await getGravatar(csm.email);
    if (profilePic) csm.picture = profilePic;
    this.csmProfiles[csm.id] = csm;

    return csm;
  }
}
