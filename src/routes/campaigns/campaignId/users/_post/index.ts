/** OPENAPI-CLASS: post-campaign-cid-users */
import { tryber } from "@src/features/database";
import { sendTemplate } from "@src/features/mail/sendTemplate";
import CampaignRoute from "@src/features/routes/CampaignRoute";
import createTryberWPUser from "@src/features/wp/createTryberWPUser";
import createUserProfile from "@src/features/wp/createUserProfile";
import { randomString } from "@src/utils/users/getRandomString";
import crypto from "crypto";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["post-campaign-cid-users"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-campaign-cid-users"]["parameters"]["path"];
  body: StoplightOperations["post-campaign-cid-users"]["requestBody"]["content"]["application/json"];
}> {
  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) {
      return false;
    }

    if (!this.isValidUser()) {
      this.setError(400, {} as OpenapiError);
      return false;
    }

    return true;
  }

  protected async prepare() {
    const userInCampaign = await this.retrieveUserAlreadyInvited();

    if (userInCampaign) {
      return this.prepareUserAlreadyInvited(userInCampaign);
    }

    try {
      const userToAdd = await this.getUserToAdd();
      if (userToAdd.newUser) {
        await this.sendInvitation({
          email: userToAdd.email,
          profile_id: userToAdd.profile_id,
          type: "new_user",
        });
      } else {
        const userHasPendingInvitation =
          userToAdd.invitation_status &&
          Number(userToAdd.invitation_status) === 0;
        this.notifyUser({
          email: userToAdd.email,
          type: userHasPendingInvitation ? "new_user" : "existing_user",
        });
      }
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

  private async prepareUserAlreadyInvited(userInCampaign: {
    profile_id: number;
    tryber_wp_id: number;
    email: string;
    invitation_status: string;
  }) {
    try {
      await this.resendEmail(userInCampaign);
    } catch (e) {
      return this.setError(400, {
        message: "User already exists",
      } as OpenapiError);
    }

    return this.setSuccess(200, {
      profile_id: userInCampaign.profile_id,
      tryber_wp_user_id: userInCampaign.tryber_wp_id,
      email: userInCampaign.email,
    });
  }

  private async getUserToAdd() {
    const userExists = await this.getUserByEmail();
    if (userExists) {
      return { ...userExists, newUser: false };
    }

    try {
      const userToAdd = await this.createUser(this.getBody());
      return { ...userToAdd, newUser: true };
    } catch (e) {
      this.removeCreatedUser();
      throw e;
    }
  }

  private async resendEmail(userInCampaign: {
    profile_id: number;
    tryber_wp_id: number;
    email: string;
    invitation_status: string;
  }) {
    if (
      !(
        userInCampaign.invitation_status &&
        Number.parseInt(userInCampaign.invitation_status) !== 1
      )
    ) {
      throw new Error("User already exists");
    }

    await this.sendInvitation({
      email: userInCampaign.email,
      profile_id: userInCampaign.profile_id,
      type: !!(
        userInCampaign.invitation_status &&
        Number.parseInt(userInCampaign.invitation_status) !== 1
      )
        ? "new_user"
        : "existing_user",
    });
  }

  private async retrieveUserAlreadyInvited() {
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
        "wp_appq_evd_profile.id",
        "wp_appq_customer_account_invitations.tester_id"
      )
      .where("wp_appq_user_to_campaign.campaign_id", this.getCampaignId())
      .where("wp_appq_evd_profile.email", this.getBody().email)
      .groupBy("wp_appq_evd_profile.id")
      .first();

    return users;
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

  private async removeCreatedUser() {
    const user = await this.getUserByEmail();

    if (user) {
      await tryber.tables.WpAppqUserToCustomer.do().delete().where({
        wp_user_id: user.tryber_wp_id,
      });
    }

    // Remove user profiles (if any)
    await tryber.tables.WpUsers.do().delete().where({
      user_email: this.getBody().email,
    });

    await tryber.tables.WpAppqEvdProfile.do().delete().where({
      email: this.getBody().email,
    });
  }

  private async getUserByEmail() {
    const alreadyRegisteredEmail = await tryber.tables.WpUsers.do()
      .select(
        tryber.ref("ID").withSchema("wp_users").as("tryber_wp_id"),
        tryber.ref("id").withSchema("wp_appq_evd_profile").as("profile_id"),
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
        "wp_users.ID",
        "wp_appq_evd_profile.wp_user_id"
      )
      .leftJoin(
        "wp_appq_customer_account_invitations",
        "wp_appq_evd_profile.id",
        "wp_appq_customer_account_invitations.tester_id"
      )
      .where({
        user_email: this.getBody().email,
      })
      .first();

    return alreadyRegisteredEmail;
  }

  private async createUser(invitedUser: {
    email: string;
    name?: string;
    surname?: string;
  }) {
    const { email, name = "", surname = "" } = invitedUser;
    const psw = randomString(12);
    const username =
      name && surname ? `${name}-${surname}` : email.split("@")[0];

    const tryber_wp_id = await createTryberWPUser(username, email, psw);

    const profile = await createUserProfile({
      tryber_wp_id,
      name,
      surname,
      email,
    });

    if (!profile) throw new Error("Error creating user profile");

    return {
      tryber_wp_id,
      profile_id: profile.profile_id,
      name,
      surname,
      email,
      invitation_status: "0",
    };
  }

  protected async sendInvitation({
    email,
    profile_id,
    type = "new_user",
  }: {
    email: string;
    profile_id: number;
    type?: "new_user" | "existing_user";
  }): Promise<void> {
    const token = crypto
      .createHash("sha256")
      .update(`${profile_id}_AppQ`)
      .digest("hex");

    await tryber.tables.WpAppqCustomerAccountInvitations.do()
      .insert({
        tester_id: profile_id,
        status: "0",
        token: token,
      })
      .onConflict("tester_id")
      .merge();

    await this.notifyUser({
      email,
      type,
      params: {
        "{Inviter.url}": `${this.getBaseURL()}/invites/${profile_id}/${token}`,
      },
    });
  }

  private getBaseURL() {
    const locale =
      this.getBody().locale && this.getBody().locale !== "en"
        ? `/${this.getBody().locale}`
        : "";

    return `${process.env.APP_URL}${locale}`;
  }

  private async notifyUser({
    email,
    type = "new_user",
    params = {},
  }: {
    email: string;
    type?: "new_user" | "existing_user";
    params?: { [key: string]: string };
  }) {
    const sender = this.getUser();

    await sendTemplate({
      email: email,
      template: this.getEmailEvent(type),
      subject: this.getEmailSubject(type),
      optionalFields: {
        "{Inviter.name}": sender.email,
        "{Inviter.email}": sender.email,
        "{Inviter.subject}": this.campaignName ?? "campaign",
        "{Inviter.redirectUrl}": this.getEmailRedirectUrl(),
        "{Inviter.inviteText}": this.getBody()?.message ?? "",
        ...params, // additional fields
      },
    });
  }

  private getEmailSubject(type: "new_user" | "existing_user") {
    const locale = this.getBody()?.locale ?? "en";

    if (type === "new_user") {
      return locale === "it"
        ? `Entra in Unguess`
        : `You've been invited to join UNGUESS`;
    }

    return locale === "it"
      ? `Entra in ${this.campaignName}`
      : `You've been invited to join ${this.campaignName}`;
  }

  private getEmailEvent(type: "new_user" | "existing_user") {
    const body = this.getBody();
    const defaultEvent =
      type === "new_user"
        ? "campaign_invitation"
        : "campaign_existent_invitation";

    return body.event_name ?? `${defaultEvent}_${body.locale ?? "en"}`;
  }

  private getEmailRedirectUrl() {
    return this.getBody().redirect_url ?? process.env.APP_URL;
  }

  protected isValidUser(): boolean {
    if (!this.getBody()) return false;

    const { email } = this.getBody();
    if (!email) return false;

    return true;
  }
}
