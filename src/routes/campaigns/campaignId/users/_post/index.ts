/** OPENAPI-CLASS: post-campaign-cid-users */
import createTryberWPUser from "@src/features/wp/createTryberWPUser";
import createUserProfile from "@src/features/wp/createUserProfile";
import { randomString } from "@src/utils/users/getRandomString";
import crypto from "crypto";
import { sendTemplate } from "@src/features/mail/sendTemplate";
import { tryber } from "@src/features/database";
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
  response: StoplightOperations["post-campaign-cid-users"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-campaign-cid-users"]["parameters"]["path"];
  body: StoplightOperations["post-campaign-cid-users"]["requestBody"]["content"]["application/json"];
}> {
  protected newUser: DbUser | undefined;
  protected isPending: boolean = false;

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
    const users = await this.getUsers();
    const userInCampaign = users.find((u) => u.email === this.getBody().email);

    if (userInCampaign) {
      this.isPending = !!(
        userInCampaign.invitation_status &&
        Number.parseInt(userInCampaign.invitation_status) !== 1
      );

      if (this.isPending) {
        await this.sendInvitation({
          email: userInCampaign.email,
          profile_id: userInCampaign.profile_id,
        });

        return this.setSuccess(200, {
          profile_id: userInCampaign.profile_id,
          tryber_wp_user_id: userInCampaign.tryber_wp_id,
          email: userInCampaign.email,
        });
      } else {
        // user already exists in the campaign
        return this.setError(400, {
          message: "User already exists",
        } as OpenapiError);
      }
    }

    const userExists = await this.getUserByEmail(this.getBody().email);
    let userToAdd: DbUser = userExists;

    try {
      if (!userToAdd) {
        userToAdd = await this.createUser(this.getBody());
        this.newUser = userToAdd;

        await this.sendInvitation({
          email: userToAdd.email,
          profile_id: userToAdd.profile_id,
        });
      } else {
        this.notifyUser(userExists.email);
      }

      await this.addUserToCampaign(userToAdd);
      return this.setSuccess(200, {
        profile_id: userToAdd.profile_id,
        tryber_wp_user_id: userToAdd.tryber_wp_id,
        email: userToAdd.email,
      });
    } catch (e) {
      if (!userExists) this.removeCreatedUser(this.getBody().email);

      return this.setError(500, {
        message: "Error adding user to campaign",
      } as OpenapiError);
    }
  }

  private async addUserToCampaign(user: DbUser): Promise<void> {
    const { tryber_wp_id } = user;

    await tryber.tables.WpAppqUserToCampaign.do().insert({
      wp_user_id: tryber_wp_id,
      campaign_id: this.getCampaignId(),
    });
  }

  private async removeCreatedUser(email: string): Promise<void> {
    const user = await this.getUserByEmail(this.getBody().email);

    if (user) {
      await tryber.tables.WpAppqUserToCustomer.do().delete().where({
        wp_user_id: user.tryber_wp_id,
      });
    }

    // Remove user profiles (if any)
    await tryber.tables.WpUsers.do().delete().where({
      user_email: email,
    });

    await tryber.tables.WpAppqEvdProfile.do().delete().where({
      email: email,
    });
  }

  private async getUserByEmail(email: string): Promise<any> {
    const alreadyRegisteredEmail = await tryber.tables.WpUsers.do()
      .select(
        tryber.ref("ID").withSchema("wp_users").as("tryber_wp_id"),
        tryber.ref("id").withSchema("wp_appq_evd_profile").as("profile_id"),
        tryber.ref("name").withSchema("wp_appq_evd_profile"),
        tryber.ref("surname").withSchema("wp_appq_evd_profile"),
        tryber.ref("email").withSchema("wp_appq_evd_profile")
      )
      .join(
        "wp_appq_evd_profile",
        "wp_users.ID",
        "wp_appq_evd_profile.wp_user_id"
      )
      .where({
        user_email: email,
      });

    return alreadyRegisteredEmail.length
      ? {
          ...alreadyRegisteredEmail[0],
          invitation_status: "1",
        }
      : null;
  }

  private async createUser(
    invitedUser: StoplightOperations["post-campaign-cid-users"]["requestBody"]["content"]["application/json"]
  ): Promise<DbUser> {
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

  protected async getUsers(): Promise<DbUser[]> {
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
      .groupBy("wp_appq_evd_profile.id");

    if (!users) return [];

    return users;
  }

  protected async sendInvitation({
    email,
    profile_id,
  }: {
    email: string;
    profile_id: number;
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

    await this.notifyUser(email, {
      "{Inviter.url}": `${process.env.APP_URL}/invites/${profile_id}/${token}`,
    });
  }

  private async notifyUser(email: string, params?: { [key: string]: string }) {
    const sender = this.getUser();

    await sendTemplate({
      email: email,
      template: this.getEmailEvent(),
      subject: this.getEmailSubject(),
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

  private getEmailSubject() {
    const locale = this.getBody()?.locale ?? "en";

    if (this.newUser || this.isPending) {
      return locale === "it"
        ? `Entra in Unguess`
        : `You've been invited to join UNGUESS`;
    }

    return locale === "it"
      ? `Entra in ${this.campaignName}`
      : `You've been invited to join ${this.campaignName}`;
  }

  private getEmailEvent() {
    const body = this.getBody();
    const defaultEvent =
      this.newUser || this.isPending
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
