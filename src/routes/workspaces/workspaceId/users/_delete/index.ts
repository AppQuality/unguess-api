/** OPENAPI-CLASS: delete-workspaces-wid-users */
import WorkspaceRoute from "@src/features/routes/WorkspaceRoute";
import { tryber } from "@src/features/database";

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
    const response = await tryber.tables.WpAppqUserToCustomer.do()
      .delete()
      .where({
        wp_user_id: this.userToRemoveWpId,
        customer_id: this.getWorkspaceId(),
      });

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
        user.invitation_status !== null &&
        Number.parseInt(user.invitation_status) !== 1
      ),
    }));
  }

  protected async getUsers(): Promise<DbUser[]> {
    const users = await tryber.tables.WpAppqUserToCustomer.do()
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
        "wp_appq_user_to_customer.wp_user_id",
        "wp_appq_evd_profile.wp_user_id"
      )
      .leftJoin(
        "wp_appq_customer_account_invitations",
        "wp_appq_customer_account_invitations.tester_id",
        "wp_appq_evd_profile.id"
      )
      .where("wp_appq_user_to_customer.customer_id", this.getWorkspaceId())
      .groupBy("wp_appq_evd_profile.id")
      .orderBy("wp_appq_evd_profile.id", "desc");

    if (!users) return [];

    return users;
  }
}
