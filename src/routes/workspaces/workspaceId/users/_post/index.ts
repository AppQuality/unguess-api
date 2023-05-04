/** OPENAPI-CLASS: post-workspaces-wid-users */
import WorkspaceRoute from "@src/features/routes/WorkspaceRoute";
import createTryberWPUser from "@src/features/wp/createTryberWPUser";
import createUserProfile from "@src/features/wp/createUserProfile";
import { randomString } from "@src/utils/users/getRandomString";
import crypto from "crypto";
import { sendTemplate } from "@src/features/mail/sendTemplate";
import { tryber } from "@src/features/database";

interface DbUser {
  tryber_wp_id: number;
  profile_id: number;
  name: string;
  surname: string;
  email: string;
  invitation_status: string;
}

interface InvitedUser {
  email: string;
  name?: string;
  surname?: string;
  locale?: string;
}

export default class Route extends WorkspaceRoute<{
  response: StoplightOperations["post-workspaces-wid-users"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-workspaces-wid-users"]["parameters"]["path"];
  body: StoplightOperations["post-workspaces-wid-users"]["requestBody"]["content"]["application/json"];
}> {
  private invitedUser: InvitedUser;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    this.invitedUser = this.getBody();
  }

  protected async filter(): Promise<boolean> {
    if (!super.filter()) return false;

    if (!this.isValidUser()) {
      this.setError(400, {} as OpenapiError);
      return false;
    }
    return true;
  }

  protected async prepare() {
    const users = await this.getUsers();
    const userInWorkspace = users.find(
      (u) => u.email === this.invitedUser.email
    );

    if (userInWorkspace) {
      const pendingInvite =
        userInWorkspace.invitation_status &&
        Number.parseInt(userInWorkspace.invitation_status) !== 1;

      if (pendingInvite) {
        await this.sendInvitation({
          email: userInWorkspace.email,
          profile_id: userInWorkspace.profile_id,
          locale: this.invitedUser.locale || "en",
        });

        return this.setSuccess(200, {
          profile_id: userInWorkspace.profile_id,
          tryber_wp_user_id: userInWorkspace.tryber_wp_id,
          email: userInWorkspace.email,
        });
      } else {
        // user already exists in the workspace
        return this.setError(400, {
          message: "User already exists",
        } as OpenapiError);
      }
    }

    const userExists = await this.getUserByEmail(this.invitedUser.email);
    let userToAdd: DbUser = userExists;

    try {
      if (!userToAdd) {
        userToAdd = await this.createUser(this.invitedUser);

        await this.sendInvitation({
          email: userToAdd.email,
          profile_id: userToAdd.profile_id,
          locale: this.invitedUser.locale || "en",
        });
      }

      await this.addUserToWorkspace(userToAdd);
      return this.setSuccess(200, {
        profile_id: userToAdd.profile_id,
        tryber_wp_user_id: userToAdd.tryber_wp_id,
        email: userToAdd.email,
      });
    } catch (e) {
      if (!userExists) this.removeCreatedUser(this.invitedUser.email);

      return this.setError(500, {
        message: "Error adding user to workspace",
      } as OpenapiError);
    }
  }

  private async addUserToWorkspace(user: DbUser): Promise<void> {
    const { tryber_wp_id } = user;

    await tryber.tables.WpAppqUserToCustomer.do().insert({
      wp_user_id: tryber_wp_id,
      customer_id: this.getWorkspaceId(),
    });
  }

  private async removeCreatedUser(email: string): Promise<void> {
    const user = await this.getUserByEmail(this.invitedUser.email);

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

  private async createUser(invitedUser: InvitedUser): Promise<DbUser> {
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
        "wp_appq_evd_profile.id",
        "wp_appq_customer_account_invitations.tester_id"
      )
      .where("wp_appq_user_to_customer.customer_id", this.getWorkspaceId())
      .groupBy("wp_appq_evd_profile.id");

    if (!users) return [];

    return users;
  }

  protected async sendInvitation({
    email,
    profile_id,
    locale,
  }: {
    email: string;
    profile_id: number;
    locale: string;
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

    const subj =
      locale === "it"
        ? `Entra in Unguess`
        : `You've been invited to join UNGUESS`;
    const sender = this.getUser();

    await sendTemplate({
      template: `customer_invitation_${locale}`,
      email: email,
      subject: subj,
      optionalFields: {
        "{Inviter.name}": sender.email,
        "{Inviter.email}": sender.email,
        "{Inviter.url}": `${process.env.APP_URL}/invites/${profile_id}/${token}`,
      },
    });
  }

  protected isValidUser(): boolean {
    if (!this.invitedUser) return false;

    const { email } = this.invitedUser;
    if (!email) return false;

    return true;
  }
}
