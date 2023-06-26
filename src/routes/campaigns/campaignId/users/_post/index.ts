/** OPENAPI-CLASS: post-campaign-cid-users */
import { Invitation } from "@src/features/class/Invitation";
import { tryber } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["post-campaign-cid-users"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-campaign-cid-users"]["parameters"]["path"];
  body: StoplightOperations["post-campaign-cid-users"]["requestBody"]["content"]["application/json"];
}> {
  private _invitation: Invitation | undefined;
  private locale: Language = "en";

  constructor(config: RouteClassConfiguration) {
    super(config);
    const { locale } = this.getBody();
    if (this.isLocaleValid(locale)) this.locale = locale;
  }

  protected async init() {
    await super.init();

    this._invitation = new Invitation({
      userToInvite: {
        email: this.getBody().email,
        name: this.getBody().name,
        surname: this.getBody().surname,
      },
      object: { name: this.campaignName },
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
        `campaign_existent_invitation_${this.locale}`,
      new_user:
        this.getBody().event_name ?? `campaign_invitation_${this.locale}`,
    };
  }

  private getSubjects() {
    return {
      existing_user:
        this.locale === "it"
          ? `Entra in ${this.campaignName}`
          : `You've been invited to join ${this.campaignName}`,
      new_user:
        this.locale === "it"
          ? `Entra in Unguess`
          : `You've been invited to join UNGUESS`,
    };
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
      await this.addUserToCampaign(userToAdd);

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
    const user = await tryber.tables.WpAppqUserToCampaign.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_evd_profile").as("profile_id"),
        tryber
          .ref("wp_user_id")
          .withSchema("wp_appq_evd_profile")
          .as("tryber_wp_id"),
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
        "wp_appq_evd_profile.id",
        "wp_appq_customer_account_invitations.tester_id"
      )
      .where("wp_appq_user_to_campaign.campaign_id", this.getCampaignId())
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

  private async addUserToCampaign({
    tryber_wp_id,
  }: {
    tryber_wp_id: number;
  }): Promise<void> {
    await tryber.tables.WpAppqUserToCampaign.do().insert({
      wp_user_id: tryber_wp_id,
      campaign_id: this.getCampaignId(),
    });
  }
}
