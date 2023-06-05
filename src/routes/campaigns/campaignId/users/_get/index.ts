/** OPENAPI-CLASS: get-campaign-users */
import { tryber } from "@src/features/database";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import CampaignRoute from "@src/features/routes/CampaignRoute";

interface DbUser {
  tryber_wp_id: number;
  profile_id: number;
  name: string;
  surname: string;
  email: string;
  invitation_status: string;
}

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaign-users"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaign-users"]["parameters"]["path"];
  query: StoplightOperations["get-campaign-users"]["parameters"]["query"];
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
    let users;
    try {
      users = await this.getUsers();
    } catch (e: any) {
      return this.setError(500, {
        message: e.message || ERROR_MESSAGE,
        status_code: 500,
      } as OpenapiError);
    }

    if (!users || !users.length) return this.emptyResponse();

    const enhancedUsers = this.enhanceUsers(users);
    const paginated = this.paginateUsers(enhancedUsers);

    return this.setSuccess(200, {
      items: paginated,
      start: this.start,
      limit: this.limit,
      size: paginated.length,
      total: enhancedUsers.length,
    });
  }

  protected async getUsers(): Promise<DbUser[] | false> {
    const users = await tryber.tables.WpAppqUserToCampaign.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_evd_profile").as("profile_id"),
        tryber
          .ref("wp_user_id")
          .withSchema("wp_appq_evd_profile")
          .as("tryber_wp_id"),
        tryber.ref("name").withSchema("wp_appq_evd_profile"),
        tryber.ref("surname").withSchema("wp_appq_evd_profile"),
        tryber.ref("email").withSchema("wp_appq_evd_profile"),
        tryber
          .ref("status")
          .withSchema("wp_appq_customer_account_invitations")
          .as("invitation_status")
      )
      .join(
        "wp_appq_evd_profile",
        "wp_appq_user_to_campaign.wp_user_id",
        "wp_appq_evd_profile.wp_user_id"
      )
      .leftJoin(
        "wp_appq_customer_account_invitations",
        "wp_appq_customer_account_invitations.tester_id",
        "wp_appq_evd_profile.id"
      )
      .where("wp_appq_user_to_campaign.campaign_id", this.getCampaignId())
      .groupBy("wp_appq_evd_profile.id")
      .orderBy("wp_appq_evd_profile.id", "desc");

    if (!users) return false as const;

    return users;
  }

  private enhanceUsers(users: Awaited<ReturnType<typeof this.getUsers>>) {
    if (!users || !users.length) return [];

    return users.map((user) => ({
      id: user.tryber_wp_id,
      profile_id: user.profile_id,
      name: `${user.name} ${user.surname}`.trim(),
      email: user.email,
      invitationPending: !!(
        user.invitation_status !== null &&
        Number.parseInt(user.invitation_status) !== 1
      ),
    }));
  }

  private paginateUsers(bugs: ReturnType<typeof this.enhanceUsers>) {
    if (!this.limit) return bugs;
    return bugs.slice(this.start, this.start + this.limit);
  }

  private emptyResponse() {
    return this.setSuccess(200, {
      items: [],
      start: this.start,
      limit: this.limit,
      size: 0,
      total: 0,
    });
  }
}
