/** OPENAPI-CLASS: get-workspaces-users */
import * as db from "@src/features/db";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import WorkspaceRoute from "@src/features/routes/WorkspaceRoute";

interface DbUser {
  tryber_wp_id: number;
  profile_id: number;
  name: string;
  surname: string;
  email: string;
  invitation_status: string;
}

export default class Route extends WorkspaceRoute<{
  response: StoplightOperations["get-workspaces-users"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-workspaces-users"]["parameters"]["path"];
  query: StoplightOperations["get-workspaces-users"]["parameters"]["query"];
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
    const users: DbUser[] = await db.query(
      `SELECT 
        p.id         as profile_id, 
        p.wp_user_id as tryber_wp_id, 
        p.name, 
        p.surname, 
        p.email,
        i.status     as invitation_status
          from wp_appq_user_to_customer utc
        JOIN wp_appq_evd_profile p ON (utc.wp_user_id = p.wp_user_id)
        LEFT JOIN wp_appq_customer_account_invitations i ON (i.tester_id = p.id)
        WHERE utc.customer_id = ${this.getWorkspaceId()}
        GROUP BY p.id
        ORDER BY p.id DESC
      `
    );

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
        user.invitation_status && Number.parseInt(user.invitation_status) !== 1
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
