/** OPENAPI-CLASS: delete-workspaces-wid-users */
import WorkspaceRoute from "@src/features/routes/WorkspaceRoute";
import * as db from "@src/features/db";

interface DbUser {
  tryber_wp_id: number;
  profile_id: number;
  name: string;
  surname: string;
  email: string;
  invitation_status: string;
}

export default class Route extends WorkspaceRoute<{
  response: StoplightOperations["delete-workspaces-wid-users"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["delete-workspaces-wid-users"]["parameters"]["path"];
  body: StoplightOperations["delete-workspaces-wid-users"]["requestBody"]["content"]["application/json"];
}> {
  private userToRemoveWpId: number;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    this.userToRemoveWpId = this.getBody().user_id;
  }

  protected async prepare() {
    const users = await this.getUsers();
    const userExistsInWorkspace = users.find(
      (u) => u.tryber_wp_id === this.userToRemoveWpId
    );

    if (!userExistsInWorkspace) {
      // user already exists in the workspace
      return this.setError(400, {
        message: "We cannot remove the user from workspace",
      } as OpenapiError);
    }

    try {
      await this.removeUserFromWorkspace();

      const newUserList = await this.getUsers();
      const userListEnhanced = this.enhanceUsers(newUserList);

      return this.setSuccess(200, {
        items: userListEnhanced,
      });
    } catch (e) {
      return this.setError(500, {
        message: "Something went wrongF",
      } as OpenapiError);
    }
  }

  private async removeUserFromWorkspace() {
    const response = await db.query(
      db.format(
        `DELETE FROM wp_appq_user_to_customer WHERE wp_user_id = ? AND customer_id = ?`,
        [this.userToRemoveWpId, this.getWorkspaceId()]
      )
    );

    if (!response) throw new Error("Something went wrong");
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

  protected async getUsers(): Promise<DbUser[]> {
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

    if (!users) return [];

    return users;
  }
}
