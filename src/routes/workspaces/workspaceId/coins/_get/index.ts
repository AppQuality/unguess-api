/** OPENAPI-CLASS: get-workspaces-coins */
import { fallBackCsmProfile } from "@src/utils/constants";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import { getGravatar } from "@src/utils/users/getGravatar";
import { getTotalCoins } from "@src/utils/workspaces";
import { tryber, unguess } from "@src/features/database";
import UserRoute from "@src/features/routes/UserRoute";

export default class GetWorkspaceCoinsRoute extends UserRoute<{
  response: StoplightOperations["get-workspaces-coins"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-workspaces-coins"]["parameters"]["path"];
}> {
  private limit: StoplightComponents["parameters"]["limit"] =
    LIMIT_QUERY_PARAM_DEFAULT;
  private start: StoplightComponents["parameters"]["start"] =
    START_QUERY_PARAM_DEFAULT;
  private orderBy: "id" | "customer_id" | "amount" | "price" | "agreement_id" =
    "id";
  private order: "ASC" | "DESC" = "DESC";

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
        : "DESC";

    this.orderBy =
      parameters.orderBy &&
      ["id", "customer_id", "amount", "price", "agreement_id"].includes(
        parameters.orderBy.toLowerCase()
      )
        ? (parameters.orderBy.toLowerCase() as
            | "id"
            | "customer_id"
            | "amount"
            | "price"
            | "agreement_id")
        : "id";
  }

  protected async prepare() {
    try {
      let wid = Number(this.getParameters().wid);

      const ws = await this.getWorkspace();

      if (!ws) {
        return this.setError(403, {
          code: 403,
          message: "Internal Server Error", //TODO: manage error
        } as OpenapiError);
      }

      const coins = await this.getWorkspaceCoins();

      const countQuery = await unguess.tables.WpUgCoins.do()
        .count({ count: "id" })
        .where("customer_id", wid)
        .first();

      const total = countQuery?.count ? countQuery.count : 0;

      let paginatedCoins = {};

      coins.length
        ? (paginatedCoins = {
            items: prepareResponse(coins),
            start: this.start,
            limit: this.limit,
            size: coins.length,
            total,
          })
        : (paginatedCoins = {
            items: [],
            start: 0,
            limit: 0,
            size: 0,
            total: 0,
          });

      return this.setSuccess(200, paginatedCoins);
    } catch (e) {
      return this.setError(500, {
        code: 500,
        message: "Internal Server Error", //TODO: manage error
      } as OpenapiError);
    }
  }

  protected async loadCsmData(
    csm: StoplightComponents["schemas"]["Workspace"]["csm"]
  ) {
    let profilePic = await getGravatar(csm.email);
    if (profilePic) csm.picture = profilePic;

    return csm;
  }

  protected async getWorkspace() {
    let error = {
      message: ERROR_MESSAGE + " with workspace",
      error: true,
    } as StoplightComponents["schemas"]["Error"];

    const workspaceId = Number(this.getParameters().wid);
    // Check parameters
    if (workspaceId == null || Number.isNaN(workspaceId) || workspaceId < 1)
      this.setError(400, {
        code: 400,
        message: "WorkspaceId not found", //TODO: manage error
      } as OpenapiError);

    if (this.getUser().role !== "administrator")
      if (this.getUser().id == null || this.getUser().id <= 0)
        throw { ...error, code: 400 };

    // Check if workspace exists

    const customerSql = tryber.tables.WpAppqCustomer.do()
      .select(
        "wp_appq_customer.*",
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
        "wp_appq_evd_profile",
        "wp_appq_evd_profile.id",
        "wp_appq_customer.pm_id"
      )
      .leftJoin("wp_users", "wp_users.ID", "wp_appq_evd_profile.wp_user_id")
      .where("wp_appq_customer.id", workspaceId)
      .first();

    let workspace = await customerSql;

    if (workspace) {
      if (this.getUser().role !== "administrator") {
        // Check if user has permission to get the customer

        const userToCustomerSql = tryber.tables.WpAppqUserToCustomer.do()
          .select()
          .where("wp_user_id", this.getUser().id || 0)
          .where("customer_id", workspaceId)
          .first();

        let userToCustomer = await userToCustomerSql;

        if (!userToCustomer) {
          throw { ...error, message: "workspace issue", code: 403 };
        }
      }

      //Add CSM info

      let rawCsm = workspace.pm_id
        ? {
            id: workspace.pm_id,
            name: workspace.csmName + " " + workspace.csmSurname,
            email: workspace.csmEmail,
            profile_id: workspace.csmProfileId,
            tryber_wp_user_id: workspace.csmTryberWpUserId,
            ...(workspace.csmUserUrl && { url: workspace.csmUserUrl }),
          }
        : fallBackCsmProfile;

      let csm = await this.loadCsmData(rawCsm);

      // Get workspace's express coins
      const coins = await this.getWorkspaceCoins();

      // Get total coins amount
      const totalCoins = await getTotalCoins(coins);

      return {
        id: workspace.id,
        company: workspace.company,
        tokens: workspace.tokens,
        ...(workspace.company_logo && { logo: workspace.company_logo }),
        csm: csm,
        coins: totalCoins,
      } as StoplightComponents["schemas"]["Workspace"];
    }

    return false;
  }

  protected async getWorkspaceCoins() {
    const workspaceId = Number(this.getParameters().wid);
    // Check parameters
    if (workspaceId == null || workspaceId <= 0)
      throw { error: true, message: "Something went wrong", code: 400 };

    // Retrieve coins packages

    let query = unguess.tables.WpUgCoins.do()
      .select()
      .where("customer_id", workspaceId)
      .where("amount", ">", 0);

    if (this.order && this.orderBy) {
      query = query.orderBy(this.orderBy, this.order);
    }

    if (this.limit || this.start) {
      query = query.limit(this.limit || 10).offset(this.start || 0);
    }

    let packages = await query;

    return packages.length ? packages : [];
  }
}

const prepareResponse = (
  coins: any[]
): StoplightComponents["schemas"]["Coin"][] => {
  return coins.map((coin) => {
    return {
      id: coin.id,
      customer_id: coin.customer_id,
      amount: coin.amount,
      price: coin.price,
      ...(coin.agreement_id && { agreement_id: coin.agreement_id }),
      ...(coin.created_on && { created_on: coin.created_on.toString() }),
      ...(coin.updated_on && { updated_on: coin.updated_on.toString() }),
    };
  });
};
