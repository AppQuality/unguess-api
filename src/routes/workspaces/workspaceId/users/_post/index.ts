/** OPENAPI-CLASS: post-workspaces-wid-users */

import { Invitation } from "@src/features/class/Invitation";
import { tryber } from "@src/features/database";
import WorkspaceRoute from "@src/features/routes/WorkspaceRoute";

type Language = "it" | "en";
export default class Route extends WorkspaceRoute<{
  response: StoplightOperations["post-workspaces-wid-users"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-workspaces-wid-users"]["parameters"]["path"];
  body: StoplightOperations["post-workspaces-wid-users"]["requestBody"]["content"]["application/json"];
}> {
  private _invitation: Invitation | undefined;
  private locale: Language = "en";
  private workspaceName: string = "workspace";

  constructor(config: RouteClassConfiguration) {
    super(config);
    const { locale } = this.getBody();
    if (this.isLocaleValid(locale)) this.locale = locale;
  }

  private isLocaleValid(locale?: string): locale is Language {
    return !!locale && ["it", "en"].includes(locale);
  }

  get invitation() {
    if (!this._invitation) throw new Error("Invitation not initialized");
    return this._invitation;
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;

    if (!this.isValidUser()) {
      this.setError(400, {} as OpenapiError);
      return false;
    }

    return true;
  }

  private isValidUser(): boolean {
    return this.getBody().email ? true : false;
  }

  protected async init() {
    await super.init();
    this.workspaceName = this.workspace?.company ?? "workspace";

    this._invitation = new Invitation({
      userToInvite: {
        email: this.getBody().email,
        name: this.getBody().name,
        surname: this.getBody().surname,
      },
      object: { name: this.workspaceName },
      email: {
        sender: this.getUser(),
        templates: this.getTemplates(),
        subjects: this.getSubjects(),
        message: this.getBody().message,
      },
      locale: this.locale,
      redirect: this.getBody().redirect_url,
    });
  }

  private getTemplates() {
    return {
      existing_user:
        this.getBody().event_name ??
        `customer_existent_invitation_${this.locale}`,
      new_user:
        this.getBody().event_name ?? `customer_invitation_${this.locale}`,
    };
  }

  private getSubjects() {
    return {
      existing_user:
        this.locale === "it"
          ? `Entra in ${this.workspaceName}`
          : `You've been invited to join ${this.workspaceName}`,
      new_user:
        this.locale === "it"
          ? `Entra in Unguess`
          : `You've been invited to join UNGUESS`,
    };
  }

  protected async prepare() {
    const alreadyInvitedUser = await this.retrieveUserAlreadyInvited();

    if (alreadyInvitedUser) {
      if (alreadyInvitedUser.type === "existing_user") {
        return this.setError(400, {
          message: "User already exists",
        } as OpenapiError);
      }

      await this.invitation.sendNewUserInvitation({
        profile_id: alreadyInvitedUser.profile_id,
      });
      return this.setSuccess(200, {
        profile_id: alreadyInvitedUser.profile_id,
        tryber_wp_user_id: alreadyInvitedUser.tryber_wp_id,
        email: alreadyInvitedUser.email,
      });
    }

    try {
      const userToAdd = await this.invitation.createAndInviteUser();
      await this.addUserToWorkspace(userToAdd);

      return this.setSuccess(200, {
        profile_id: userToAdd.profile_id,
        tryber_wp_user_id: userToAdd.tryber_wp_id,
        email: userToAdd.email,
      });
    } catch (e) {
      return this.setError(500, {
        message: "Error adding user to campaign",
      } as OpenapiError);
    }
  }

  private async retrieveUserAlreadyInvited() {
    const user = await tryber.tables.WpAppqUserToCustomer.do()
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
        "wp_appq_evd_profile.id",
        "wp_appq_customer_account_invitations.tester_id"
      )
      .where("wp_appq_user_to_customer.customer_id", this.getWorkspaceId())
      .where("wp_appq_evd_profile.email", this.getBody().email)
      .groupBy("wp_appq_evd_profile.id")
      .first();

    if (!user) return null;

    return {
      ...user,
      type: !!(
        user.invitation_status && Number.parseInt(user.invitation_status) !== 1
      )
        ? ("new_user" as const)
        : ("existing_user" as const),
    };
  }

  private async addUserToWorkspace({
    tryber_wp_id,
  }: {
    tryber_wp_id: number;
  }): Promise<void> {
    await tryber.tables.WpAppqUserToCustomer.do().insert({
      wp_user_id: tryber_wp_id,
      customer_id: this.getWorkspaceId(),
    });
  }
}
